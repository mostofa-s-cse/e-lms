import express from 'express';
import {
  getAllPayments,
  getPaymentById,
  getPaymentsByUser,
  getPaymentsByEnrollment,
  createPayment,
  updatePayment,
  deletePayment,
  markPaymentCompleted,
} from '../controllers/payments';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all payments (Admin only)
router.get('/', authorizeRoles(['ADMIN']), getAllPayments);

// Get payment by ID (Admin only)
router.get('/:id', authorizeRoles(['ADMIN']), getPaymentById);

// Get payments by user ID (Admin or own user)
router.get('/user/:userId', getPaymentsByUser);

// Get payments by enrollment ID (Admin only)
router.get('/enrollment/:enrollmentId', authorizeRoles(['ADMIN']), getPaymentsByEnrollment);

// Create new payment (Admin only)
router.post('/', authorizeRoles(['ADMIN']), createPayment);

// Update payment (Admin only)
router.put('/:id', authorizeRoles(['ADMIN']), updatePayment);

// Delete payment (Admin only)
router.delete('/:id', authorizeRoles(['ADMIN']), deletePayment);

// Mark payment as completed (Admin only)
router.patch('/:id/complete', authorizeRoles(['ADMIN']), markPaymentCompleted);

export default router; 