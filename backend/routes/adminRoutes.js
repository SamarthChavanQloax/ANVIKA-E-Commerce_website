import express from 'express';
import {
  getAdminDashboard,
  getAdminAnalytics,
  getAdminAnalyticsRevenue,
  getAdminAnalyticsProducts,
  getAdminAnalyticsCustomers,
  getAdminCustomers,
  getAdminReportData,
} from '../controllers/adminController.js';
import couponRoutes from './couponRoutes.js';
import {
  getOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect and admin to all /api/admin routes
router.use(protect, admin);

// Dashboard stats
router.get('/dashboard', getAdminDashboard);

// Analytics
router.get('/analytics', getAdminAnalytics);
router.get('/analytics/revenue', getAdminAnalyticsRevenue);
router.get('/analytics/products', getAdminAnalyticsProducts);
router.get('/analytics/customers', getAdminAnalyticsCustomers);

// Coupons management alias under /api/admin/coupons
router.use('/coupons', couponRoutes);

// Customers list
router.get('/customers', getAdminCustomers);

// Reports generation & export data
router.get('/reports', getAdminReportData);

// Orders management aliases
router.route('/orders')
  .get(getOrders);

router.route('/orders/:id/status')
  .put(updateOrderStatus);

export default router;
