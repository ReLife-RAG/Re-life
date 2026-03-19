import axios from 'axios';
import type {
  Game, GameProgress, DailyCheckIn,
  LeaderboardEntry, RecentActivity,
} from '@/types/games.types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// ── Auth token ────────────────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response wrapper ──────────────────────────────────────────────────────────
function unwrap<T>(res: { data: { success: boolean; data: T; message?: string } }): T {
  if (!res.data.success) throw new Error(res.data.message || 'API error');
  return res.data.data;
}

// ── Games API ─────────────────────────────────────────────────────────────────
export const gamesApi = {
  /** Fetch all visible games, optionally filtered by category */
  getGames: async (category?: string): Promise<Game[]> => {
    const params = category && category !== 'all' ? { category } : {};
    const res = await api.get('/games', { params });
    return unwrap<Game[]>(res);
  },

  /** Fetch a single game by MongoDB _id */
  getGameById: async (id: string): Promise<Game> => {
    const res = await api.get(`/games/${id}`);
    return unwrap<Game>(res);
  },

  /** Fetch all progress records for the current user */
  getAllUserProgress: async (): Promise<GameProgress[]> => {
    const res = await api.get('/games/progress');
    return unwrap<GameProgress[]>(res);
  },

  /** Fetch or create progress for a specific game */
  getUserGameProgress: async (gameId: string): Promise<GameProgress> => {
    const res = await api.get(`/games/progress/${gameId}`);
    return unwrap<GameProgress>(res);
  },

  /** Update progress for a specific game (partial update) */
  updateGameProgress: async (
    gameId: string,
    updates: Partial<GameProgress>
  ): Promise<GameProgress> => {
    const res = await api.put(`/games/progress/${gameId}`, updates);
    return unwrap<GameProgress>(res);
  },

  /** Toggle favourite status for a game */
  toggleFavorite: async (gameId: string): Promise<{ isFavorite: boolean }> => {
    const res = await api.put(`/games/progress/${gameId}/favorite`);
    return unwrap<{ isFavorite: boolean }>(res);
  },

  /** Submit daily check-in with mood 1–5 */
  dailyCheckIn: async (
    mood: number,
    gamesPlayed: string[] = [],
    notes?: string
  ): Promise<{ checkIn: DailyCheckIn; pointsEarned: number }> => {
    const res = await api.post('/games/checkin', { mood, gamesPlayed, notes });
    return unwrap<{ checkIn: DailyCheckIn; pointsEarned: number }>(res);
  },

  /** Fetch anonymous leaderboard */
  getLeaderboard: async (limit = 10): Promise<LeaderboardEntry[]> => {
    const res = await api.get(`/games/leaderboard?limit=${limit}`);
    return unwrap<LeaderboardEntry[]>(res);
  },

  /** Fetch recent game activity for the current user */
  getRecentActivity: async (limit = 5): Promise<RecentActivity[]> => {
    const res = await api.get(`/games/activity?limit=${limit}`);
    return unwrap<RecentActivity[]>(res);
  },
};

// ── Utility helpers ───────────────────────────────────────────────────────────
export const gameUtils = {
  /** CSS hex colour for a category */
  getCategoryColor: (category: string): string => ({
    substance:   '#5bbf7a',
    social:      '#5b9bf8',
    behavioral:  '#a67dd4',
    pornography: '#e8a020',
    screen:      '#e05555',
  }[category] ?? '#5bbf7a'),

  /** Tailwind icon-bg class for a category */
  getCategoryBg: (category: string): string => ({
    substance:   'bg-[#e6f7ec]',
    social:      'bg-[#e6f0fc]',
    behavioral:  'bg-[#f0e8fb]',
    pornography: 'bg-[#fdf4e3]',
    screen:      'bg-[#fdf4e3]',
  }[category] ?? 'bg-[#e6f7ec]'),

  /** Tailwind dot-colour class for a category */
  getCategoryDot: (category: string): string => ({
    substance:   'bg-[#5bbf7a]',
    social:      'bg-[#5b9bf8]',
    behavioral:  'bg-[#a67dd4]',
    pornography: 'bg-[#e8a020]',
    screen:      'bg-[#e05555]',
  }[category] ?? 'bg-[#5bbf7a]'),

  /** Human-readable category tag label */
  getCategoryLabel: (category: string): string => ({
    substance:   'Drug & Substance Recovery',
    social:      'Social Media Addiction',
    behavioral:  'General Behavioral Addiction',
    pornography: 'Pornography Addiction',
    screen:      'Screen Time Addiction',
  }[category] ?? category),

  /** Format seconds → "MM:SS" */
  formatTime: (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  },

  /** Mood integer 1–5 → emoji */
  getMoodEmoji: (mood: number): string =>
    ['😢', '😔', '😐', '😊', '😄'][mood - 1] ?? '😐',

  /** Today as YYYY-MM-DD */
  todayStr: (): string => new Date().toISOString().slice(0, 10),
};