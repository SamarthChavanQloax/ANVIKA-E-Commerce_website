import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Cart from '../models/Cart.js';
import { reduceOrderStock, restoreOrderStock } from './paymentController.js';

// Helper: Calculate shipping fee based on subtotal
export const calculateShippingFee = (subtotal = 0) => {
  // Free shipping on orders over ₹1500, else ₹99 standard shipping
  if (subtotal >= 1500 || subtotal === 0) return 0;
  return 99;
};

// @desc    Create new order with backend-authoritative calculation
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res, next) => {
  try {
    const {
      orderItems,
      items, // alias
      shippingAddress,
      paymentMethod = 'Razorpay',
      couponCode,
    } = req.body;

    const rawItems = orderItems || items || [];

    if (!rawItems || rawItems.length === 0) {
      res.status(400);
      throw new Error('No order items provided in request');
    }

    if (!shippingAddress || !shippingAddress.city || !shippingAddress.postalCode) {
      res.status(400);
      throw new Error('Valid shipping address (city and postalCode) is required');
    }

    // 1. Backend-Authoritative Item Verification & Subtotal Calculation
    let calculatedSubtotal = 0;
    const resolvedItems = [];

    for (const item of rawItems) {
      const prodId = item.product || item._id;
      if (!prodId || !mongoose.Types.ObjectId.isValid(prodId)) {
        res.status(400);
        throw new Error(`Invalid product ID in checkout item: ${item.name || 'Unknown'}`);
      }

      const product = await Product.findById(prodId);
      if (!product || !product.isActive) {
        res.status(404);
        throw new Error(`Product "${item.name || prodId}" is no longer available`);
      }

      const qty = Math.max(1, parseInt(item.quantity || item.qty || 1, 10));

      // Resolve variant price and stock
      const requestedSize = item.size || item.variant?.size;
      const requestedColor = item.color || item.variant?.color;
      let unitPrice = product.price;
      let availableStock = product.stock;
      let matchedVariant = null;

      if (product.variants && product.variants.length > 0) {
        matchedVariant = product.variants.find((v) => {
          const matchSize = !requestedSize || (v.size && v.size.toLowerCase() === requestedSize.toLowerCase());
          const matchColor = !requestedColor || (v.color && v.color.toLowerCase() === requestedColor.toLowerCase());
          return matchSize && matchColor;
        });

        if (matchedVariant) {
          unitPrice = matchedVariant.price || product.price;
          availableStock = matchedVariant.stock !== undefined ? matchedVariant.stock : product.stock;
        } else if (product.variants[0]) {
          // Fallback to first variant if specific variant not matched
          unitPrice = product.variants[0].price || product.price;
          availableStock = product.variants[0].stock !== undefined ? product.variants[0].stock : product.stock;
        }
      }

      // Stock check
      if (availableStock < qty) {
        res.status(400);
        throw new Error(`Insufficient stock for "${product.name}". Only ${availableStock} available.`);
      }

      const itemTotal = unitPrice * qty;
      calculatedSubtotal += itemTotal;

      resolvedItems.push({
        product: product._id,
        name: product.name,
        image: item.image || product.image || (product.images && product.images[0]) || '/placeholder.jpg',
        price: unitPrice,
        qty,
        quantity: qty,
        variant: {
          size: requestedSize || matchedVariant?.size || 'Free Size',
          color: requestedColor || matchedVariant?.color || '',
        },
        size: requestedSize || matchedVariant?.size || 'Free Size',
        color: requestedColor || matchedVariant?.color || '',
      });
    }

    // 2. Coupon Validation & Discount
    let discountAmount = 0;
    let appliedCouponCode = null;

    if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
      const cleanCode = couponCode.trim().toUpperCase();
      const coupon = await Coupon.findOne({ code: cleanCode });

      if (coupon) {
        const validity = coupon.isValid(calculatedSubtotal);
        if (validity.valid) {
          discountAmount = coupon.calculateDiscount(calculatedSubtotal);
          appliedCouponCode = coupon.code;
          // Increment coupon used count
          coupon.usedCount = (coupon.usedCount || 0) + 1;
          await coupon.save();
        }
      }
    }

    // 3. Shipping Fee & Final Total
    const shippingFee = calculateShippingFee(calculatedSubtotal);
    const finalTotal = Math.max(0, Math.round((calculatedSubtotal - discountAmount + shippingFee) * 100) / 100);

    // 4. Initial Statuses
    const isRazorpay = paymentMethod.toUpperCase() === 'RAZORPAY';
    const isCOD = paymentMethod.toUpperCase() === 'COD' || paymentMethod.toUpperCase() === 'CASH ON DELIVERY';
    const initialOrderStatus = isRazorpay ? 'Pending' : 'Placed';
    const initialPaymentStatus = 'Pending';

    // 5. Create Order
    const order = new Order({
      user: req.user._id,
      customer: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || shippingAddress.phone || '',
      },
      items: resolvedItems,
      orderItems: resolvedItems,
      shippingAddress: {
        fullName: shippingAddress.fullName || req.user.name,
        phone: shippingAddress.phone || req.user.phone || '',
        street: shippingAddress.street || shippingAddress.addressLine || '',
        addressLine: shippingAddress.addressLine || shippingAddress.street || '',
        city: shippingAddress.city,
        state: shippingAddress.state || '',
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || 'India',
      },
      paymentMethod,
      orderStatus: initialOrderStatus,
      paymentStatus: initialPaymentStatus,
      isPaid: false,
      isDelivered: false,
      subtotal: calculatedSubtotal,
      discount: discountAmount,
      shipping: shippingFee,
      shippingFee,
      total: finalTotal,
      totalAmount: finalTotal,
      trackingNumber: `ANV-EXP-${Date.now().toString().slice(-6).toUpperCase()}`,
      courierPartner: 'BlueDart Luxury Express',
      estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      statusHistory: [
        {
          status: initialOrderStatus,
          timestamp: new Date(),
          note: isRazorpay ? 'Order initialized, awaiting payment' : 'Order placed successfully with Cash on Delivery',
        },
      ],
      coupon: appliedCouponCode ? { code: appliedCouponCode, discount: discountAmount } : undefined,
    });

    const savedOrder = await order.save();

    // 6. If not Razorpay pending payment (e.g. COD or direct testing methods), reduce stock immediately and clear cart
    if (!isRazorpay) {
      await reduceOrderStock(savedOrder);
      try {
        await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], subtotal: 0 });
      } catch (e) {
        console.warn('Cart clear error on direct checkout:', e.message);
      }
    }

    res.status(201).json(savedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Role check: customer sees only their order, admin sees any
    const orderOwnerId = order.user?._id?.toString() || order.user?.toString();
    const currentUserId = req.user._id.toString();

    if (req.user.role !== 'admin' && orderOwnerId !== currentUserId) {
      res.status(403);
      throw new Error('Not authorized to access this order');
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders (Customer sees own, Admin sees all with filter support)
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res, next) => {
  try {
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isAdmin) {
      // Customer: return only their orders
      const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
      return res.status(200).json(orders);
    }

    // Admin: support filters
    const { status, paymentStatus, startDate, endDate, search, limit = 100, page = 1 } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.orderStatus = status;
    }
    if (paymentStatus && paymentStatus !== 'all') {
      filter.paymentStatus = paymentStatus;
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      orders,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order & restore stock
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const orderOwnerId = order.user?._id?.toString() || order.user?.toString();
    const currentUserId = req.user._id.toString();

    if (req.user.role !== 'admin' && orderOwnerId !== currentUserId) {
      res.status(403);
      throw new Error('Not authorized to cancel this order');
    }

    const nonCancellable = ['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned', 'Refunded'];
    if (nonCancellable.includes(order.orderStatus)) {
      res.status(400);
      throw new Error(`Cannot cancel order in "${order.orderStatus}" state`);
    }

    // Restore stock if the order was paid or placed as COD
    const stockWasDeducted = order.isPaid || order.paymentMethod === 'COD' || order.orderStatus === 'Placed' || order.orderStatus === 'Confirmed';
    if (stockWasDeducted) {
      await restoreOrderStock(order);
    }

    order.orderStatus = 'Cancelled';
    order.cancelledAt = new Date();
    if (order.isPaid || order.paymentStatus === 'Completed') {
      order.paymentStatus = 'Refunded';
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully and inventory restored',
      order: updatedOrder,
      reason: reason || 'Customer requested cancellation',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update order status with transition validation & inventory handling
// @route   PUT /api/admin/orders/:id/status OR PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus, reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const previousStatus = order.orderStatus;
    const newStatus = status || order.orderStatus;

    // Validate valid status enum
    const validStatuses = [
      'Pending',
      'Placed',
      'Confirmed',
      'Processing',
      'Packed',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
      'Returned',
      'Refunded',
    ];

    if (status && !validStatuses.includes(status)) {
      res.status(400);
      throw new Error(`Invalid status "${status}". Allowed values: ${validStatuses.join(', ')}`);
    }

    // Inventory handling on status change
    // If order was cancelled or returned, restore stock
    if ((newStatus === 'Cancelled' || newStatus === 'Returned' || newStatus === 'Refunded') &&
        previousStatus !== 'Cancelled' && previousStatus !== 'Returned' && previousStatus !== 'Refunded') {
      await restoreOrderStock(order);
      if (order.isPaid || order.paymentStatus === 'Completed') {
        order.paymentStatus = 'Refunded';
      }
      if (newStatus === 'Cancelled') order.cancelledAt = new Date();
      if (newStatus === 'Returned') order.returnedAt = new Date();
    }

    // If order was previously cancelled and is now reactivated to confirmed/placed
    if ((previousStatus === 'Cancelled' || previousStatus === 'Returned') &&
        (newStatus === 'Confirmed' || newStatus === 'Processing' || newStatus === 'Placed')) {
      await reduceOrderStock(order);
    }

    if (newStatus === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
      if (order.paymentMethod === 'COD') {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentStatus = 'Completed';
      }
    }

    order.orderStatus = newStatus;

    if (!order.trackingNumber) {
      order.trackingNumber = `ANV-EXP-${order._id.toString().slice(-6).toUpperCase()}`;
    }
    if (!order.courierPartner) {
      order.courierPartner = 'BlueDart Luxury Express';
    }
    if (!order.estimatedDelivery) {
      order.estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    }
    if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;
    if (req.body.courierPartner) order.courierPartner = req.body.courierPartner;
    if (req.body.estimatedDelivery) order.estimatedDelivery = req.body.estimatedDelivery;

    if (!Array.isArray(order.statusHistory)) {
      order.statusHistory = [];
    }
    if (newStatus !== previousStatus) {
      order.statusHistory.push({
        status: newStatus,
        timestamp: new Date(),
        note: req.body.note || `Order status updated to ${newStatus}`,
      });
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
      if (paymentStatus === 'Completed') {
        order.isPaid = true;
        if (!order.paidAt) order.paidAt = new Date();
      }
    }

    const updated = await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated from ${previousStatus} to ${newStatus}`,
      order: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order to paid (Compatibility endpoint)
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentStatus = 'Completed';
    order.orderStatus = 'Confirmed';

    if (req.body.paymentResult) {
      order.paymentResult = {
        id: req.body.paymentResult.id || req.body.id,
        status: req.body.paymentResult.status || req.body.status,
        update_time: req.body.paymentResult.update_time || new Date().toISOString(),
        email_address: req.body.paymentResult.email_address || req.body.payer?.email_address,
      };
    }

    // Reduce stock if not already reduced
    await reduceOrderStock(order);

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order dashboard analytics summary
// @route   GET /api/orders/summary
// @access  Private/Admin
export const getOrderSummary = async (req, res, next) => {
  try {
    const ordersCount = await Order.countDocuments();
    const paidOrdersCount = await Order.countDocuments({ isPaid: true });
    const deliveredOrdersCount = await Order.countDocuments({ isDelivered: true });
    const pendingOrdersCount = await Order.countDocuments({ orderStatus: { $in: ['Placed', 'Confirmed', 'Pending', 'Processing'] } });

    // Total sales
    const salesData = await Order.aggregate([
      { $match: { orderStatus: { $nin: ['Cancelled', 'Returned', 'Refunded'] } } },
      { $group: { _id: null, totalSales: { $sum: '$total' } } },
    ]);
    const totalSales = salesData.length > 0 ? salesData[0].totalSales : 0;

    // Daily sales trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, orderStatus: { $nin: ['Cancelled', 'Returned', 'Refunded'] } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Recent 5 orders
    const recentOrders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      totalOrders: ordersCount,
      totalSales,
      paidOrders: paidOrdersCount,
      deliveredOrders: deliveredOrdersCount,
      pendingOrders: pendingOrdersCount,
      dailyOrders,
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};
