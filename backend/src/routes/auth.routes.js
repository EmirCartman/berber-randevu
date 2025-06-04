import express from 'express';
import { register, login, getProfile, updateProfile, uploadProfilePhoto, upload } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/profile/photo', protect, upload.single('photo'), uploadProfilePhoto);

export default router; 