import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// Helper: Recalculate and save product rating & review count
const recalculateProductRating = async (product) => {
  product.numReviews = product.reviews.length;
  if (product.reviews.length === 0) {
    product.rating = 0;
  } else {
    const sum = product.reviews.reduce((acc, item) => acc + item.rating, 0);
    product.rating = Math.round((sum / product.reviews.length) * 10) / 10;
  }
  return await product.save();
};

// @desc    Create review with verified purchase validation
// @route   POST /api/products/:productId/reviews OR POST /api/reviews/product/:productId
// @access  Private
export const createProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.productId || req.params.id;

    if (!rating || !comment) {
      res.status(400);
      throw new Error('Rating and comment are required');
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      res.status(400);
      throw new Error('Rating must be an integer between 1 and 5');
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Check if user already reviewed this product
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('You have already submitted a review for this product');
    }

    // Verify purchase: Check if user has an order containing this product
    // Strictly checks Delivered status, with fallback for Confirmed/Placed in development mode if needed
    const verifiedOrder = await Order.findOne({
      user: req.user._id,
      orderStatus: { $in: ['Delivered', 'Completed'] },
      $or: [
        { 'items.product': productId },
        { 'orderItems.product': productId },
      ],
    });

    // In testing or dev, allow if user has any active order containing product
    const anyOrder = !verifiedOrder && process.env.NODE_ENV !== 'production'
      ? await Order.findOne({
          user: req.user._id,
          orderStatus: { $in: ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'] },
          $or: [
            { 'items.product': productId },
            { 'orderItems.product': productId },
          ],
        })
      : null;

    if (!verifiedOrder && !anyOrder && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Verified purchase required: You can only review products from a delivered order');
    }

    const review = {
      name: req.user.name,
      rating: numRating,
      comment: comment.trim(),
      user: req.user._id,
    };

    product.reviews.push(review);
    await recalculateProductRating(product);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: product.reviews[product.reviews.length - 1],
      rating: product.rating,
      numReviews: product.numReviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for a product with rating breakdown
// @route   GET /api/products/:productId/reviews OR GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res, next) => {
  try {
    const productId = req.params.productId || req.params.id;
    const product = await Product.findById(productId).select('reviews rating numReviews name');

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const reviews = product.reviews || [];
    const totalReviews = reviews.length;

    // Rating breakdown (5-star down to 1-star)
    const breakdown = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating)));
      breakdown[star] = (breakdown[star] || 0) + 1;
    });

    const breakdownPercentage = {
      5: totalReviews > 0 ? Math.round((breakdown[5] / totalReviews) * 100) : 0,
      4: totalReviews > 0 ? Math.round((breakdown[4] / totalReviews) * 100) : 0,
      3: totalReviews > 0 ? Math.round((breakdown[3] / totalReviews) * 100) : 0,
      2: totalReviews > 0 ? Math.round((breakdown[2] / totalReviews) * 100) : 0,
      1: totalReviews > 0 ? Math.round((breakdown[1] / totalReviews) * 100) : 0,
    };

    // Check if authenticated user can review / has reviewed
    let canReview = false;
    let hasReviewed = false;
    let userReview = null;

    if (req.user) {
      const existing = reviews.find((r) => r.user.toString() === req.user._id.toString());
      if (existing) {
        hasReviewed = true;
        userReview = existing;
      } else {
        const order = await Order.findOne({
          user: req.user._id,
          orderStatus: { $in: ['Delivered', 'Completed', 'Confirmed', 'Placed'] },
          $or: [
            { 'items.product': productId },
            { 'orderItems.product': productId },
          ],
        });
        canReview = !!order || req.user.role === 'admin';
      }
    }

    res.status(200).json({
      productId: product._id,
      productName: product.name,
      rating: product.rating,
      numReviews: totalReviews,
      breakdown,
      breakdownPercentage,
      reviews: reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      canReview,
      hasReviewed,
      userReview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const reviewId = req.params.id;

    const product = await Product.findOne({ 'reviews._id': reviewId });
    if (!product) {
      res.status(404);
      throw new Error('Review not found');
    }

    const review = product.reviews.id(reviewId);
    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    // Ownership check
    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error('Not authorized to edit this review');
    }

    if (rating !== undefined) {
      const num = Number(rating);
      if (isNaN(num) || num < 1 || num > 5) {
        res.status(400);
        throw new Error('Rating must be between 1 and 5');
      }
      review.rating = num;
    }

    if (comment !== undefined) {
      review.comment = comment.trim();
    }

    await recalculateProductRating(product);

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review,
      rating: product.rating,
      numReviews: product.numReviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res, next) => {
  try {
    const reviewId = req.params.id;

    const product = await Product.findOne({ 'reviews._id': reviewId });
    if (!product) {
      res.status(404);
      throw new Error('Review not found');
    }

    const review = product.reviews.id(reviewId);
    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    // Ownership check
    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error('Not authorized to delete this review');
    }

    product.reviews.pull(reviewId);
    await recalculateProductRating(product);

    res.status(200).json({
      success: true,
      message: 'Review removed successfully',
      rating: product.rating,
      numReviews: product.numReviews,
    });
  } catch (error) {
    next(error);
  }
};
