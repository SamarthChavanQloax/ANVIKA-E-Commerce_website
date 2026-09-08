import Coupon from '../models/Coupon.js';

// @desc    Validate coupon and calculate discount
// @route   POST /api/coupons/validate
// @access  Public / Private
export const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal = 0 } = req.body;

    if (!code || typeof code !== 'string') {
      res.status(400);
      throw new Error('Please provide a coupon code');
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode });

    if (!coupon) {
      res.status(404);
      throw new Error(`Coupon "${cleanCode}" does not exist`);
    }

    const numSubtotal = Number(subtotal) || 0;
    const validity = coupon.isValid(numSubtotal);

    if (!validity.valid) {
      res.status(400);
      throw new Error(validity.message);
    }

    const discountAmount = coupon.calculateDiscount(numSubtotal);

    res.status(200).json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount: discountAmount,
      minimumOrder: coupon.minimumOrder,
      maximumDiscount: coupon.maximumDiscount,
      message: `Coupon "${coupon.code}" applied! You saved ₹${discountAmount.toLocaleString('en-IN')}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active coupons (or all coupons for admin)
// @route   GET /api/coupons
// @access  Public / Admin
export const getCoupons = async (req, res, next) => {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    let query = {};

    if (!isAdmin) {
      query = {
        isActive: true,
        expiry: { $gte: new Date() },
      };
    }

    const coupons = await Coupon.find(query).sort({ createdAt: -1 });
    res.status(200).json(coupons);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new coupon
// @route   POST /api/admin/coupons
// @access  Private/Admin
export const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      discountType = 'percentage',
      discountValue,
      minimumOrder = 0,
      maximumDiscount = null,
      expiry,
      usageLimit = null,
      isActive = true,
    } = req.body;

    if (!code || !discountValue || !expiry) {
      res.status(400);
      throw new Error('Code, discount value, and expiry date are required');
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      res.status(400);
      throw new Error(`Coupon code "${cleanCode}" already exists`);
    }

    const coupon = await Coupon.create({
      code: cleanCode,
      discountType,
      discountValue: Number(discountValue),
      minimumOrder: Number(minimumOrder) || 0,
      maximumDiscount: maximumDiscount ? Number(maximumDiscount) : null,
      expiry: new Date(expiry),
      usageLimit: usageLimit ? Number(usageLimit) : null,
      isActive: Boolean(isActive),
    });

    res.status(201).json(coupon);
  } catch (error) {
    next(error);
  }
};

// @desc    Update coupon
// @route   PUT /api/admin/coupons/:id
// @access  Private/Admin
export const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      res.status(404);
      throw new Error('Coupon not found');
    }

    const {
      code,
      discountType,
      discountValue,
      minimumOrder,
      maximumDiscount,
      expiry,
      usageLimit,
      isActive,
    } = req.body;

    if (code) {
      const cleanCode = code.trim().toUpperCase();
      const existing = await Coupon.findOne({ code: cleanCode, _id: { $ne: coupon._id } });
      if (existing) {
        res.status(400);
        throw new Error(`Coupon code "${cleanCode}" is already in use`);
      }
      coupon.code = cleanCode;
    }

    if (discountType !== undefined) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
    if (minimumOrder !== undefined) coupon.minimumOrder = Number(minimumOrder);
    if (maximumDiscount !== undefined) coupon.maximumDiscount = maximumDiscount ? Number(maximumDiscount) : null;
    if (expiry !== undefined) coupon.expiry = new Date(expiry);
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit ? Number(usageLimit) : null;
    if (isActive !== undefined) coupon.isActive = Boolean(isActive);

    const updated = await coupon.save();
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete coupon
// @route   DELETE /api/admin/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      res.status(404);
      throw new Error('Coupon not found');
    }

    await Coupon.deleteOne({ _id: coupon._id });
    res.status(200).json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    next(error);
  }
};
