import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { getBarbers, getBarberById, updateBarberProfile } from '../controllers/barber.controller.js';

const router = express.Router();

// Public routes
router.get('/', getBarbers);
router.get('/:id', getBarberById);

// Protected routes
router.use(protect);

// Barber routes
router.put('/profile', authorize('barber'), updateBarberProfile);

export default router; 