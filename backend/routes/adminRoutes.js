import express from 'express';
import {
  getAdminDashboard,
  getAdminAnalytics,
  getAdminCustomers,
  getAdminReportData,
} from '../controllers/adminController.js';
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
