import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { cancelOrder, createOrder, getAdminOrders, getMyOrders, getOrderById, updateOrderStatus, validateCheckout } from '../controllers/orderController.js';
import { createPaymentOrder, paymentFailure, refundPayment, verifyPayment } from '../controllers/paymentController.js';

const router = express.Router();
router.use(protect);
router.post('/checkout/validate', validateCheckout);
router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);
router.post('/payments/create', createPaymentOrder);
router.post('/payments/verify', verifyPayment);
router.post('/payments/failure', paymentFailure);
router.get('/admin/all', admin, getAdminOrders);
router.put('/admin/:id/status', admin, updateOrderStatus);
router.post('/admin/:orderId/refund', admin, refundPayment);

export default router;
