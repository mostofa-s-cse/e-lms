import express from 'express';
import { 
  submitContactForm, 
  getContactMessages, 
  updateContactMessageStatus, 
  deleteContactMessage 
} from '../controllers/contact';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Public route - anyone can submit a contact form
router.post('/submit', submitContactForm);

// Protected routes - only admins can access
router.get('/messages', authenticateToken, requireRole(['ADMIN']), getContactMessages);
router.put('/messages/:id/status', authenticateToken, requireRole(['ADMIN']), updateContactMessageStatus);
router.delete('/messages/:id', authenticateToken, requireRole(['ADMIN']), deleteContactMessage);

export default router;
