import express from 'express';
import {
  getCart,
  createOrUpdateCart,
  addToCart,
  removeFromCart,
  clearCart,
  mergeGuestCart
} from '../controllers/carts';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get cart (public - works for both guest and authenticated users)
router.get('/', getCart);

// Create or update cart (public - works for both guest and authenticated users)
router.post('/', createOrUpdateCart);

// Add item to cart (public - works for both guest and authenticated users)
router.post('/add', addToCart);

// Remove item from cart (public - works for both guest and authenticated users)
router.delete('/items/:itemId', removeFromCart);

// Clear cart (public - works for both guest and authenticated users)
router.delete('/clear', clearCart);

// Merge guest cart with user cart on login (authenticated users only)
router.post('/merge', authenticateToken, mergeGuestCart);

export default router; 