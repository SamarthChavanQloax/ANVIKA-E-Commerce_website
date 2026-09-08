import Coupon from '../models/Coupon.js';
import { calculateCouponDiscount, findValidCoupon } from '../utils/orderUtils.js';

const sanitize = (body) => ({
  code: String(body.code || '').trim().toUpperCase(),
  discountType: body.discountType,
  discountValue: Number(body.discountValue),
  minimumOrder: Number(body.minimumOrder || 0),
  maximumDiscount: body.maximumDiscount === undefined || body.maximumDiscount === '' ? undefined : Number(body.maximumDiscount),
  expiry: body.expiry,
  usageLimit: body.usageLimit === undefined || body.usageLimit === '' ? undefined : Number(body.usageLimit),
  active: body.active !== false,
});

export const createCoupon = async (req, res, next) => {
  try { res.status(201).json(await Coupon.create(sanitize(req.body))); } catch (error) { next(error); }
};
export const listCoupons = async (req, res, next) => {
  try { res.json(await Coupon.find({ active: true, expiry: { $gt: new Date() } }).select('-usageCount').sort({ expiry: 1 })); } catch (error) { next(error); }
};
export const updateCoupon = async (req, res, next) => {
  try { const coupon = await Coupon.findByIdAndUpdate(req.params.id, sanitize(req.body), { new: true, runValidators: true }); if (!coupon) return res.status(404).json({ message: 'Coupon not found' }); res.json(coupon); } catch (error) { next(error); }
};
export const deleteCoupon = async (req, res, next) => {
  try { const coupon = await Coupon.findByIdAndDelete(req.params.id); if (!coupon) return res.status(404).json({ message: 'Coupon not found' }); res.json({ message: 'Coupon deleted' }); } catch (error) { next(error); }
};
export const validateCoupon = async (req, res, next) => {
  try {
    const subtotal = Number(req.body.subtotal);
    if (!Number.isFinite(subtotal) || subtotal < 0) return res.status(400).json({ message: 'Valid subtotal is required' });
    const coupon = await findValidCoupon(req.body.code, subtotal);
    if (!coupon) return res.status(400).json({ message: 'Invalid, expired, or ineligible coupon' });
    res.json({ code: coupon.code, discount: calculateCouponDiscount(coupon, subtotal), discountType: coupon.discountType, discountValue: coupon.discountValue });
  } catch (error) { next(error); }
};
