import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';

const refreshProductRating = async (productId) => {
  const objectProductId = new mongoose.Types.ObjectId(productId);
  const stats = await Review.aggregate([
    { $match: { product: objectProductId } },
    { $group: { _id: '$product', rating: { $avg: '$rating' }, numReviews: { $sum: 1 } } },
  ]);
  const values = stats[0] || { rating: 0, numReviews: 0 };
  await Product.findByIdAndUpdate(productId, { rating: Math.round(values.rating * 10) / 10, numReviews: values.numReviews });
};

const hasPurchased = async (userId, productId) => Boolean(await Order.exists({ user: userId, orderStatus: { $in: ['Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'] }, 'items.product': productId }));

export const listReviews = async (req, res, next) => {
  try { res.json(await Review.find({ product: req.params.productId }).sort({ createdAt: -1 }).populate('user', 'name')); } catch (error) { next(error); }
};
export const createReview = async (req, res, next) => {
  try {
    if (!(await Product.exists({ _id: req.params.productId }))) return res.status(404).json({ message: 'Product not found' });
    if (!(await hasPurchased(req.user._id, req.params.productId))) return res.status(403).json({ message: 'Purchase this product before reviewing it' });
    const review = await Review.create({ product: req.params.productId, user: req.user._id, rating: req.body.rating, text: req.body.text || req.body.comment });
    await refreshProductRating(review.product);
    res.status(201).json(await review.populate('user', 'name'));
  } catch (error) { next(error); }
};
export const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
    if (!review) return res.status(404).json({ message: 'Review not found or not authorized' });
    review.rating = req.body.rating ?? review.rating;
    review.text = req.body.text ?? req.body.comment ?? review.text;
    await review.save();
    await refreshProductRating(review.product);
    res.json(review);
  } catch (error) { next(error); }
};
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!review) return res.status(404).json({ message: 'Review not found or not authorized' });
    await refreshProductRating(review.product);
    res.json({ message: 'Review deleted' });
  } catch (error) { next(error); }
};
