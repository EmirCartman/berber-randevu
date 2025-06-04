import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getBarberAppointments,
  getCustomerAppointments,
  updateAppointmentStatus,
  updateAppointmentPhotos,
  getCompletedAppointments,
  addOrUpdateReview,
  getBarberReviews,
  getCustomerReviews
} from '../controllers/appointment.controller.js';

const router = express.Router();

// Public routes
router.get('/completed', getCompletedAppointments);
router.get('/:id', getAppointmentById);

// Protected routes
router.use(protect);

// Customer routes
router.post('/', authorize('customer'), createAppointment);
router.get('/customer', authorize('customer'), getCustomerAppointments);
router.get('/customer/reviews', authorize('customer'), getCustomerReviews);

// Barber routes
router.get('/barber', authorize('barber'), getBarberAppointments);
router.get('/barber/reviews', authorize('barber'), getBarberReviews);
router.put('/:id/status', authorize('barber'), updateAppointmentStatus);
router.put('/:id/photos', authorize('barber'), updateAppointmentPhotos);

// Admin routes
router.get('/', authorize('admin'), getAppointments);
router.put('/:id', authorize('admin'), updateAppointment);
router.delete('/:id', authorize('admin'), deleteAppointment);

export default router; 