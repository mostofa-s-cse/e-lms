import express from 'express';
import {
  getAllEnrollments,
  getEnrollmentById,
  getEnrollmentsByStudent,
  getEnrollmentsByCourse,
  getEnrollmentByStudentAndCourse,
  createEnrollment,
  updateEnrollmentStatus,
  deleteEnrollment,
} from '../controllers/enrollments';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all enrollments
router.get('/', getAllEnrollments);

// Get enrollment by ID
router.get('/:id', getEnrollmentById);

// Get enrollments by student
router.get('/student/:studentId', getEnrollmentsByStudent);

// Get enrollments by course
router.get('/course/:courseId', getEnrollmentsByCourse);

// Get enrollment by student and course
router.get('/student/:studentId/course/:courseId', getEnrollmentByStudentAndCourse);

// Create new enrollment
router.post('/', createEnrollment);

// Update enrollment status
router.patch('/:id/status', updateEnrollmentStatus);

// Delete enrollment
router.delete('/:id', deleteEnrollment);

export default router; 