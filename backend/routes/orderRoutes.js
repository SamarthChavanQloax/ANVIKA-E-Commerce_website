import express from 'express';
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  cancelOrder,
  getMyOrders,
  getOrders,
  getOrderSummary,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, getOrders);

router.route('/summary')
  .get(protect, admin, getOrderSummary);

router.route('/myorders')
  .get(protect, getMyOrders);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/pay')
  .put(protect, updateOrderToPaid);

router.route('/:id/status')
  .put(protect, admin, updateOrderStatus);

router.route('/:id/cancel')
  .put(protect, cancelOrder);

export default router;
