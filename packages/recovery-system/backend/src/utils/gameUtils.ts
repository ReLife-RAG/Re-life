// utils/gameUtils.ts
import GameState, { IGameState } from '../models/GameState';
import Activity from '../models/Activity';
import Achievement from '../models/Achievement';

/** ── Date Utilities ── */
export function getToday(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

/** ── Get or create user game state ── */
export async function getUserGame(userId: string): Promise<IGameState> {
  let game = await GameState.findOne({ userId });
  if (!game) {
    game = await GameState.create({
      userId,
      totalPoints: 0,
      soberDays: 0,
      forestCoins: 0,
      rpgXP: 0,
      rpgLevel: 1,
      braverDays: 0,
      totalFocusMinutes: 0,
      totalTasksCompleted: 0,
    });
  }
  return game;
}

/** ── Save daily activity ── */
export async function saveActivity(
  userId: string,
  gameId: string,
  points: number
): Promise<void> {
  const today = getToday();
  const existing = await Activity.findOne({ userId, gameId, date: today });

  if (existing) {
    existing.sessions += 1;
    existing.pointsEarned += points;
    await existing.save();
  } else {
    await Activity.create({
      userId,
      gameId,
      date: today,
      sessions: 1,
      pointsEarned: points,
    });
  }
}

/** ── Add points to user ── */
export async function addPoints(game: IGameState, points: number): Promise<IGameState> {
  game.totalPoints += points;
  game.rpgXP += Math.floor(points / 2);
  game.rpgLevel = Math.floor(game.rpgXP / 100) + 1;

  await game.save();
  return game;
}

/** ── Award achievement ── */
export async function awardAchievement(
  userId: string,
  achievementId: string,
  gameId: string,
  title: string,
  points: number
): Promise<void> {
  const exists = await Achievement.findOne({ userId, achievementId });
  if (!exists) {
    await Achievement.create({
      userId,
      achievementId,
      gameId,
      title,
      points,
      icon: '🏆',
      description: title,
      unlockedAt: new Date(),
    });
  }
}

/** ── Health Score ── */
export function getHealthScore(game: IGameState): number {
  let score = 0;
  score += Math.min(30, game.soberDays || 0); // sober days
  score += Math.min(20, game.braverDays || 0); // braver days
  score += Math.min(25, Math.floor((game.totalFocusMinutes || 0) / 10)); // focus
  score += Math.min(25, game.totalTasksCompleted || 0); // tasks
  return Math.min(100, score);
}

/** ── Money saved ── */
export function getMoneySaved(soberDays: number): number {
  return soberDays * 12; // simple: $12 per sober day
}

/** ── Format Date ── */
export function formatDate(dateStr: string): string {
  const today = getToday();
  if (dateStr === today) return 'Today';
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === yesterday.toISOString().slice(0, 10)) return 'Yesterday';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}