import { Router } from 'express';
import { isAuth } from '../middleware/isAuth';
import {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getCounselorAvailableSlots,
  addAvailableSlots,
} from '../controllers/booking.controller';

const router = Router();

// Public routes
router.get('/counselors/:counselorId/available-slots', getCounselorAvailableSlots);

// Protected routes
router.post('/bookings', isAuth, createBooking);
router.get('/bookings', isAuth, getUserBookings);
router.get('/bookings/:id', isAuth, getBookingById);
router.delete('/bookings/:id', isAuth, cancelBooking);

// Counselor-only routes
router.post('/counselors/:counselorId/available-slots', isAuth, addAvailableSlots);

export default router;
