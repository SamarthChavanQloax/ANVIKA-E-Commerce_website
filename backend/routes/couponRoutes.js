import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { listCoupons, validateCoupon } from '../controllers/couponController.js';

const router = express.Router();
router.get('/', listCoupons);
router.post('/validate', protect, validateCoupon);

export default router;
