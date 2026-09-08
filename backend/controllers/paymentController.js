import crypto from 'crypto';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Coupon from '../models/Coupon.js';
import Product from '../models/Product.js';
import { createSignature, decrementInventory, restoreInventory } from '../utils/orderUtils.js';

const getRazorpay = async () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  const module = await import('razorpay');
  return new module.default({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
};

export const createPaymentOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.body.orderId, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const razorpay = await getRazorpay();
    if (!razorpay) return res.status(503).json({ message: 'Online payment is not configured. Use cash on delivery or configure Razorpay.' });
    const providerOrder = await razorpay.orders.create({ amount: Math.round(order.totalAmount * 100), currency: 'INR', receipt: String(order._id) });
    const payment = await Payment.findOneAndUpdate({ order: order._id }, { provider: 'razorpay', providerOrderId: providerOrder.id, amount: order.totalAmount }, { upsert: true, new: true });
    order.payment = payment._id;
    await order.save();
    res.json({ keyId: process.env.RAZORPAY_KEY_ID, orderId: providerOrder.id, amount: providerOrder.amount, currency: providerOrder.currency });
  } catch (error) { next(error); }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id: providerOrderId, razorpay_payment_id: providerPaymentId, razorpay_signature: signature, orderId } = req.body;
    const expected = createSignature(`${providerOrderId}|${providerPaymentId}`);
    const received = Buffer.from(signature || '');
    const expectedBuffer = Buffer.from(expected);
    if (!signature || received.length !== expectedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, received)) return res.status(400).json({ message: 'Invalid payment signature' });
    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const razorpay = await getRazorpay();
    if (!razorpay) return res.status(503).json({ message: 'Online payment is not configured' });
    const gatewayPayment = await razorpay.payments.fetch(providerPaymentId);
    if (gatewayPayment.order_id !== providerOrderId || gatewayPayment.amount !== Math.round(order.totalAmount * 100) || gatewayPayment.currency !== 'INR' || gatewayPayment.status !== 'captured') {
      return res.status(400).json({ message: 'Payment amount or status could not be verified' });
    }
    if (!order.inventoryReduced) {
      const products = await Product.find({ _id: { $in: order.items.map((item) => item.product) } });
      const byId = new Map(products.map((product) => [String(product._id), product]));
      await decrementInventory(order.items.map((item) => ({
        product: byId.get(String(item.product._id || item.product)),
        quantity: item.quantity,
        productName: item.productName,
      })));
      order.inventoryReduced = true;
    }
    const wasPaid = order.paymentStatus === 'Paid';
    const payment = await Payment.findOneAndUpdate({ order: order._id }, { providerPaymentId, status: 'captured' }, { new: true });
    order.paymentStatus = 'Paid';
    order.orderStatus = 'Confirmed';
    order.payment = payment?._id;
    await order.save();
    if (!wasPaid && order.coupon) await Coupon.updateOne({ _id: order.coupon }, { $inc: { usageCount: 1 } });
    res.json({ success: true, order });
  } catch (error) { next(error); }
};

export const paymentFailure = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.body.orderId, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    await Payment.findOneAndUpdate({ order: order._id }, { status: 'failed', failureReason: req.body.reason });
    if (order.inventoryReduced && !order.inventoryReleased) { await restoreInventory(order.items); order.inventoryReleased = true; }
    order.paymentStatus = 'Failed'; order.orderStatus = 'Cancelled'; await order.save();
    res.json({ success: false, order });
  } catch (error) { next(error); }
};

export const razorpayWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawPayload = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
    const payload = Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString('utf8')) : req.body;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '').update(rawPayload).digest('hex');
    if (!signature || signature !== expected) return res.status(400).json({ message: 'Invalid webhook signature' });
    const entity = payload.payload?.payment?.entity;
    const payment = await Payment.findOneAndUpdate({ providerPaymentId: entity?.id }, { status: payload.event?.includes('failed') ? 'failed' : 'captured', raw: payload });
    if (payment && !payload.event?.includes('failed')) await Order.findByIdAndUpdate(payment.order, { paymentStatus: 'Paid', orderStatus: 'Confirmed' });
    res.json({ received: true });
  } catch (error) { next(error); }
};

export const refundPayment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const payment = await Payment.findById(order.payment);
    const razorpay = await getRazorpay();
    if (razorpay && payment?.providerPaymentId) await razorpay.payments.refund(payment.providerPaymentId, { amount: Math.round(order.totalAmount * 100) });
    if (order.inventoryReduced && !order.inventoryReleased) { await restoreInventory(order.items); order.inventoryReleased = true; }
    order.paymentStatus = 'Refunded'; order.orderStatus = 'Refunded'; await order.save();
    if (payment) { payment.status = 'refunded'; await payment.save(); }
    res.json(order);
  } catch (error) { next(error); }
};
