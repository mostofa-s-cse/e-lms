import { Router } from 'express';
import * as userController from '../controllers/users';
import { authenticateToken, requireAdmin, requireTeacher } from '../middleware/auth';

const router = Router();

// Public endpoints
router.get('/', authenticateToken, requireAdmin, userController.getAllUsers);
router.get('/:id', authenticateToken, userController.getUserById);

// Admin/Teacher endpoints
router.post('/', authenticateToken, requireAdmin, userController.createUser);
router.put('/:id', authenticateToken, requireAdmin, userController.updateUser);
router.delete('/:id', authenticateToken, requireAdmin, userController.deleteUser);

export default router; 