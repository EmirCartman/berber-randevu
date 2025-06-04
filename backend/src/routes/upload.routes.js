import express from 'express';
import { upload, uploadPhoto } from '../controllers/upload.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Route for uploading a single photo
router.post('/', protect, upload.single('photo'), uploadPhoto);

export default router; 