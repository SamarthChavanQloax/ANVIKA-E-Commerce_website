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
    if (!['cod', 'razorpay', 'razorpay_upi', 'razorpay_card', 'razorpay_netbanking'].includes(paymentMethod)) {
      throw Object.assign(new Error('Unsupported payment method'), { statusCode: 400 });
    }
    const isOnlinePayment = paymentMethod.startsWith('razorpay');
    if (isOnlinePayment && (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET)) {
      throw Object.assign(new Error('Online payment is not configured. Use cash on delivery or configure Razorpay.'), { statusCode: 503 });
    }
    if (!isOnlinePayment) reservedItems = await decrementInventory(items);
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
      orderStatus: isOnlinePayment ? 'Pending' : 'Confirmed',
      subtotal,
      discount,
      shippingFee,
      totalAmount,
      coupon: coupon?._id,
      inventoryReduced: paymentMethod === 'cod',
    });

    if (coupon && !isOnlinePayment) await Coupon.updateOne({ _id: coupon._id }, { $inc: { usageCount: 1 } });
    const payment = await Payment.create({ order: order._id, user: req.user._id, amount: totalAmount, provider: isOnlinePayment ? 'razorpay' : 'manual', status: isOnlinePayment ? 'created' : 'captured' });
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
