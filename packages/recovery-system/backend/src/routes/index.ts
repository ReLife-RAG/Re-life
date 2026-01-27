import express from 'express';
import * as progressController from '../controllers/progress.controller';

const router = express.Router();

// ============================================
// Step 4: Progress Routes
// ============================================

// Daily Check-in Route
// POST /api/progress/checkin
// Body: { userId?: string, mood: string, notes?: string, energy?: number }
router.post('/progress/checkin', progressController.dailyCheckIn);

// Get Current Streak
// GET /api/progress/streak?userId=user_123
router.get('/progress/streak', progressController.getStreak);

// Get Mood History
// GET /api/progress/mood-history?userId=user_123&days=7
router.get('/progress/mood-history', progressController.getMoodHistory);

// TODO: Add authentication middleware when Person A completes Auth
// Example: router.post('/progress/checkin', authenticateUser, progressController.dailyCheckIn);

export default router;
