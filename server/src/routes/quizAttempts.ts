import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import {
  getQuizAttemptsByQuiz,
  getQuizAttemptById,
  getAllQuizAttempts,
  getStudentQuizAttempts,
  getStudentQuizAttemptsByQuiz,
  createQuizAttempt,
  deleteQuizAttempt
} from '../controllers/quizAttempts';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/quizAttempts - Get all quiz attempts (admin/teacher only)
router.get('/', authorizeRoles(['ADMIN', 'TEACHER']), getAllQuizAttempts);

// GET /api/quizAttempts/student - Get quiz attempts for authenticated student
router.get('/student', authorizeRoles(['STUDENT']), getStudentQuizAttempts);

// GET /api/quizAttempts/student/quiz/:quizId - Get quiz attempts for specific quiz by authenticated student
router.get('/student/quiz/:quizId', authorizeRoles(['STUDENT']), getStudentQuizAttemptsByQuiz);

// GET /api/quizAttempts/quiz/:quizId - Get all attempts for a specific quiz
router.get('/quiz/:quizId', authorizeRoles(['ADMIN', 'TEACHER']), getQuizAttemptsByQuiz);

// GET /api/quizAttempts/:id - Get a single quiz attempt by ID
router.get('/:id', getQuizAttemptById);

// POST /api/quizAttempts - Create a new quiz attempt (students only)
router.post('/', authorizeRoles(['STUDENT']), createQuizAttempt);

// DELETE /api/quizAttempts/:id - Delete a quiz attempt (admin/teacher only)
router.delete('/:id', authorizeRoles(['ADMIN', 'TEACHER']), deleteQuizAttempt);

export default router; 