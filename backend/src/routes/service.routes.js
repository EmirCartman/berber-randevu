import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getBarberServices
} from '../controllers/service.controller.js';

const router = express.Router();

// Public routes
router.get('/barber/:barberId', getBarberServices);
router.get('/:id', getServiceById);

// Protected routes
router.use(protect);

// Barber routes
router.post('/', authorize('barber', 'admin'), createService);
router.put('/:id', authorize('barber', 'admin'), updateService);
router.delete('/:id', authorize('barber', 'admin'), deleteService);

export default router; 