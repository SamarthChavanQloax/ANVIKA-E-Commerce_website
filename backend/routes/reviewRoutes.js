import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createReview, deleteReview, listReviews, updateReview } from '../controllers/reviewController.js';

const router = express.Router();
router.get('/products/:productId/reviews', listReviews);
router.post('/products/:productId/reviews', protect, createReview);
router.put('/reviews/:id', protect, updateReview);
router.delete('/reviews/:id', protect, deleteReview);

export default router;
