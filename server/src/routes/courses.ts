import { Router } from 'express';
import * as courseController from '../controllers/courses';
import { authenticateToken, requireTeacher } from '../middleware/auth';
import { uploadCourseThumbnail, handleUploadError } from '../middleware/upload';

const router = Router();

// Public endpoints (for authenticated users)
router.get('/',courseController.getAllCourses);
router.get('/teacher', authenticateToken, requireTeacher, courseController.getCoursesByTeacher);
router.get('/:id',courseController.getCourseById);
router.get('/:id/enrollments',courseController.getCourseEnrollments);

// Teacher/Admin endpoints
router.post('/', authenticateToken, requireTeacher, uploadCourseThumbnail, handleUploadError, courseController.createCourse);
router.put('/:id', authenticateToken, requireTeacher, uploadCourseThumbnail, handleUploadError, courseController.updateCourse);
router.delete('/:id', authenticateToken, requireTeacher, courseController.deleteCourse);

export default router; 