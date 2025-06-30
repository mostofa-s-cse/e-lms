import { Router } from 'express';
import * as noteController from '../controllers/notes';
import { authenticateToken, requireTeacher } from '../middleware/auth';
import { uploadSingle, handleUploadError } from '../middleware/upload';

const router = Router();

// Public endpoints (for authenticated users)
router.get('/', authenticateToken, noteController.getAllNotes);
router.get('/course/:courseId', authenticateToken, noteController.getNotesByCourse);
router.get('/:id', authenticateToken, noteController.getNoteById);

// Teacher/Admin endpoints
router.post('/', authenticateToken, requireTeacher, uploadSingle, handleUploadError, noteController.createNote);
router.put('/:id', authenticateToken, requireTeacher, noteController.updateNote);
router.delete('/:id', authenticateToken, requireTeacher, noteController.deleteNote);

export default router; 