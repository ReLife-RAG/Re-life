import { Router } from 'express';
import {
  getGames,
  getGameById,
  getUserGameProgress,
  getAllUserProgress,
  updateGameProgress,
  toggleFavorite,
  toggleGameVisibility,
  dailyCheckIn,
  getLeaderboard,
  getRecentActivity,
  getUserStats,
} from '../controllers/games.controller';
import { isAuth } from '../middleware/isAuth';

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
// IMPORTANT: specific paths must come before /:id to avoid param collision
router.get('/leaderboard', getLeaderboard);   // GET /games/leaderboard

// ── Protected — apply isAuth to everything below ──────────────────────────────
router.use(isAuth);

router.get('/stats/user',           getUserStats);          // GET  /games/stats/user
router.get('/progress',            getAllUserProgress);    // GET  /games/progress
router.get('/progress/:gameId',    getUserGameProgress);  // GET  /games/progress/:gameId
router.put('/progress/:gameId',    updateGameProgress);   // PUT  /games/progress/:gameId
router.put('/progress/:gameId/favorite',    toggleFavorite);         // PUT  /games/progress/:gameId/favorite
router.put('/progress/:gameId/visibility',  toggleGameVisibility);   // PUT  /games/progress/:gameId/visibility

router.get('/activity', getRecentActivity);  // GET  /games/activity
router.post('/checkin', dailyCheckIn);       // POST /games/checkin

// ── Wildcard — keep last ───────────────────────────────────────────────────────
router.get('/',    getGames);         // GET  /games?category=...
router.get('/:id', getGameById);      // GET  /games/:id

export default router;