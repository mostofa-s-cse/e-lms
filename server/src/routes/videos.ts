import { Router } from 'express';
import * as videoController from '../controllers/videos';
import { authenticateToken, requireTeacher } from '../middleware/auth';
import { uploadVideoFiles, handleUploadError } from '../middleware/upload';

const router = Router();

// Public endpoints (for authenticated users)
router.get('/', authenticateToken, videoController.getAllVideos);
router.get('/teacher', authenticateToken, requireTeacher, videoController.getVideosByTeacher);
router.get('/course/:courseId', authenticateToken, videoController.getVideosByCourse);
router.get('/:id', authenticateToken, videoController.getVideoById);

// Teacher/Admin endpoints with file upload
router.post('/', authenticateToken, requireTeacher, uploadVideoFiles, handleUploadError, videoController.createVideo);
router.put('/:id', authenticateToken, requireTeacher, uploadVideoFiles, handleUploadError, videoController.updateVideo);
router.delete('/:id', authenticateToken, requireTeacher, videoController.deleteVideo);

export default router; 