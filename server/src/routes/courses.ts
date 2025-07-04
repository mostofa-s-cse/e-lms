import { Router } from 'express';
import * as courseController from '../controllers/courses';
import { authenticateToken, requireTeacher } from '../middleware/auth';
import { uploadCourseThumbnail, handleUploadError } from '../middleware/upload';

const router = Router();

// Public endpoints (for authenticated users)
router.get('/', authenticateToken, courseController.getAllCourses);
router.get('/:id', authenticateToken, courseController.getCourseById);
router.get('/:id/enrollments', authenticateToken, courseController.getCourseEnrollments);

// Teacher/Admin endpoints
router.post('/', authenticateToken, requireTeacher, uploadCourseThumbnail, handleUploadError, courseController.createCourse);
router.put('/:id', authenticateToken, requireTeacher, uploadCourseThumbnail, handleUploadError, courseController.updateCourse);
router.delete('/:id', authenticateToken, requireTeacher, courseController.deleteCourse);

export default router; 