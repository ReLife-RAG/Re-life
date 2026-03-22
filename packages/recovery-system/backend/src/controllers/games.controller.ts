import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Game, GameProgress, DailyCheckIn, Leaderboard } from '../models/Game';
import { syncLeaderboardHelper } from './progress.controller';

// ── Helpers ───────────────────────────────────────────────────────────────────
const todayStr  = (): string  => new Date().toISOString().slice(0, 10);
const getUserId = (req: Request): string =>
  (req as any).user?.id?.toString() || (req as any).user?._id?.toString();
const isValidId = (id: string): boolean => mongoose.Types.ObjectId.isValid(id);

// ── GET /games ─────────────────────────────────────────────────────────────────
export const getGames = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query;
    const filter: Record<string, unknown> = { isHidden: false };
    if (category && category !== 'all') filter.category = category;
    const games = await Game.find(filter).select('-__v').sort({ activePlayers: -1 });
    res.json({ success: true, data: games });
  } catch (err) {
    console.error('getGames:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch games' });
  }
};

// ── GET /games/:id ─────────────────────────────────────────────────────────────
export const getGameById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid game ID' }); return;
    }
    const game = await Game.findById(req.params.id);
    if (!game) { res.status(404).json({ success: false, message: 'Game not found' }); return; }
    res.json({ success: true, data: game });
  } catch (err) {
    console.error('getGameById:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch game' });
  }
};

// ── GET /games/progress ────────────────────────────────────────────────────────
export const getAllUserProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const progress = await GameProgress.find({ userId })
      .populate('gameId', 'name title category icon color')
      .sort({ lastPlayed: -1 });
    res.json({ success: true, data: progress });
  } catch (err) {
    console.error('getAllUserProgress:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch progress' });
  }
};

// ── GET /games/progress/:gameId ────────────────────────────────────────────────
export const getUserGameProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId  = getUserId(req);
    const { gameId } = req.params;
    if (!isValidId(gameId)) {
      res.status(400).json({ success: false, message: 'Invalid game ID' }); return;
    }
    let progress = await GameProgress.findOne({ userId, gameId })
      .populate('gameId', 'name title category icon color');
    if (!progress) {
      const game = await Game.findById(gameId);
      if (!game) { res.status(404).json({ success: false, message: 'Game not found' }); return; }
      progress = await GameProgress.create({ userId, gameId, gameType: game.name });
      await progress.populate('gameId', 'name title category icon color');
    }
    res.json({ success: true, data: progress });
  } catch (err) {
    console.error('getUserGameProgress:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch game progress' });
  }
};

// ── PUT /games/progress/:gameId ────────────────────────────────────────────────
export const updateGameProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId  = getUserId(req);
    const { gameId } = req.params;
    if (!isValidId(gameId)) {
      res.status(400).json({ success: false, message: 'Invalid game ID' }); return;
    }

    const game = await Game.findById(gameId);
    if (!game) { res.status(404).json({ success: false, message: 'Game not found' }); return; }

    const today = todayStr();
    const body  = req.body as Record<string, any>;

    // ── Fetch existing record ONCE for all guards ──────────────────────────
    const existing = await GameProgress.findOne({ userId, gameId });

    // Guard: sober — one pledge per day
    if (body.soberData?.pledgedToday === true) {
      if (existing?.soberData?.lastPledgeDate === today) {
        res.status(400).json({ success: false, message: 'Already pledged today' }); return;
      }
      body.soberData.lastPledgeDate = today;
    }

    // Guard: braver — one check-in per day
    if (body.braverData?.checkedInToday === true) {
      if (existing?.braverData?.lastCheckinDate === today) {
        res.status(400).json({ success: false, message: 'Already checked in today' }); return;
      }
      body.braverData.lastCheckinDate = today;
    }

    // Auto-reset: Habitica tasks on new day
    if (body.habiticaData && existing?.habiticaData?.lastTaskReset !== today) {
      body.habiticaData.tasksDoneToday = body.habiticaData.tasksDoneToday ?? [];
      body.habiticaData.lastTaskReset  = today;
    }

    // Auto-reset: Braver challenges on new day
    if (body.braverData && existing?.braverData?.lastChallengeReset !== today) {
      body.braverData.challengesDoneToday = body.braverData.challengesDoneToday ?? [];
      body.braverData.lastChallengeReset  = today;
    }

    // ── Build $set with dot notation (prevents wiping other nested fields) ─
    const setPayload: Record<string, any> = { lastPlayed: new Date() };

    // Scalar top-level fields
    const scalars = ['totalPoints', 'currentStreak', 'isFavorite'] as const;
    for (const key of scalars) {
      if (body[key] !== undefined) setPayload[key] = body[key];
    }

    // Auto-update longestStreak
    if (body.currentStreak !== undefined) {
      const current = existing?.longestStreak ?? 0;
      if (body.currentStreak > current) setPayload['longestStreak'] = body.currentStreak;
    }

    // Nested fields → dot notation so MongoDB merges instead of replacing
    const nested = ['soberData', 'forestData', 'habiticaData', 'braverData', 'mindfulData', 'journalData'] as const;
    for (const group of nested) {
      if (body[group] && typeof body[group] === 'object') {
        for (const [field, val] of Object.entries(body[group])) {
          setPayload[`${group}.${field}`] = val;
        }
      }
    }

    const progress = await GameProgress.findOneAndUpdate(
      { userId, gameId },
      { $set: setPayload },
      { new: true, upsert: true }
    ).populate('gameId', 'name title category icon color');

    // Sync leaderboard asynchronously (don't block response)
    syncLeaderboardHelper(userId).catch(console.error);

    res.json({ success: true, data: progress });
  } catch (err) {
    console.error('updateGameProgress:', err);
    res.status(500).json({ success: false, message: 'Failed to update progress' });
  }
};

// ── PUT /games/progress/:gameId/favorite ──────────────────────────────────────
export const toggleFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId  = getUserId(req);
    const { gameId } = req.params;
    if (!isValidId(gameId)) {
      res.status(400).json({ success: false, message: 'Invalid game ID' }); return;
    }
    const game = await Game.findById(gameId);
    if (!game) { res.status(404).json({ success: false, message: 'Game not found' }); return; }

    const existing = await GameProgress.findOne({ userId, gameId });
    const newFav   = !(existing?.isFavorite ?? false);

    const progress = await GameProgress.findOneAndUpdate(
      { userId, gameId },
      {
        $set:         { isFavorite: newFav },
        $setOnInsert: { gameType: game.name, totalPoints: 0, currentStreak: 0, longestStreak: 0 }
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: { isFavorite: progress!.isFavorite } });
  } catch (err) {
    console.error('toggleFavorite:', err);
    res.status(500).json({ success: false, message: 'Failed to toggle favorite' });
  }
};

// ── PUT /games/progress/:gameId/visibility ────────────────────────────────────
export const toggleGameVisibility = async (_req: Request, res: Response): Promise<void> => {
  res.json({ success: true, message: 'Visibility is client-side only' });
};

// ── POST /games/checkin ────────────────────────────────────────────────────────
export const dailyCheckIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const { mood, gamesPlayed = [], notes } = req.body as {
      mood: number; gamesPlayed?: string[]; notes?: string;
    };
    if (!mood || mood < 1 || mood > 5) {
      res.status(400).json({ success: false, message: 'mood must be 1–5' }); return;
    }
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const existing = await DailyCheckIn.findOne({ userId, date: today });
    if (existing) {
      res.status(400).json({ success: false, message: 'Already checked in today' }); return;
    }

    const pointsEarned = 10 + (Array.isArray(gamesPlayed) ? gamesPlayed.length * 5 : 0);
    const checkIn = await DailyCheckIn.create({
      userId, date: today, mood, gamesPlayed, pointsEarned, notes
    });

    syncLeaderboardHelper(userId).catch(console.error);
    res.json({ success: true, data: { checkIn, pointsEarned } });
  } catch (err) {
    console.error('dailyCheckIn:', err);
    res.status(500).json({ success: false, message: 'Check-in failed' });
  }
};

// ── GET /games/leaderboard ─────────────────────────────────────────────────────
export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit   = Math.min(Number(req.query.limit) || 10, 50);
    const entries = await Leaderboard.find().sort({ totalPoints: -1 }).limit(limit);
    const result  = entries.map((e, i) => ({
      _id:           e._id,
      username:      e.anonUsername,
      totalPoints:   e.totalPoints,
      currentStreak: e.currentStreak,
      rank:          i + 1,
    }));
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('getLeaderboard:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
  }
};

// ── GET /games/stats/user ─────────────────────────────────────────────────────
// Returns aggregated stats for the current user including total points from all games
export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!isValidId(userId)) {
      res.status(400).json({ success: false, message: 'Invalid user ID' }); return;
    }

    // Get all game progress for user
    const gameProgresses = await GameProgress.find({ userId });
    
    // Calculate totals
    const totalGamePoints = gameProgresses.reduce((sum, p) => sum + (p.totalPoints ?? 0), 0);
    const bestGameStreak = gameProgresses.length > 0 
      ? Math.max(...gameProgresses.map(p => p.currentStreak ?? 0))
      : 0;
    const longestGameStreak = gameProgresses.length > 0
      ? Math.max(...gameProgresses.map(p => p.longestStreak ?? 0))
      : 0;
    const gamesPlayed = gameProgresses.length;

    res.json({ 
      success: true, 
      data: {
        totalGamePoints,
        bestGameStreak,
        longestGameStreak,
        gamesPlayed,
        breakdown: gameProgresses.map(p => ({
          gameId: p.gameId,
          gameType: p.gameType,
          points: p.totalPoints,
          streak: p.currentStreak,
          longestStreak: p.longestStreak,
        }))
      }
    });
  } catch (err) {
    console.error('getUserStats:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch user stats' });
  }
};

// ── GET /games/activity ────────────────────────────────────────────────────────
export const getRecentActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const limit  = Math.min(Number(req.query.limit) || 5, 20);
    const recent = await GameProgress
      .find({ userId, lastPlayed: { $exists: true, $ne: null } })
      .populate('gameId', 'name title icon category color')
      .sort({ lastPlayed: -1 })
      .limit(limit);

    const activity = recent.map(p => ({
      game:          p.gameId,
      lastPlayed:    p.lastPlayed,
      totalPoints:   p.totalPoints,
      currentStreak: p.currentStreak,
    }));
    res.json({ success: true, data: activity });
  } catch (err) {
    console.error('getRecentActivity:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch activity' });
  }
};