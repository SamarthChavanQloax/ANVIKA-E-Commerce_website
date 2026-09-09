import express from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
  processRefund,
} from '../controllers/paymentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Razorpay order initialization
router.post('/create-order', protect, createRazorpayOrder);

// Payment signature verification
router.post('/verify', protect, verifyRazorpayPayment);

// Webhook for Razorpay asynchronous events
router.post('/webhook', handleRazorpayWebhook);

// Process refund
router.post('/refund', protect, admin, processRefund);

export default router;
