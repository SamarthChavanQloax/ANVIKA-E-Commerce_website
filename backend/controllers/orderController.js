<<<<<<< HEAD
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import Payment from '../models/Payment.js';
import { calculateCouponDiscount, calculateShipping, decrementInventory, findValidCoupon, getCheckoutItems, restoreInventory } from '../utils/orderUtils.js';

const normalizeAddress = (address = {}) => {
  const normalized = {
    street: String(address.street || '').trim(),
    city: String(address.city || '').trim(),
    state: String(address.state || '').trim(),
    postalCode: String(address.postalCode || '').trim(),
    country: String(address.country || 'India').trim(),
  };
  if (Object.values(normalized).some((value) => !value)) {
    throw Object.assign(new Error('Complete shipping address is required'), { statusCode: 400 });
  }
  return normalized;
};

export const createOrder = async (req, res, next) => {
  let reservedItems = [];
  try {
    const items = await getCheckoutItems(req.body.items);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const coupon = await findValidCoupon(req.body.couponCode, subtotal);
    const discount = calculateCouponDiscount(coupon, subtotal);
    const shippingFee = calculateShipping(subtotal - discount);
    const totalAmount = Math.max(0, subtotal - discount + shippingFee);

    const paymentMethod = String(req.body.paymentMethod || 'cod').toLowerCase();
    if (!['cod', 'razorpay'].includes(paymentMethod)) {
      throw Object.assign(new Error('Unsupported payment method'), { statusCode: 400 });
    }
    if (paymentMethod === 'razorpay' && (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET)) {
      throw Object.assign(new Error('Online payment is not configured. Use cash on delivery or configure Razorpay.'), { statusCode: 503 });
    }
    if (paymentMethod === 'cod') reservedItems = await decrementInventory(items);
    const paymentStatus = 'Pending';
    const order = await Order.create({
      user: req.user._id,
      items: items.map((item) => ({
        product: item.product._id,
        productName: item.productName,
        productImage: item.productImage,
        variant: item.variant,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.price,
      })),
      shippingAddress: normalizeAddress(req.body.shippingAddress),
      paymentMethod,
      paymentStatus,
      orderStatus: paymentMethod === 'cod' ? 'Confirmed' : 'Pending',
      subtotal,
      discount,
      shippingFee,
      totalAmount,
      coupon: coupon?._id,
      inventoryReduced: paymentMethod === 'cod',
    });

    if (coupon && paymentMethod === 'cod') await Coupon.updateOne({ _id: coupon._id }, { $inc: { usageCount: 1 } });
    const payment = await Payment.create({ order: order._id, user: req.user._id, amount: totalAmount, provider: 'manual', status: paymentMethod === 'cod' ? 'captured' : 'created' });
    order.payment = payment._id;
    await order.save();

    res.status(201).json(await Order.findById(order._id).populate('items.product', 'name image stock').populate('user', 'name email'));
  } catch (error) {
    if (reservedItems.length) await restoreInventory(reservedItems);
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('items.product', 'name image'));
  } catch (error) { next(error); }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name image stock').populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (String(order.user._id || order.user) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized to view this order' });
    res.json(order);
  } catch (error) { next(error); }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!['Pending', 'Confirmed', 'Processing'].includes(order.orderStatus)) return res.status(400).json({ message: 'This order can no longer be cancelled' });
    if (order.inventoryReduced && !order.inventoryReleased) {
      await restoreInventory(order.items.map((item) => ({ product: item.product, quantity: item.quantity })));
      order.inventoryReleased = true;
    }
    order.orderStatus = 'Cancelled';
    order.paymentStatus = order.paymentStatus === 'Paid' ? 'Refunded' : order.paymentStatus;
    await order.save();
    res.json(order);
  } catch (error) { next(error); }
};

export const getAdminOrders = async (req, res, next) => {
  try {
    const filter = req.query.status ? { orderStatus: req.query.status } : {};
    res.json(await Order.find(filter).sort({ createdAt: -1 }).populate('user', 'name email').populate('items.product', 'name image stock'));
  } catch (error) { next(error); }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const allowed = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned', 'Refunded'];
    const { status } = req.body;
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid order status' });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (['Delivered', 'Cancelled', 'Returned', 'Refunded'].includes(order.orderStatus) && order.orderStatus !== status) return res.status(400).json({ message: 'Terminal order status cannot be changed' });
    if (['Cancelled', 'Returned', 'Refunded'].includes(status) && order.inventoryReduced && !order.inventoryReleased) {
      await restoreInventory(order.items.map((item) => ({ product: item.product, quantity: item.quantity })));
      order.inventoryReleased = true;
    }
    order.orderStatus = status;
    if (status === 'Refunded') order.paymentStatus = 'Refunded';
    await order.save();
    res.json(order);
  } catch (error) { next(error); }
};

export const validateCheckout = async (req, res, next) => {
  try {
    const items = await getCheckoutItems(req.body.items);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const coupon = await findValidCoupon(req.body.couponCode, subtotal);
    const discount = calculateCouponDiscount(coupon, subtotal);
    const shippingFee = calculateShipping(subtotal - discount);
    res.json({ subtotal, discount, shippingFee, totalAmount: subtotal - discount + shippingFee, coupon: coupon?.code || null });
  } catch (error) { next(error); }
};
=======
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @desc    Create new order & decrement stock
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      discountPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    // 1. Verify stock availability for all products before placing order
    const resolvedItems = [];
    for (const item of orderItems) {
      const rawId = item._id || item.product;
      let matchedProduct = null;

      if (rawId && mongoose.Types.ObjectId.isValid(rawId)) {
        matchedProduct = await Product.findById(rawId);
      }
      if (!matchedProduct && item.name) {
        matchedProduct = await Product.findOne({ name: { $regex: new RegExp(`^${item.name}$`, 'i') } });
      }
      if (!matchedProduct) {
        matchedProduct = await Product.findOne({});
      }

      const requestedQty = Number(item.quantity || item.qty || 1);
      if (matchedProduct && matchedProduct.stock !== undefined && matchedProduct.stock < requestedQty) {
        res.status(400);
        throw new Error(`Insufficient stock for "${item.name}". Only ${matchedProduct.stock} available.`);
      }

      resolvedItems.push({
        name: item.name,
        qty: requestedQty,
        image: item.image || '/demo-saree.jpg',
        price: Number(item.price || 0),
        product: matchedProduct ? matchedProduct._id : new mongoose.Types.ObjectId(),
        matchedProductId: matchedProduct ? matchedProduct._id : null,
      });
    }

    // 2. Create the order
    const order = new Order({
      user: req.user._id,
      items: resolvedItems.map((ri) => ({
        name: ri.name,
        qty: ri.qty,
        image: ri.image,
        price: ri.price,
        product: ri.product,
      })),
      shippingAddress: shippingAddress || {
        street: '123 Heritage Lane',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India',
      },
      paymentMethod: paymentMethod || 'Card',
      subtotal: itemsPrice || totalPrice || 0,
      shipping: shippingPrice || 0,
      discount: discountPrice || 0,
      total: totalPrice || itemsPrice || 0,
    });

    const createdOrder = await order.save();

    // 3. Decrement inventory stock
    for (const ri of resolvedItems) {
      if (ri.matchedProductId) {
        await Product.findByIdAndUpdate(ri.matchedProductId, {
          $inc: { stock: -ri.qty },
        });
      }
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');

    if (order) {
      // Allow access if admin or order owner
      if (req.user.role === 'admin' || order.user._id.toString() === req.user._id.toString()) {
        res.json(order);
      } else {
        res.status(403);
        throw new Error('Not authorized to view this order');
      }
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
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

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      const newStatus = req.body.status || order.orderStatus;
      order.orderStatus = newStatus;

      if (newStatus === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order & restore stock
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Check authorization: admin or order owner
    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to cancel this order');
    }

    if (order.orderStatus === 'Cancelled') {
      res.status(400);
      throw new Error('Order is already cancelled');
    }

    if (order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered') {
      res.status(400);
      throw new Error(`Cannot cancel order once it is ${order.orderStatus.toLowerCase()}`);
    }

    // Restore stock for all items
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.qty },
      });
    }

    order.orderStatus = 'Cancelled';
    order.cancelledAt = Date.now();
    const updatedOrder = await order.save();

    res.json({ message: 'Order cancelled successfully and inventory restored', order: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order dashboard analytics summary
// @route   GET /api/orders/summary
// @access  Private/Admin
const getOrderSummary = async (req, res, next) => {
  try {
    const ordersCount = await Order.countDocuments();
    const paidOrdersCount = await Order.countDocuments({ isPaid: true });
    const deliveredOrdersCount = await Order.countDocuments({ isDelivered: true });
    const pendingOrdersCount = await Order.countDocuments({ orderStatus: { $in: ['Placed', 'Confirmed'] } });

    // Total sales
    const salesData = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalSales: { $sum: '$total' } } },
    ]);
    const totalSales = salesData.length > 0 ? salesData[0].totalSales : 0;

    // Daily sales trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, orderStatus: { $ne: 'Cancelled' } } },
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

    res.json({
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

export {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  cancelOrder,
  getMyOrders,
  getOrders,
  getOrderSummary,
};
>>>>>>> origin/main
