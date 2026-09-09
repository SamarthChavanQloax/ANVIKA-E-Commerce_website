import express from 'express';
import {
  getProducts,
  getProductById,
  getProductBySlug,
  getTopProducts,
  getFeaturedProducts,
  getRelatedProducts,
  createProductReview,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

router.route('/top')
  .get(getTopProducts);

router.route('/featured')
  .get(getFeaturedProducts);

router.route('/slug/:slug')
  .get(getProductBySlug);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

router.route('/:id/related')
  .get(getRelatedProducts);

import {
  getProductReviews,
  createProductReview as handleProductReview,
} from '../controllers/reviewController.js';

router.route('/:id/reviews')
  .get(getProductReviews)
  .post(protect, handleProductReview);

export default router;
