'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getStreak, getMoodHistory, dailyCheckIn, type StreakData, type MoodEntry } from '@/lib/auth-client';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Gamepad2,
  MessageSquare,
  Calendar,
  Search,
  Bell,
  ChevronRight,
  Plus,
  ArrowUpRight,
  TrendingUp,
  BrainCircuit,
  UserCheck,
  MoreHorizontal,
} from 'lucide-react';

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

/* ─── Nav items ─── */
const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Counselors', icon: UserCheck, href: '/counselors' },
  { name: 'Games', icon: Gamepad2, href: '/games' },
  { name: 'Library', icon: BookOpen, href: '/resources' },
  { name: 'Community', icon: Users, href: '/community' },
];

/* ─── Main Dashboard Page ─── */
export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInMsg, setCheckInMsg] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');

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

  // Mood bar heights from real mood log (last 7 days)
  const moodBarHeights = (() => {
    const last7 = moodLog.slice(0, 7);
    const moodToHeight: Record<string, number> = { great: 90, good: 70, okay: 55, struggling: 40, relapsed: 25 };
    if (last7.length === 0) return [40, 60, 45, 70, 55, 80, 65]; // fallback
    const heights = last7.map((e) => moodToHeight[e.mood] || 50);
    while (heights.length < 7) heights.push(30);
    return heights;
  })();

  // Support network from recent activity
  const supportNetwork = [
    { name: 'AI Assistant', role: 'Bot', status: 'Online', time: 'Now', color: 'bg-[#EAF7ED] text-[#86D293]' },
    { name: 'Counselor', role: 'Support', status: 'Available', time: 'Today', color: 'bg-[#EAF7ED] text-[#86D293]' },
    { name: 'Community', role: 'Group', status: 'Active', time: 'Today', color: 'bg-orange-100 text-orange-600' },
  ];

  if (dataLoading) {
    return (
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-[#86D293] border-t-transparent rounded-full" />
      </main>
    );
  }

  return (
    <main className="max-w-[1440px] mx-auto">
      <div className="bg-white rounded-[40px] shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[88vh] my-4 mx-2 md:mx-4">

        {/* ═══ MAIN CONTENT AREA ═══ */}
        <div className="flex-1 p-6 lg:p-10 flex flex-col gap-8">

          {/* ── Top Header with Nav Pills ── */}
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#86D293] rounded-xl flex items-center justify-center text-white">
                <BrainCircuit size={24} />
              </div>
              <div className="flex bg-[#F3F7F3] rounded-full p-1 gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setActiveTab(item.name)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeTab === item.name
                        ? 'bg-[#86D293] text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/progress"
                className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Plus size={18} />
                <span>Add goal</span>
              </Link>
              <button
                onClick={() => {
                  if (!selectedMood) {
                    setSelectedMood('Great');
                  }
                  handleCheckIn();
                }}
                disabled={checkInLoading}
                className="flex items-center gap-2 px-4 py-2 bg-[#86D293] text-white rounded-xl text-sm font-medium hover:bg-[#75c082] transition-colors disabled:opacity-50"
              >
                <Calendar size={18} />
                <span>{checkInLoading ? 'Logging...' : 'Daily Check-in'}</span>
              </button>
            </div>
          </header>

          {/* ── Welcome Section ── */}
          <section>
            <p className="text-slate-400 text-sm font-medium mb-1">Portal {'>'} Dashboard</p>
            <h1 className="text-3xl font-bold text-slate-900">
              {streakDays === 0 ? `Welcome, ${firstName}` : `Good morning, ${firstName}`}
            </h1>
            {checkInMsg && (
              <p className={`mt-2 text-sm font-medium ${
                checkInMsg.includes('already') || checkInMsg.includes('failed') ? 'text-red-500' : 'text-[#86D293]'
              }`}>
                {checkInMsg}
              </p>
            )}
          </section>

          {/* ═══ GRID LAYOUT ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">

            {/* ─── LEFT: Profile & Mood Chart ─── */}
            <div className="lg:col-span-3 space-y-6">

              {/* Profile Card */}
              <div className="bg-[#CFE1E1] rounded-[32px] overflow-hidden relative group h-[340px]">
                <div className="w-full h-full bg-gradient-to-br from-[#40738E] to-[#8CD092] flex items-center justify-center">
                  <span className="text-7xl font-bold text-white/80">
                    {firstName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] w-fit mb-2 flex items-center gap-1">
                    <TrendingUp size={10} /> {streakDays} Day Streak
                  </span>
                  <h3 className="text-xl font-bold">{user?.name || 'User'}</h3>
                  <p className="text-sm opacity-80">Recovery Member</p>

                  <div className="flex gap-2 mt-4">
                    <Link
                      href="/chat"
                      className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all"
                    >
                      <MessageSquare size={18} />
                    </Link>
                    <Link
                      href="/counselors"
                      className="flex-1 bg-white/20 backdrop-blur-md rounded-full px-4 text-xs font-semibold hover:bg-white/30 transition-all flex items-center justify-center"
                    >
                      Contact Counselor
                    </Link>
                  </div>
                </div>
              </div>

              {/* Weekly Mood Chart */}
              <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-slate-400 text-sm font-medium">Average Mood</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">
                        {moodLog.length > 0 ? 'Stable' : '—'}
                      </span>
                      {moodLog.length > 0 && (
                        <span className="text-[#86D293] text-xs font-bold">+{Math.min(streakDays, 15)}%</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="h-24 flex items-end gap-1">
                  {moodBarHeights.map((h, i) => (
                    <div key={i} className="flex-1 bg-slate-100 rounded-t-lg relative group overflow-hidden">
                      <div
                        className="absolute bottom-0 w-full bg-[#86D293] transition-all duration-500 group-hover:bg-[#6ab376]"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium">
                  <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                </div>
              </div>
            </div>

            {/* ─── RIGHT: Analytics & Cards ─── */}
            <div className="lg:col-span-9 space-y-6">

              {/* Top Row: Activity + Engagement */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Activity Progress Card */}
                <div className="md:col-span-2 bg-[#F3F7F3] rounded-[32px] p-8 flex flex-col justify-between min-h-[300px]">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#CFE1E1] rounded-2xl flex items-center justify-center text-[#4A7C7C]">
                        <Calendar size={24} />
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <h2 className="text-5xl font-bold">{streakDays}</h2>
                          <span className="bg-[#86D293] text-white text-[10px] px-2 py-0.5 rounded-full">
                            +{Math.min(streakDays, 5)}%
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mt-1">
                          Day Streak / Recovery
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Activity Scatter Visual */}
                  <div className="relative h-32 mt-8 flex items-center justify-around px-4">
                    {[...Array(15)].map((_, i) => (
                      <div key={i} className="flex flex-col gap-1 items-center">
                        <div className={`w-2 h-2 rounded-full ${i % 3 === 0 ? 'bg-[#4A7C7C]' : 'bg-[#4A7C7C]/20'}`} />
                        <div className={`w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-[#4A7C7C]' : 'bg-[#4A7C7C]/10'}`} />
                        <div className={`w-2 h-2 rounded-full ${i % 4 === 0 ? 'bg-[#4A7C7C]' : 'bg-[#4A7C7C]/30'}`} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">
                    <span>Start</span>
                    <div className="flex gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#4A7C7C]" />
                      <span className="w-2 h-2 rounded-full bg-[#4A7C7C]/40" />
                      <span className="w-2 h-2 rounded-full bg-[#4A7C7C]/10" />
                    </div>
                    <span>Goal: {streakGoal} Days</span>
                  </div>
                </div>

                {/* Engagement Breakdown */}
                <div className="bg-[#4A7C7C] rounded-[32px] p-6 text-white flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="bg-white/10 rounded-2xl p-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Check-ins</span>
                        <span className="text-xs font-bold">
                          {streakData.checkedInToday ? '✓ Done' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-3xl font-bold">{completionPct}%</span>
                        <span className="text-[10px] font-medium opacity-80">Daily goal</span>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Mood Logs</span>
                        <span className="text-xs font-bold text-[#86D293]">
                          {moodLog.length} entries
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-3xl font-bold">
                          {moodLog.length > 0 ? `${Math.round((moodLog.filter(m => m.mood === 'great' || m.mood === 'good').length / moodLog.length) * 100)}%` : '0%'}
                        </span>
                        <span className="text-[10px] font-medium opacity-80">Positive</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/progress"
                    className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-2xl text-xs font-bold transition-all text-center block mt-4"
                  >
                    View full report
                  </Link>
                </div>
              </div>

              {/* Bottom Row: Goal Progress + Today's Focus */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Goal Progress Gauge */}
                <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="font-bold text-slate-800">Goal Progress</h3>
                    <Link href="/progress" className="p-2 hover:bg-slate-50 rounded-xl">
                      <ChevronRight size={20} className="text-slate-400" />
                    </Link>
                  </div>

                  <div className="relative flex justify-center items-center py-4">
                    <svg className="w-48 h-24" viewBox="0 0 100 50">
                      <path
                        d="M 10,50 A 40,40 0 0,1 90,50"
                        fill="none"
                        stroke="#F0F4F4"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 10,50 A 40,40 0 0,1 70,14"
                        fill="none"
                        stroke="#86D293"
                        strokeWidth="8"
                        strokeDasharray="125"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute bottom-0 text-center">
                      <span className="text-4xl font-bold block">{streakDays}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Days Gained</span>
                    </div>
                  </div>

                  <div className="space-y-3 mt-8">
                    {[
                      { label: 'Check-ins', count: streakData.currentStreak, color: 'bg-[#86D293]' },
                      { label: 'Mood Logs', count: moodLog.length, color: 'bg-[#4A7C7C]' },
                      { label: 'Longest Streak', count: streakData.longestStreak, color: 'bg-slate-200' },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`} />
                          <span className="text-xs font-medium text-slate-500">{item.label}</span>
                        </div>
                        <span className="text-xs font-bold">{item.count} items</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Today's Focus + Milestones */}
                <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="font-bold text-slate-800">Today&apos;s Focus</h3>
                    <Link href="/progress" className="p-2 hover:bg-slate-50 rounded-xl">
                      <ChevronRight size={20} className="text-slate-400" />
                    </Link>
                  </div>

                  {/* Mood Selection */}
                  <div className="flex gap-2 mb-6 flex-wrap">
                    {moods.map((m) => (
                      <button
                        key={m.label}
                        onClick={() => setSelectedMood(m.label)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all ${
                          selectedMood === m.label
                            ? 'bg-[#86D293] text-white shadow-sm'
                            : 'bg-[#F0F4F4] text-[#4A7C7C] hover:bg-[#E2EBEB]'
                        }`}
                      >
                        <span>{m.emoji}</span>
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>

                  {selectedMood && (
                    <button
                      onClick={handleCheckIn}
                      disabled={checkInLoading}
                      className="w-full mb-6 py-2.5 bg-[#86D293] hover:bg-[#75c082] rounded-2xl text-xs font-bold transition-all text-white disabled:opacity-50"
                    >
                      {checkInLoading ? 'Logging...' : 'Log Mood & Check In'}
                    </button>
                  )}

                  {/* Milestones Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      <span>Milestones</span>
                      <span>{completionPct}% Done</span>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-6 flex-1 rounded-sm ${
                            i < Math.round((completedCount / totalTasks) * 12)
                              ? 'bg-[#86D293]'
                              : 'bg-slate-100'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[#86D293]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#86D293]" />
                        Completed
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        Pending
                      </div>
                    </div>
                  </div>

                  {/* Focus tasks */}
                  <div className="mt-6 space-y-2">
                    {todaysFocus.map((task) => (
                      <div key={task.id} className="flex items-center gap-3">
                        {task.done ? (
                          <div className="w-5 h-5 rounded-full bg-[#86D293] flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-200 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${
                          task.done ? 'text-slate-300 line-through' : 'text-slate-700 font-medium'
                        }`}>
                          {task.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT SIDEBAR ═══ */}
        <aside className="w-full md:w-[350px] bg-[#F9FBFA] border-l border-slate-50 p-6 flex flex-col gap-8">

          {/* Search & Profile */}
          <div className="flex items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search resources..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#86D293]/20"
              />
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button className="p-2 text-slate-400 hover:text-slate-600 relative">
                <Bell size={20} />
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#40738E] to-[#8CD092] flex items-center justify-center text-white font-bold text-sm border border-slate-200">
                {firstName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Support Network */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800">Support Network</h3>
              <MoreHorizontal size={20} className="text-slate-400" />
            </div>

            <div className="space-y-5">
              {supportNetwork.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#CFE1E1] flex items-center justify-center text-[#4A7C7C] font-bold text-sm">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">{item.role} • {item.time}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${item.color}`}>
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity (sidebar) */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Recent Activity</h3>
              <Link href="/progress" className="text-[#86D293] text-xs font-semibold hover:underline">
                View All
              </Link>
            </div>
            {recentActivity.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">📋</div>
                <p className="text-sm text-slate-400">No activity yet. Start your first task!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: item.iconBg + '20' }}
                    >
                      <span className="text-sm">{item.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{item.title}</p>
                      <p className="text-[10px] text-slate-400">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recovery Stats Card */}
          <div className="mt-auto bg-[#4A7C7C] rounded-[32px] p-6 text-white relative overflow-hidden">
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/5 rounded-full blur-2xl" />

            <div className="flex flex-col gap-6">
              <div className="flex gap-2">
                <div className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold">Base Recovery</div>
                <div className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold">Streak Bonus</div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center opacity-60">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Progress Level</span>
                  <span className="text-[10px] font-bold">
                    {streakDays >= 60 ? 'GOLD TIER' : streakDays >= 30 ? 'SILVER TIER' : 'BRONZE TIER'}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <h2 className="text-3xl font-bold">
                    {streakDays * 10} <span className="text-sm font-normal opacity-60">pts</span>
                  </h2>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold opacity-60">NEXT REWARD AT</span>
                    <span className="text-lg font-bold">{Math.ceil((streakDays * 10 + 100) / 100) * 100}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <Link
                  href="/progress"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <ArrowUpRight size={18} />
                </Link>
                <Link
                  href="/games"
                  className="flex-1 py-3 bg-[#86D293] hover:bg-[#75c082] rounded-2xl text-xs font-bold transition-all text-white text-center"
                >
                  View Challenges
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
