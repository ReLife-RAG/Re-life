import express from 'express';
// FIX: Change from default import to named imports
import * as counselorController from '../controllers/counselor.controller';
// import { authMiddleware } from '../middlewares/auth.middleware'; // Uncomment when ready

const router = express.Router();

// NOTE: Add authMiddleware to all routes once authentication is ready
// Example: router.post('/counselors', authMiddleware, counselorController.createProfile);

// ========== STEP 13: COUNSELOR PROFILE MANAGEMENT ==========

// 13.1 Create Counselor Profile
// POST /api/counselors
router.post('/counselors', counselorController.createProfile);

// 13.2 Get All Counselors (with filtering and sorting)
// GET /api/counselors?specialization=anxiety&availability=true&sort=rating
router.get('/counselors', counselorController.getAllCounselors);

// 13.3 Get Single Counselor (with reviews/ratings)
// GET /api/counselors/:id
router.get('/counselors/:id', counselorController.getCounselor);

// 13.4 Update Counselor Profile
// PATCH /api/counselors/:id
router.patch('/counselors/:id', counselorController.updateProfile);

// ========== STEP 14: SESSION BOOKING SYSTEM ==========

// 14.1 Create Booking
// POST /api/sessions
router.post('/sessions', counselorController.createBooking);

// 14.2 Get User's Sessions (with status filter)
// GET /api/sessions/user?status=upcoming
router.get('/sessions/user', counselorController.getUserSessions);

// 14.3 Get Counselor's Sessions
// GET /api/sessions/counselor?status=completed
router.get('/sessions/counselor', counselorController.getCounselorSessions);

// 14.4 Cancel Session
// DELETE /api/sessions/:id
router.delete('/sessions/:id', counselorController.cancelSession);

// 14.5 Complete Session
// PATCH /api/sessions/:id/complete
router.patch('/sessions/:id/complete', counselorController.completeSession);

export default router;  