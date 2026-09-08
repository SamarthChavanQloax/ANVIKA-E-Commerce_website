import mongoose from 'mongoose';

const couponSchema = mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true, min: 0 },
  minimumOrder: { type: Number, default: 0, min: 0 },
  maximumDiscount: { type: Number, min: 0 },
  expiry: { type: Date, required: true },
  usageLimit: { type: Number, min: 1 },
  usageCount: { type: Number, default: 0, min: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
