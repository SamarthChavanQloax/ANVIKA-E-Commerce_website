import express from 'express';
import {
  createProductReview,
  getProductReviews,
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Direct review actions by review ID
router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

// Alternative route for reviews under product
router.route('/product/:productId')
  .get(getProductReviews)
  .post(protect, createProductReview);

export default router;
