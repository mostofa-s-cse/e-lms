import { Router } from 'express';
import * as intakeController from '../controllers/intakes';
import { authenticateToken, requireTeacher } from '../middleware/auth';

const router = Router();

// Public endpoints (for authenticated users)
router.get('/', authenticateToken, intakeController.getAllIntakes);
router.get('/:id', authenticateToken, intakeController.getIntakeById);
router.get('/:id/enrollments', authenticateToken, intakeController.getIntakeEnrollments);

// Teacher/Admin endpoints
router.post('/', authenticateToken, requireTeacher, intakeController.createIntake);
router.put('/:id', authenticateToken, requireTeacher, intakeController.updateIntake);
router.delete('/:id', authenticateToken, requireTeacher, intakeController.deleteIntake);

export default router; 