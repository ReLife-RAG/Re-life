import express from 'express';
import * as progressController from '../controllers/progress.controller';
import { isAuth } from '../middleware/isAuth';

const router = express.Router();

// IMPORTANT: Auth routes are handled by the catch-all in app.ts
// app.all("/api/auth/*", toNodeHandler(auth)) in app.ts
// No need to add auth routes here to avoid conflicts

// Progress Routes (Protected)
router.post('/progress/checkin', isAuth, progressController.dailyCheckIn);
router.get('/progress/streak', isAuth, progressController.getStreak);
router.get('/progress/mood-history', isAuth, progressController.getMoodHistory);
router.get('/progress/history', isAuth, progressController.getHistory);

//Mood Tracking Routes (Protected)
router.post('/progress/mood', isAuth, progressController.logMood);
router.get('/progress/mood', isAuth, progressController.getMoodData);
router.get('/progress/mood/analytics', isAuth, progressController.getMoodAnalytics);

export default router;
