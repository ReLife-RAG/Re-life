import express from 'express';
import * as progressController from '../controllers/progress.controller';
import { isAuth } from '../middleware/isAuth';

const router = express.Router();

// Progress Routes (Protected)
router.post('/progress/checkin', isAuth, progressController.dailyCheckIn);
router.get('/progress/streak', isAuth, progressController.getStreak);
router.get('/progress/mood-history', isAuth, progressController.getMoodHistory);

export default router;
