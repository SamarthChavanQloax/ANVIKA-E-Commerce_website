import mongoose from 'mongoose';

const paymentSchema = mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  provider: { type: String, enum: ['razorpay', 'manual'], default: 'manual' },
  providerOrderId: { type: String, index: true },
  providerPaymentId: { type: String, index: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['created', 'authorized', 'captured', 'failed', 'refunded'], default: 'created' },
  failureReason: String,
  raw: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
