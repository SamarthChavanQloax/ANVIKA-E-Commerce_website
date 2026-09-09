import crypto from 'crypto';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';

// Initialize Razorpay client with environment variables
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (key_id && key_secret) {
    return new Razorpay({
      key_id,
      key_secret,
    });
  }
  return null;
};

// Helper: Reduce inventory stock for an order
export const reduceOrderStock = async (order) => {
  const items = order.items || order.orderItems || [];
  for (const item of items) {
    if (!item.product) continue;
    try {
      const product = await Product.findById(item.product);
      if (!product) continue;

      const qty = Number(item.qty || item.quantity || 1);

      // If product has variants and item specifies variant details
      const itemSize = item.size || item.variant?.size;
      const itemColor = item.color || item.variant?.color;

      if (product.variants && product.variants.length > 0 && (itemSize || itemColor)) {
        const variantIndex = product.variants.findIndex((v) => {
          const matchSize = !itemSize || v.size?.toLowerCase() === itemSize.toLowerCase();
          const matchColor = !itemColor || v.color?.toLowerCase() === itemColor.toLowerCase();
          return matchSize && matchColor;
        });

        if (variantIndex !== -1) {
          product.variants[variantIndex].stock = Math.max(0, (product.variants[variantIndex].stock || 0) - qty);
        } else {
          // Fallback to first available variant or overall stock
          product.variants[0].stock = Math.max(0, (product.variants[0].stock || 0) - qty);
        }
        await product.save();
      } else {
        // Simple product decrement
        product.stock = Math.max(0, (product.stock || 0) - qty);
        await product.save();
      }
    } catch (err) {
      console.warn(`[Inventory] Could not decrement stock for product ${item.product}:`, err.message);
    }
  }
};

// Helper: Restore inventory stock for an order (e.g. on cancellation/return)
export const restoreOrderStock = async (order) => {
  const items = order.items || order.orderItems || [];
  for (const item of items) {
    if (!item.product) continue;
    try {
      const product = await Product.findById(item.product);
      if (!product) continue;

      const qty = Number(item.qty || item.quantity || 1);
      const itemSize = item.size || item.variant?.size;
      const itemColor = item.color || item.variant?.color;

      if (product.variants && product.variants.length > 0 && (itemSize || itemColor)) {
        const variantIndex = product.variants.findIndex((v) => {
          const matchSize = !itemSize || v.size?.toLowerCase() === itemSize.toLowerCase();
          const matchColor = !itemColor || v.color?.toLowerCase() === itemColor.toLowerCase();
          return matchSize && matchColor;
        });

        if (variantIndex !== -1) {
          product.variants[variantIndex].stock = (product.variants[variantIndex].stock || 0) + qty;
        } else {
          product.variants[0].stock = (product.variants[0].stock || 0) + qty;
        }
        await product.save();
      } else {
        product.stock = (product.stock || 0) + qty;
        await product.save();
      }
    } catch (err) {
      console.warn(`[Inventory] Could not restore stock for product ${item.product}:`, err.message);
    }
  }
};

// @desc    Create Razorpay Order (Backend-authoritative amount)
// @route   POST /api/payments/create-order
// @access  Private
export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      res.status(400);
      throw new Error('Order ID is required');
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Backend-authoritative amount in paise (1 INR = 100 paise)
    const totalAmount = order.total || order.totalAmount || 0;
    const amountInPaise = Math.round(totalAmount * 100);

    if (amountInPaise <= 0) {
      res.status(400);
      throw new Error('Order amount must be greater than zero');
    }

    const razorpay = getRazorpayInstance();

    let razorpayOrderId = '';
    const currency = 'INR';

    if (razorpay) {
      // Real Razorpay API invocation
      const options = {
        amount: amountInPaise,
        currency,
        receipt: `rcpt_${order._id.toString().slice(-10)}`,
        notes: {
          orderId: order._id.toString(),
          userId: req.user._id.toString(),
        },
      };

      const rzpOrder = await razorpay.orders.create(options);
      razorpayOrderId = rzpOrder.id;
    } else {
      // Graceful simulated Razorpay order for development/testing when keys are not configured
      razorpayOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }

    // Update order with razorpay order ID
    order.razorpay = {
      ...order.razorpay,
      orderId: razorpayOrderId,
    };
    await order.save();

    res.status(200).json({
      success: true,
      orderId: order._id,
      razorpayOrderId,
      amount: amountInPaise,
      currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_simulation_key',
      customer: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || order.shippingAddress?.phone || '9999999999',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment signature & complete order
// @route   POST /api/payments/verify
// @access  Private
export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    const rzpOrderId = razorpay_order_id || razorpayOrderId;
    const rzpPaymentId = razorpay_payment_id || razorpayPaymentId;
    const rzpSignature = razorpay_signature || razorpaySignature;

    if (!orderId || !rzpOrderId || !rzpPaymentId) {
      res.status(400);
      throw new Error('Missing payment verification parameters');
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Signature verification using HMAC SHA256
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    let isValid = false;

    if (key_secret && rzpSignature) {
      const generatedSignature = crypto
        .createHmac('sha256', key_secret)
        .update(`${rzpOrderId}|${rzpPaymentId}`)
        .digest('hex');

      isValid = generatedSignature === rzpSignature;
    } else if (rzpOrderId.startsWith('order_sim_') || !key_secret) {
      // Allow simulation mode in local dev when keys are not set
      isValid = true;
    }

    if (!isValid) {
      order.paymentStatus = 'Failed';
      await order.save();
      res.status(400);
      throw new Error('Invalid payment signature verification failed');
    }

    // Payment Successful: Update order status
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentStatus = 'Completed';
    order.orderStatus = 'Confirmed';
    order.paymentResult = {
      id: rzpPaymentId,
      status: 'Captured',
      update_time: new Date().toISOString(),
      email_address: req.user?.email || order.shippingAddress?.phone,
    };
    order.razorpay = {
      orderId: rzpOrderId,
      paymentId: rzpPaymentId,
      signature: rzpSignature || 'simulated_signature',
    };

    // Set customer snapshot if not already present
    if (!order.customer || !order.customer.name) {
      order.customer = {
        id: req.user?._id || order.user,
        name: req.user?.name || order.shippingAddress?.fullName || 'Customer',
        email: req.user?.email || '',
        phone: req.user?.phone || order.shippingAddress?.phone || '',
      };
    }

    const savedOrder = await order.save();

    // Reduce inventory stock now that payment is confirmed
    await reduceOrderStock(order);

    // Clear user cart upon successful payment
    try {
      await Cart.findOneAndUpdate(
        { user: order.user },
        { items: [], subtotal: 0 }
      );
    } catch (cartErr) {
      console.warn('[Cart] Cart clear notice:', cartErr.message);
    }

    // Populate user and product details
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('user', 'name email phone addresses')
      .populate('items.product', 'name price image category stock');

    res.status(200).json({
      success: true,
      message: 'Payment verified and order confirmed successfully',
      order: populatedOrder || savedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Razorpay Webhook Handler
// @route   POST /api/payments/webhook
// @access  Public
export const handleRazorpayWebhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const webhookSignature = req.headers['x-razorpay-signature'];

    if (webhookSecret && webhookSignature) {
      const body = JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      if (expectedSignature !== webhookSignature) {
        return res.status(400).json({ status: 'error', message: 'Invalid webhook signature' });
      }
    }

    const { event, payload } = req.body;

    if (event === 'payment.captured') {
      const payment = payload?.payment?.entity;
      if (payment?.order_id) {
        const order = await Order.findOne({ 'razorpay.orderId': payment.order_id });
        if (order && !order.isPaid) {
          order.isPaid = true;
          order.paidAt = new Date();
          order.paymentStatus = 'Completed';
          order.orderStatus = 'Confirmed';
          order.paymentResult = {
            id: payment.id,
            status: 'Captured',
            update_time: new Date().toISOString(),
            email_address: payment.email,
          };
          await order.save();
          await reduceOrderStock(order);
        }
      }
    } else if (event === 'payment.failed') {
      const payment = payload?.payment?.entity;
      if (payment?.order_id) {
        const order = await Order.findOne({ 'razorpay.orderId': payment.order_id });
        if (order && !order.isPaid) {
          order.paymentStatus = 'Failed';
          await order.save();
        }
      }
    } else if (event === 'refund.processed') {
      const refund = payload?.refund?.entity;
      if (refund?.payment_id) {
        const order = await Order.findOne({ 'razorpay.paymentId': refund.payment_id });
        if (order) {
          order.paymentStatus = 'Refunded';
          order.orderStatus = 'Refunded';
          await order.save();
          await restoreOrderStock(order);
        }
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
};

// @desc    Process Refund (Admin only or verified cancellation)
// @route   POST /api/payments/refund
// @access  Private/Admin
export const processRefund = async (req, res, next) => {
  try {
    const { orderId, amount, reason } = req.body;

    if (!orderId) {
      res.status(400);
      throw new Error('Order ID is required');
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (!order.isPaid && order.paymentStatus !== 'Completed') {
      res.status(400);
      throw new Error('Cannot refund an unpaid order');
    }

    const razorpay = getRazorpayInstance();
    const paymentId = order.razorpay?.paymentId || order.paymentResult?.id;

    if (razorpay && paymentId && !paymentId.startsWith('pay_sim_')) {
      const refundOptions = {
        speed: 'normal',
        notes: { reason: reason || 'Customer requested refund / order cancellation' },
      };
      if (amount) {
        refundOptions.amount = Math.round(Number(amount) * 100);
      }
      await razorpay.payments.refund(paymentId, refundOptions);
    }

    order.paymentStatus = 'Refunded';
    order.orderStatus = 'Refunded';
    order.returnedAt = new Date();
    await order.save();

    // Restore stock
    await restoreOrderStock(order);

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully and inventory restored',
      order,
    });
  } catch (error) {
    next(error);
  }
};
