import { Router } from 'express';
import * as courseController from '../controllers/courses';
import { authenticateToken, requireTeacher } from '../middleware/auth';

const router = Router();

// Public endpoints (for authenticated users)
router.get('/', authenticateToken, courseController.getAllCourses);
router.get('/:id', authenticateToken, courseController.getCourseById);
router.get('/:id/enrollments', authenticateToken, courseController.getCourseEnrollments);

// Teacher/Admin endpoints
router.post('/', authenticateToken, requireTeacher, courseController.createCourse);
router.put('/:id', authenticateToken, requireTeacher, courseController.updateCourse);
router.delete('/:id', authenticateToken, requireTeacher, courseController.deleteCourse);

export default router; 