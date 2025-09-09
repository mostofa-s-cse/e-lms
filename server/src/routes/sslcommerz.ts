import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createPaymentSession,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  paymentIPN
} from '../controllers/sslcommerz';

const router = express.Router();

// Create payment session (requires authentication)
router.post('/create-session', authenticateToken, createPaymentSession);

// Payment callbacks (no authentication required - called by SSLCommerz)
router.post('/success', paymentSuccess);
router.post('/fail', paymentFail);
router.post('/cancel', paymentCancel);
router.post('/ipn', paymentIPN);

export default router; 