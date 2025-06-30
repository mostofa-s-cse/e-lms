import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getAllQuestions,
  getQuestionById,
  getQuestionsByQuiz,
  createQuestion,
  updateQuestion,
  deleteQuestion
} from '../controllers/questions';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/questions - Get all questions
router.get('/', getAllQuestions);

// GET /api/questions/:id - Get question by ID
router.get('/:id', getQuestionById);

// GET /api/questions/quiz/:quizId - Get questions by quiz
router.get('/quiz/:quizId', getQuestionsByQuiz);

// POST /api/questions - Create new question
router.post('/', createQuestion);

// PUT /api/questions/:id - Update question
router.put('/:id', updateQuestion);

// DELETE /api/questions/:id - Delete question
router.delete('/:id', deleteQuestion);

export default router; 