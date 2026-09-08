import mongoose from 'mongoose';

const couponSchema = mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  discountType: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed'],
    default: 'percentage',
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0,
  },
  minimumOrder: {
    type: Number,
    default: 0,
    min: 0,
  },
  maximumDiscount: {
    type: Number,
    default: null,
  },
  expiry: {
    type: Date,
    required: true,
  },
  usageLimit: {
    type: Number,
    default: null, // null means unlimited
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Helper method to check if coupon is valid for an amount
couponSchema.methods.isValid = function(subtotal = 0) {
  if (!this.isActive) {
    return { valid: false, message: 'Coupon is inactive' };
  }
  if (this.expiry && new Date() > new Date(this.expiry)) {
    return { valid: false, message: 'Coupon has expired' };
  }
  if (this.usageLimit !== null && this.usageLimit !== undefined && this.usedCount >= this.usageLimit) {
    return { valid: false, message: 'Coupon usage limit has been reached' };
  }
  if (subtotal < (this.minimumOrder || 0)) {
    return { valid: false, message: `Minimum order amount of ₹${this.minimumOrder} required for this coupon` };
  }
  return { valid: true };
};

// Calculate discount amount
couponSchema.methods.calculateDiscount = function(subtotal = 0) {
  const check = this.isValid(subtotal);
  if (!check.valid) return 0;

  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (subtotal * this.discountValue) / 100;
    if (this.maximumDiscount && discount > this.maximumDiscount) {
      discount = this.maximumDiscount;
    }
  } else if (this.discountType === 'fixed') {
    discount = Math.min(this.discountValue, subtotal);
  }
  return Math.round(discount * 100) / 100;
};

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
