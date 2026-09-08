import express from 'express';
import { razorpayWebhook } from '../controllers/paymentController.js';

const router = express.Router();
router.post('/webhook', razorpayWebhook);

export default router;
