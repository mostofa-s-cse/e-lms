import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getAllPayments,
  getPaymentById,
  getPaymentsByUser,
  getPaymentsByEnrollment,
  createPayment,
  updatePayment,
  deletePayment,
  markPaymentCompleted,
  createCustomPayment,
  createCartPayment,
  createFreeEnrollment
} from '../controllers/payments';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Custom payment routes (replacing SSLCommerz)
router.post('/create', createCustomPayment);
router.post('/create-cart', createCartPayment);
router.post('/free-enrollment', createFreeEnrollment);

// Existing payment routes
router.get('/', getAllPayments);
router.get('/:id', getPaymentById);
router.get('/user/:userId', getPaymentsByUser);
router.get('/enrollment/:enrollmentId', getPaymentsByEnrollment);
router.post('/', createPayment);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);
router.patch('/:id/complete', markPaymentCompleted);

export default router; 