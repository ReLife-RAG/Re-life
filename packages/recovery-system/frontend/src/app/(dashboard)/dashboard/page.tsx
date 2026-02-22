'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getStreak, getMoodHistory, dailyCheckIn, type StreakData, type MoodEntry } from '@/lib/auth-client';

/* ─── Streak Ring SVG Component ─── */
function StreakRing({ days, goal }: { days: number; goal: number }) {
  const radius = 70;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(days / goal, 1);
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="relative w-44 h-44 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
        {/* Background circle */}
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#E8F0F5" strokeWidth={stroke} />
        {/* Progress arc */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="url(#streakGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="streakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#40738E" />
            <stop offset="100%" stopColor="#8CD092" />
          </linearGradient>
        </defs>
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-[#1B2A3D]">{days}</span>
        <span className="text-[10px] font-bold text-[#40738E] tracking-widest uppercase">Days Clean</span>
      </div>
    </div>
  );
}

/* ─── Quick Access Card ─── */
function QuickCard({
  icon,
  label,
  href,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-2.5 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#40738E]/20 transition-all duration-200"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
        style={{ backgroundColor: color + '18' }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <span className="text-sm font-semibold text-[#1B2A3D] text-center">{label}</span>
    </Link>
  );
}

/* ─── Mood Emoji Button ─── */
function MoodButton({
  emoji,
  label,
  selected,
  onClick,
}: {
  emoji: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all duration-200 min-w-0 ${
        selected
          ? 'bg-[#40738E]/10 ring-2 ring-[#40738E] scale-105'
          : 'hover:bg-gray-100'
      }`}
    >
      <span className="text-xl sm:text-2xl">{emoji}</span>
      <span className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-wide leading-tight ${selected ? 'text-[#40738E]' : 'text-[#C4C4C4]'}`}>
        {label}
      </span>
    </button>
  );
}

/* ─── Mood name mapping (frontend emoji → backend value) ─── */
const MOOD_MAP: Record<string, string> = {
  Great: 'great',
  Okay: 'good',
  Anxious: 'okay',
  Sad: 'struggling',
  Angry: 'relapsed',
};

/* ─── Helper: relative time label ─── */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* ─── Mood emoji lookup ─── */
const MOOD_EMOJI: Record<string, string> = {
  great: '😄',
  good: '🙂',
  okay: '😰',
  struggling: '😢',
  relapsed: '😠',
};

/* ─── Main Dashboard Page ─── */
export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInMsg, setCheckInMsg] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Real data from backend
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastCheckIn: null,
    checkedInToday: false,
    milestones: [],
  });
  const [moodLog, setMoodLog] = useState<MoodEntry[]>([]);

  const firstName = user?.name?.split(' ')[0] || 'User';
  const streakDays = streakData.currentStreak;
  const streakGoal = 90;

  // Build "Today's Focus" from real state
  const todayMoodLogged = moodLog.length > 0 && new Date(moodLog[0].date).toDateString() === new Date().toDateString();
  const todaysFocus = [
    { id: '1', label: 'Daily Check-in', done: streakData.checkedInToday },
    { id: '2', label: 'Log Mood', done: todayMoodLogged },
    { id: '3', label: 'Read a Resource', done: false },
  ];

  const completedCount = todaysFocus.filter((t) => t.done).length;
  const totalTasks = todaysFocus.length;
  const completionPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Build "Recent Activity" from mood log
  const recentActivity = moodLog.slice(0, 5).map((entry, i) => ({
    id: String(i),
    icon: MOOD_EMOJI[entry.mood] || '📝',
    iconBg: entry.mood === 'great' || entry.mood === 'good' ? '#8CD092' : '#40738E',
    title: `Logged mood: ${entry.mood}`,
    time: timeAgo(entry.date),
  }));

  // ── Fetch data from backend ──
  const fetchData = useCallback(async () => {
    try {
      const [streak, mood] = await Promise.all([
        getStreak(),
        getMoodHistory(30),
      ]);
      setStreakData(streak);
      setMoodLog(mood.moodLog);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Handle mood check-in ──
  const handleCheckIn = async () => {
    if (!selectedMood) return;
    setCheckInLoading(true);
    setCheckInMsg(null);
    try {
      const backendMood = MOOD_MAP[selectedMood] || 'okay';
      const result = await dailyCheckIn({ mood: backendMood });
      setCheckInMsg(result.message);
      setSelectedMood(null);
      // Refresh data so streak / activity updates instantly
      await fetchData();
    } catch (err: any) {
      setCheckInMsg(err.message || 'Check-in failed');
    } finally {
      setCheckInLoading(false);
    }
  };

  const moods = [
    { emoji: '😄', label: 'Great' },
    { emoji: '🙂', label: 'Okay' },
    { emoji: '😰', label: 'Anxious' },
    { emoji: '😢', label: 'Sad' },
    { emoji: '😠', label: 'Angry' },
  ];

  if (dataLoading) {
    return (
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-[#40738E] border-t-transparent rounded-full" />
      </main>
    );
  }

  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* ── 3-Column Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ═══ LEFT COLUMN ═══ */}
        <div className="lg:col-span-3 space-y-6">
          {/* Current Streak */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-[#40738E] uppercase tracking-wider mb-4">
              Current Streak
            </h3>
            <StreakRing days={streakDays} goal={streakGoal} />
            <p className="text-center text-sm text-gray-500 mt-4 leading-relaxed">
              {streakDays === 0
                ? 'Your journey starts today. Complete your first check-in!'
                : 'You\'re doing amazing! Keep going — every day counts.'}
            </p>
            {streakDays > 0 && (
              <button className="w-full mt-3 text-[#8CD092] font-semibold text-sm hover:underline flex items-center justify-center gap-1 transition">
                Celebrate Progress
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Mood Tracker */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-[#40738E] uppercase tracking-wider mb-4">
              How are you feeling?
            </h3>
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
              {moods.map((m) => (
                <MoodButton
                  key={m.label}
                  emoji={m.emoji}
                  label={m.label}
                  selected={selectedMood === m.label}
                  onClick={() => setSelectedMood(m.label)}
                />
              ))}
            </div>
            {checkInMsg && (
              <p className={`mt-3 text-xs font-medium text-center ${
                checkInMsg.includes('already') || checkInMsg.includes('failed') ? 'text-red-500' : 'text-[#8CD092]'
              }`}>
                {checkInMsg}
              </p>
            )}
            {selectedMood && (
              <button
                onClick={handleCheckIn}
                disabled={checkInLoading}
                className="w-full mt-4 bg-[#40738E] text-white text-sm font-semibold py-2 rounded-xl hover:bg-[#356580] transition disabled:opacity-50"
              >
                {checkInLoading ? 'Logging...' : 'Log Mood & Check In'}
              </button>
            )}
          </div>
        </div>

        {/* ═══ CENTER COLUMN ═══ */}
        <div className="lg:col-span-6 space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-[#8CD092] to-[#6DBF76] rounded-2xl p-6 text-white shadow-sm">
            <h2 className="text-xl font-bold mb-1">
              {streakDays === 0 ? `Welcome, ${firstName}!` : `Welcome back, ${firstName}!`}
            </h2>
            <p className="text-white/90 text-sm mb-4">
              {totalTasks === 0
                ? 'Start exploring your recovery tools below. We\'re glad you\'re here.'
                : `You have ${todaysFocus.filter((t) => !t.done).length} goals remaining for today. You can do this!`}
            </p>
            {totalTasks > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white/30 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-white h-full rounded-full transition-all duration-500"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
                <span className="text-xs font-bold whitespace-nowrap">DAILY COMPLETION: {completionPct}%</span>
              </div>
            )}
          </div>

          {/* Quick Access Grid */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
              Quick Access
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <QuickCard
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                }
                label="AI Bot"
                href="/chat"
                color="#40738E"
              />
              <QuickCard
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                }
                label="Counselor"
                href="/counselors"
                color="#6DBF76"
              />
              <QuickCard
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                }
                label="Community"
                href="/community"
                color="#40738E"
              />
              <QuickCard
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                }
                label="My Progress"
                href="/progress"
                color="#8CD092"
              />
              <QuickCard
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                }
                label="Resources"
                href="/resources"
                color="#40738E"
              />
              <QuickCard
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-3.52 1.122 6.023 6.023 0 01-3.52-1.122" />
                  </svg>
                }
                label="Challenges"
                href="/games"
                color="#D4A03E"
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Recent Activity
              </h3>
              <Link href="/progress" className="text-[#40738E] text-xs font-semibold hover:underline">
                View All
              </Link>
            </div>
            {recentActivity.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">📋</div>
                <p className="text-sm text-[#C4C4C4]">No activity yet. Start your first task!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: item.iconBg + '20' }}
                    >
                      <span className="text-base">{item.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1B2A3D] truncate">{item.title}</p>
                      <p className="text-xs text-[#C4C4C4]">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ═══ RIGHT COLUMN ═══ */}
        <div className="lg:col-span-3 space-y-6">
          {/* Today's Focus */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-[#40738E] uppercase tracking-wider mb-4">
              Today&apos;s Focus
            </h3>
            {todaysFocus.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">🎯</div>
                <p className="text-sm text-[#C4C4C4]">No tasks yet. They&apos;ll appear as you go!</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {todaysFocus.map((task) => (
                    <div key={task.id} className="flex items-center gap-3">
                      {task.done ? (
                        <div className="w-5 h-5 rounded-full bg-[#8CD092] flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-[#C4C4C4] flex-shrink-0" />
                      )}
                      <span
                        className={`text-sm ${
                          task.done ? 'text-[#C4C4C4] line-through' : 'text-[#1B2A3D] font-medium'
                        }`}
                      >
                        {task.label}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Mini progress */}
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400 font-medium">Progress</span>
                    <span className="font-bold text-[#40738E]">{completedCount}/{totalTasks}</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#40738E] to-[#8CD092] transition-all duration-500"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Motivational Card */}
          <div className="bg-gradient-to-br from-[#40738E] to-[#2D5A70] rounded-2xl p-6 text-white shadow-sm">
            <p className="text-sm font-medium leading-relaxed mb-3">
              &quot;Recovery is not a race. You don&apos;t have to feel guilty if it takes you longer than you thought it would.&quot;
            </p>
            <span className="text-xs text-white/50 font-medium">— Daily Inspiration</span>
          </div>

          {/* Upcoming Reminders */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-[#40738E] uppercase tracking-wider mb-4">
              Upcoming
            </h3>
            <div className="text-center py-6">
              <div className="text-3xl mb-2">🔔</div>
              <p className="text-sm text-[#C4C4C4]">No upcoming events yet.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
