import crypto from 'crypto';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';

export const SHIPPING_THRESHOLD = 10000;
export const STANDARD_SHIPPING_FEE = 450;

export const calculateShipping = (subtotal) => subtotal >= SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;

export const calculateCouponDiscount = (coupon, subtotal) => {
  if (!coupon || subtotal < coupon.minimumOrder) return 0;
  const raw = coupon.discountType === 'percentage'
    ? Math.round((subtotal * coupon.discountValue) / 100)
    : coupon.discountValue;
  return Math.min(raw, coupon.maximumDiscount ?? raw, subtotal);
};

export const findValidCoupon = async (code, subtotal) => {
  if (!code) return null;
  const coupon = await Coupon.findOne({
    code: String(code).trim().toUpperCase(),
    active: true,
    expiry: { $gt: new Date() },
    $or: [{ usageLimit: { $exists: false } }, { usageLimit: null }, { $expr: { $lt: ['$usageCount', '$usageLimit'] } }],
  });
  if (!coupon || subtotal < coupon.minimumOrder) return null;
  return coupon;
};

export const getCheckoutItems = async (requestedItems = []) => {
  if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
    const error = new Error('Checkout requires at least one item');
    error.statusCode = 400;
    throw error;
  }

  const requestedProductIds = requestedItems.map((item) => item.product || item.productId);
  if (requestedProductIds.some((productId) => !mongoose.isValidObjectId(productId))) {
    throw Object.assign(new Error('Each checkout item must contain a valid product ID'), { statusCode: 400 });
  }

  const products = await Product.find({ _id: { $in: requestedProductIds } });
  const byId = new Map(products.map((product) => [String(product._id), product]));

  return requestedItems.map((requestedItem) => {
    const productId = String(requestedItem.product || requestedItem.productId);
    const product = byId.get(productId);
    const quantity = Number(requestedItem.quantity ?? requestedItem.qty);
    if (!product) throw Object.assign(new Error(`Product ${productId} was not found`), { statusCode: 404 });
    if (!Number.isInteger(quantity) || quantity < 1) throw Object.assign(new Error('Quantity must be a positive integer'), { statusCode: 400 });
    if (product.stock < quantity) throw Object.assign(new Error(`${product.name} does not have enough stock`), { statusCode: 409 });

    const size = requestedItem.size || requestedItem.selectedSize;
    const color = requestedItem.color;
    if (size && product.sizes?.length && !product.sizes.includes(size)) {
      throw Object.assign(new Error(`Size ${size} is unavailable for ${product.name}`), { statusCode: 400 });
    }
    if (color && product.colors?.length && !product.colors.includes(color)) {
      throw Object.assign(new Error(`Color ${color} is unavailable for ${product.name}`), { statusCode: 400 });
    }

    return {
      product,
      quantity,
      size,
      color,
      variant: requestedItem.variant,
      price: Number(product.price),
      productName: product.name,
      productImage: product.image || product.images?.[0],
    };
  });
};

export const decrementInventory = async (items) => {
  const updated = [];
  try {
    for (const item of items) {
      const product = await Product.findOneAndUpdate(
        { _id: item.product._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true },
      );
      if (!product) throw Object.assign(new Error(`Stock changed for ${item.productName}; please try again`), { statusCode: 409 });
      updated.push(item);
    }
    return updated;
  } catch (error) {
    await restoreInventory(updated);
    throw error;
  }
};

export const restoreInventory = async (items) => {
  await Promise.all(items.map((item) => Product.updateOne(
    { _id: item.product?._id || item.product },
    { $inc: { stock: item.quantity } },
  )));
};

export const createSignature = (payload) => crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'development-secret')
  .update(payload)
  .digest('hex');
