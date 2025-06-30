import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { 
  getAllEvaluations, 
  getEvaluationById, 
  createEvaluation, 
  updateEvaluation, 
  deleteEvaluation,
  getEvaluationsByCourse
} from '../controllers/evaluations';

const router = express.Router();

// Public routes (for students to view evaluations)
router.get('/', authenticateToken, getAllEvaluations);
router.get('/course/:courseId', authenticateToken, getEvaluationsByCourse);
router.get('/:id', authenticateToken, getEvaluationById);

// Protected routes (teachers and admins only)
router.post('/', authenticateToken, authorizeRoles(['TEACHER', 'ADMIN']), createEvaluation);
router.put('/:id', authenticateToken, authorizeRoles(['TEACHER', 'ADMIN']), updateEvaluation);
router.delete('/:id', authenticateToken, authorizeRoles(['TEACHER', 'ADMIN']), deleteEvaluation);

export default router; 