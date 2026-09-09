import express from 'express';
import {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controllers/couponController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / User coupon validation
router.post('/validate', validateCoupon);

// Get available coupons (Public gets active ones, Admin gets all)
router.route('/')
  .get(getCoupons)
  .post(protect, admin, createCoupon);

// Admin Coupon CRUD
router.route('/:id')
  .put(protect, admin, updateCoupon)
  .delete(protect, admin, deleteCoupon);

export default router;
