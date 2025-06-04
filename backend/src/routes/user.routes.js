import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getBarbers
} from '../controllers/user.controller.js';

const router = express.Router();

// Public routes
router.get('/barbers', getBarbers);

// Protected routes
router.use(protect);

// Admin routes
router.get('/', authorize('admin'), getUsers);
router.get('/:id', authorize('admin'), getUserById);
router.post('/', authorize('admin'), createUser);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

export default router; 