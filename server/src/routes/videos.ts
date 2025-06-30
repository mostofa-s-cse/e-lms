import { Router } from 'express';
import * as videoController from '../controllers/videos';
import { authenticateToken, requireTeacher } from '../middleware/auth';

const router = Router();

// Public endpoints (for authenticated users)
router.get('/', authenticateToken, videoController.getAllVideos);
router.get('/course/:courseId', authenticateToken, videoController.getVideosByCourse);
router.get('/:id', authenticateToken, videoController.getVideoById);

// Teacher/Admin endpoints
router.post('/', authenticateToken, requireTeacher, videoController.createVideo);
router.put('/:id', authenticateToken, requireTeacher, videoController.updateVideo);
router.delete('/:id', authenticateToken, requireTeacher, videoController.deleteVideo);

export default router; 