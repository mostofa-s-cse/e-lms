import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { 
  getAllQuizzes, 
  getQuizById, 
  createQuiz, 
  updateQuiz, 
  deleteQuiz,
  getQuizzesByCourse
} from '../controllers/quizzes';

const router = express.Router();

// Public routes (for students to view quizzes)
router.get('/', authenticateToken, getAllQuizzes);
router.get('/course/:courseId', authenticateToken, getQuizzesByCourse);
router.get('/:id', authenticateToken, getQuizById);

// Protected routes (teachers and admins only)
router.post('/', authenticateToken, authorizeRoles(['TEACHER', 'ADMIN']), createQuiz);
router.put('/:id', authenticateToken, authorizeRoles(['TEACHER', 'ADMIN']), updateQuiz);
router.delete('/:id', authenticateToken, authorizeRoles(['TEACHER', 'ADMIN']), deleteQuiz);

export default router; 