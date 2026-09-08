import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getAdminOrders, updateOrderStatus } from '../controllers/orderController.js';
import { refundPayment } from '../controllers/paymentController.js';
import { createCoupon, deleteCoupon, updateCoupon } from '../controllers/couponController.js';
import { customerAnalytics, getDashboard, productAnalytics, revenueAnalytics } from '../controllers/adminController.js';
import Coupon from '../models/Coupon.js';

const router = express.Router();
router.use(protect, admin);
router.get('/orders', getAdminOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.post('/orders/:orderId/refund', refundPayment);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);
router.get('/coupons', async (req, res, next) => { try { res.json(await Coupon.find().sort({ createdAt: -1 })); } catch (error) { next(error); } });
router.get('/dashboard', getDashboard);
router.get('/analytics/revenue', revenueAnalytics);
router.get('/analytics/products', productAnalytics);
router.get('/analytics/customers', customerAnalytics);

export default router;
