import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { getReviews, addReview, updateReview, deleteReview } from '../controllers/review.controller.js';

const router = express.Router();

// Public routes
router.get('/', getReviews);

// Protected routes
router.use(protect);

// Customer routes
router.post('/', authorize('customer'), addReview);
router.put('/:id', authorize('customer'), updateReview);
router.delete('/:id', authorize('customer'), deleteReview);

export default router; 