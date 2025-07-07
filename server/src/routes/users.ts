import { Router } from 'express';
import * as userController from '../controllers/users';
import { authenticateToken, requireAdmin, requireTeacher } from '../middleware/auth';
import { uploadProfilePicture, handleUploadError } from '../middleware/upload';

const router = Router();

// User endpoints
router.get('/', authenticateToken, requireAdmin, userController.getAllUsers);
router.get('/teachers', authenticateToken, requireTeacher, userController.getTeachers);
router.get('/students', authenticateToken, requireTeacher, userController.getStudents);
router.get('/:id', authenticateToken, userController.getUserById);

// Profile endpoints
router.get('/profile/me', authenticateToken, userController.getUserProfile);
router.get('/profile/:userId', authenticateToken, userController.getUserProfile);
router.put('/profile/me', authenticateToken, uploadProfilePicture, handleUploadError, userController.updateUserProfile);
router.put('/profile/:userId', authenticateToken, requireAdmin, uploadProfilePicture, handleUploadError, userController.updateUserProfile);

// Admin/Teacher endpoints
router.post('/', authenticateToken, requireAdmin, uploadProfilePicture, handleUploadError, userController.createUser);
router.put('/:id', authenticateToken, requireAdmin, uploadProfilePicture, handleUploadError, userController.updateUser);
router.delete('/:id', authenticateToken, requireAdmin, userController.deleteUser);

export default router; 