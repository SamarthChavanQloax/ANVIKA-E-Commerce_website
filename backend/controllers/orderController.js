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
    const { id } = req.params;

    let order = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    }
    if (!order) {
      // Fallback search by orderNumber
      order = await Order.findOne({ orderNumber: id });
    }

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Check authorization: admin or order owner
    const orderUserId = order.user ? (order.user._id || order.user).toString() : null;
    const reqUserId = req.user?._id ? req.user._id.toString() : null;

    if (req.user.role !== 'admin' && (!orderUserId || orderUserId !== reqUserId)) {
      res.status(403);
      throw new Error('Not authorized to cancel this order');
    }

    const currentStatus = (order.orderStatus || '').toLowerCase();

    if (currentStatus === 'cancelled') {
      res.status(400);
      throw new Error('Order is already cancelled');
    }

    if (currentStatus === 'shipped' || currentStatus === 'out for delivery' || currentStatus === 'delivered') {
      res.status(400);
      throw new Error(`Cannot cancel order once it has been ${order.orderStatus.toLowerCase()}`);
    }

    // Restore stock safely for all valid product items
    for (const item of order.items || []) {
      const prodId = item.product || item.matchedProductId;
      const qty = Number(item.qty || 1);
      if (prodId && mongoose.Types.ObjectId.isValid(prodId)) {
        try {
          await Product.findByIdAndUpdate(prodId, {
            $inc: { stock: qty },
          });
        } catch (stockErr) {
          console.warn(`Could not restore stock for product ${prodId}:`, stockErr.message);
        }
      }
    }

    order.orderStatus = 'Cancelled';
    order.cancelledAt = new Date();
    if (order.isPaid || order.paymentStatus === 'Completed') {
      order.paymentStatus = 'Refunded';
    }
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
