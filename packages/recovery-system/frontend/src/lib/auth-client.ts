/**
 * Auth Client - Communicates with BetterAuth backend endpoints
 * In development, Next.js rewrites proxy /api/* to the backend (http://localhost:5000)
 * This means we can use relative URLs, avoiding CORS issues entirely.
 */

// Use relative URL (proxied by Next.js rewrites) or direct backend URL
const API_URL = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

// ─── Types ───────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string;
  role?: 'user' | 'counselor' | 'admin';
  addictionTypes?: string[];
  recoveryStart?: string;
  accountStatus?: 'active' | 'suspended' | 'pending';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthSession {
  user: AuthUser;
  session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: string;
  };
}

export interface AuthResponse {
  user?: AuthUser;
  session?: AuthSession['session'];
  error?: string;
  message?: string;
}

// ─── API Functions ───────────────────────────────────────────────

/**
 * Sign up a new user with email and password
 */
export async function signUp(data: {
  email: string;
  password: string;
  name: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || json.error || 'Sign up failed');
  }

  return json;
}

/**
 * Sign in with email and password
 */
export async function signIn(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || json.error || 'Sign in failed');
  }

  return json;
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  await fetch(`${API_URL}/api/auth/sign-out`, {
    method: 'POST',
    credentials: 'include',
  });
}

/**
 * Get the current authenticated session
 */
export async function getSession(): Promise<AuthSession | null> {
  try {
    const res = await fetch(`${API_URL}/api/auth/get-session`, {
      credentials: 'include',
    });

    if (!res.ok) return null;

    const json = await res.json();
    if (!json || !json.user) return null;

    return json;
  } catch {
    return null;
  }
}

/**
 * Get full user profile (with custom recovery fields)
 */
export async function getProfile(): Promise<{ user: AuthUser } | null> {
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      credentials: 'include',
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/**
 * Update user profile (custom fields like addictionTypes, etc.)
 */
export async function updateProfile(data: {
  name?: string;
  addictionTypes?: string[];
  recoveryStart?: string;
  phone?: string;
  emergencyContact?: string;
  timezone?: string;
  profile?: { age?: number; bio?: string };
}): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || json.error || 'Profile update failed');
  }

  return json;
}

// ─── Progress API Functions ──────────────────────────────────────

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: string | null;
  checkedInToday: boolean;
  milestones: { name: string; targetDays: number; achieved: boolean; achievedDate?: string; description?: string }[];
  message?: string;
}

export interface MoodEntry {
  date: string;
  mood: 'great' | 'good' | 'okay' | 'struggling' | 'relapsed';
  notes?: string;
  energy?: number;
}

export interface CheckInResponse {
  message: string;
  progress: any;
  isFirstCheckIn?: boolean;
  newMilestones?: any[];
  streakContinued?: boolean;
}

/**
 * Get current streak & milestones
 */
export async function getStreak(): Promise<StreakData> {
  const res = await fetch(`${API_URL}/api/progress/streak`, {
    credentials: 'include',
  });

  const json = await res.json();

  // 404 means no progress yet (new user) — return zeros
  if (res.status === 404) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCheckIn: null,
      checkedInToday: false,
      milestones: [],
      message: json.message,
    };
  }

  if (!res.ok) {
    throw new Error(json.message || 'Failed to fetch streak');
  }

  return json;
}

/**
 * Get mood history (last N days)
 */
export async function getMoodHistory(days?: number): Promise<{ moodLog: MoodEntry[]; totalEntries: number }> {
  const url = days
    ? `${API_URL}/api/progress/mood-history?days=${days}`
    : `${API_URL}/api/progress/mood-history`;

  const res = await fetch(url, {
    credentials: 'include',
  });

  const json = await res.json();

  if (res.status === 404) {
    return { moodLog: [], totalEntries: 0 };
  }

  if (!res.ok) {
    throw new Error(json.message || 'Failed to fetch mood history');
  }

  return json;
}

/**
 * Daily check-in with mood
 */
export async function dailyCheckIn(data: {
  mood: string;
  notes?: string;
  energy?: number;
}): Promise<CheckInResponse> {
  const res = await fetch(`${API_URL}/api/progress/checkin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || 'Check-in failed');
  }

  return json;
}

// ─── Step 8: Mood Tracking API Functions ─────────────────────────

export interface MoodDataEntry {
  date: string;
  mood: string;
  score: number | null;
  notes?: string;
}

export interface MoodDataResponse {
  entries: MoodDataEntry[];
  averageScore: number;
  totalEntries: number;
}

export interface MoodAnalyticsResponse {
  trends: {
    sevenDay: { average: number | null; entries: number } | null;
    thirtyDay: { average: number | null; entries: number } | null;
    direction: 'improving' | 'declining' | 'stable' | 'insufficient_data';
  };
  patterns: {
    moodDistribution: Record<string, number>;
    mostFrequentMood: string | null;
    dayOfWeekAverages: Record<string, number | null>;
    bestDay: string | null;
    worstDay: string | null;
  };
  totalEntries: number;
}

export interface HistoryResponse {
  dates: string[];
  calendar: Record<string, { mood: string; hasCheckIn: boolean; notes?: string; energy?: number }>;
  stats: {
    totalCheckIns: number;
    currentStreak: number;
    longestStreak: number;
    lastCheckIn: string | null;
  };
}

/**
 * Log a mood entry (8.1)
 */
export async function logMood(data: { score: number; notes?: string }): Promise<{ message: string; entry: MoodDataEntry }> {
  const res = await fetch(`${API_URL}/api/progress/mood`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to log mood');
  return json;
}

/**
 * Get mood history with optional date range filtering (8.2)
 */
export async function getMoodData(params?: {
  startDate?: string;
  endDate?: string;
  days?: number;
}): Promise<MoodDataResponse> {
  const query = new URLSearchParams();
  if (params?.startDate) query.set('startDate', params.startDate);
  if (params?.endDate) query.set('endDate', params.endDate);
  if (params?.days) query.set('days', String(params.days));

  const url = `${API_URL}/api/progress/mood${query.toString() ? '?' + query.toString() : ''}`;
  const res = await fetch(url, { credentials: 'include' });
  const json = await res.json();

  if (res.status === 404) return { entries: [], averageScore: 0, totalEntries: 0 };
  if (!res.ok) throw new Error(json.message || 'Failed to fetch mood data');
  return json;
}

/**
 * Get mood analytics (8.3)
 */
export async function getMoodAnalytics(): Promise<MoodAnalyticsResponse> {
  const res = await fetch(`${API_URL}/api/progress/mood/analytics`, {
    credentials: 'include',
  });
  const json = await res.json();

  if (res.status === 404) {
    return {
      trends: { sevenDay: null, thirtyDay: null, direction: 'insufficient_data' },
      patterns: { moodDistribution: {}, mostFrequentMood: null, dayOfWeekAverages: {}, bestDay: null, worstDay: null },
      totalEntries: 0,
    };
  }
  if (!res.ok) throw new Error(json.message || 'Failed to fetch mood analytics');
  return json;
}

/**
 * Get streak/check-in history for calendar (7.4)
 */
export async function getCheckInHistory(days?: number): Promise<HistoryResponse> {
  const url = days
    ? `${API_URL}/api/progress/history?days=${days}`
    : `${API_URL}/api/progress/history`;

  const res = await fetch(url, { credentials: 'include' });
  const json = await res.json();

  if (res.status === 404) {
    return { dates: [], calendar: {}, stats: { totalCheckIns: 0, currentStreak: 0, longestStreak: 0, lastCheckIn: null } };
  }
  if (!res.ok) throw new Error(json.message || 'Failed to fetch history');
  return json;
}