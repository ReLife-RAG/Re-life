'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  getStreak, getMoodHistory, getMoodData, dailyCheckIn, logMood,
  type StreakData, type MoodEntry,
} from '@/lib/auth-client';
import {
  Flame, Trophy, Heart, Calendar, TrendingUp, TrendingDown,
  Minus, CheckCircle2, Circle, BarChart3, MessageSquare,
  Users, Bot, UserCheck, ArrowRight, Plus, RefreshCw,
  Bell, Search, Star, Zap, Activity, Clock, ChevronRight,
  AlertCircle, X,
} from 'lucide-react';

// ─── Google Fonts ─────────────────────────────────────────────────────────────
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,700;1,9..144,300&family=DM+Sans:wght@300;400;500;600;700&display=swap');`;

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  teal:       '#4A7C7C',
  tealDark:   '#3a6060',
  tealLight:  '#CFE1E1',
  tealFaint:  '#EBF4F4',
  green:      '#86D293',
  greenDark:  '#5fa86e',
  greenFaint: '#EAF7ED',
  ink:        '#0f2420',
  inkMid:     '#2d4a47',
  inkMuted:   '#6b8a87',
  surface:    '#FFFFFF',
  offWhite:   '#F4F9F8',
  border:     '#DDE9E8',
  borderMid:  '#C8DCDB',
};

// ─── Mood helpers ─────────────────────────────────────────────────────────────
const MOOD_MAP: Record<string, string> = {
  Great:'great', Okay:'good', Anxious:'okay', Sad:'struggling', Angry:'relapsed',
};
const MOOD_SCORE: Record<string, number> = {
  great:9, good:7, okay:5, struggling:3, relapsed:1,
};
const MOOD_COLOR: Record<string, string> = {
  great:'#22c55e', good:'#86D293', okay:'#eab308', struggling:'#f97316', relapsed:'#ef4444',
};
const MOOD_LABEL: Record<string, string> = {
  great:'Great', good:'Good', okay:'Okay', struggling:'Struggling', relapsed:'Relapsed',
};

function timeAgo(d: string): string {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Animated number that counts up on mount */
function CountUp({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return <>{val}</>;
}

/** Thin horizontal mood bar chart for weekly view */
function MoodBarChart({ entries }: { entries: MoodEntry[] }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  // Build last-7-days buckets
  const buckets: { day: string; score: number | null }[] = days.map((day, i) => {
    const d = new Date();
    const dayOfWeek = d.getDay(); // 0=Sun
    const offset = (i + 1) - (dayOfWeek === 0 ? 7 : dayOfWeek); // Mon=0 offset
    const target = new Date(d);
    target.setDate(d.getDate() + offset);
    const key = target.toISOString().split('T')[0];
    const match = entries.find(e => e.date.startsWith(key));
    return { day, score: match ? (MOOD_SCORE[match.mood] ?? null) : null };
  });

  const maxScore = 10;
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 80 }}>
      {buckets.map(({ day, score }) => {
        const pct = score ? (score / maxScore) * 100 : 0;
        const col = score
          ? score >= 7 ? C.green : score >= 4 ? '#eab308' : '#f97316'
          : C.border;
        return (
          <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ width: '100%', height: 60, background: C.offWhite, borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div style={{ width: '100%', height: `${pct}%`, background: col, borderRadius: 8, transition: 'height 1s cubic-bezier(.4,0,.2,1)', minHeight: score ? 4 : 0 }} />
            </div>
            <span style={{ fontSize: 10, color: C.inkMuted, fontWeight: 500 }}>{day}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Mood score pill selector */
function MoodPicker({
  selected, onSelect,
}: { selected: string | null; onSelect: (m: string) => void }) {
  const opts = [
    { label: 'Great',    Icon: TrendingUp,   color: '#22c55e' },
    { label: 'Okay',     Icon: Minus,         color: C.green  },
    { label: 'Anxious',  Icon: AlertCircle,   color: '#eab308' },
    { label: 'Sad',      Icon: TrendingDown,  color: '#f97316' },
    { label: 'Angry',    Icon: Activity,      color: '#ef4444' },
  ];
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {opts.map(({ label, Icon, color }) => {
        const active = selected === label;
        return (
          <button key={label} onClick={() => onSelect(label)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 999, border: `1.5px solid ${active ? color : C.border}`, background: active ? `${color}15` : C.surface, color: active ? color : C.inkMuted, fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer', transition: 'all .15s', fontFamily: "'DM Sans', sans-serif" }}>
            <Icon size={14} strokeWidth={active ? 2.5 : 2} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

/** Inline toast notification */
function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error' | 'info'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const bg = type === 'error' ? '#fef2f2' : type === 'info' ? C.tealFaint : C.greenFaint;
  const border = type === 'error' ? '#fca5a5' : type === 'info' ? C.tealLight : '#b0dfc4';
  const color = type === 'error' ? '#dc2626' : type === 'info' ? C.tealDark : '#166534';
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 24px rgba(0,0,0,.1)', zIndex: 9999, maxWidth: 340, fontFamily: "'DM Sans', sans-serif", animation: 'slideIn .25s ease' }}>
      <CheckCircle2 size={16} strokeWidth={2} color={color} />
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color }}>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color, display: 'flex' }}><X size={14} /></button>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();

  // ── State ──
  const [streak,         setStreak]         = useState<StreakData | null>(null);
  const [moodLog,        setMoodLog]        = useState<MoodEntry[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [selectedMood,   setSelectedMood]   = useState<string | null>(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [toast,          setToast]          = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Mood logger popup
  const [showMoodPop,    setShowMoodPop]    = useState(false);
  const [popScore,       setPopScore]       = useState(6);
  const [popNotes,       setPopNotes]       = useState('');
  const [popLoading,     setPopLoading]     = useState(false);
  const popTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const firstName = user?.name?.split(' ')[0] || 'there';

  // ── Fetch ──
  const fetchData = useCallback(async () => {
    try {
      const [s, m] = await Promise.all([getStreak(), getMoodHistory(30)]);
      setStreak(s);
      setMoodLog(m.moodLog || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Show mood popup 2s after load if not logged today
  useEffect(() => {
    if (loading) return;
    const todayLogged = moodLog.some(e => new Date(e.date).toDateString() === new Date().toDateString());
    if (!todayLogged) {
      popTimerRef.current = setTimeout(() => setShowMoodPop(true), 2000);
    }
    return () => { if (popTimerRef.current) clearTimeout(popTimerRef.current); };
  }, [loading, moodLog]);

  // ── Derived ──
  const streakDays    = streak?.currentStreak ?? 0;
  const longestStreak = streak?.longestStreak ?? 0;
  const checkedIn     = streak?.checkedInToday ?? false;
  const totalCheckIns = moodLog.length;
  const avgMoodScore  = moodLog.length > 0
    ? Math.round(moodLog.slice(0, 30).reduce((s, e) => s + (MOOD_SCORE[e.mood] ?? 5), 0) / Math.min(moodLog.length, 30) * 10) / 10
    : 0;

  const todayMoodLogged = moodLog.some(e => new Date(e.date).toDateString() === new Date().toDateString());
  const todaysFocus = [
    { id: 'checkin', label: 'Daily Check-in',    done: checkedIn },
    { id: 'mood',    label: 'Log Your Mood',     done: todayMoodLogged },
    { id: 'journal', label: 'Write in Journal',  done: false },
    { id: 'game',    label: 'Play a Game',       done: false },
  ];
  const focusDone  = todaysFocus.filter(t => t.done).length;
  const focusTotal = todaysFocus.length;

  // Recent activity from mood log
  const recentActivity = moodLog.slice(0, 6).map(e => ({
    icon: Heart,
    label: `Logged mood: ${MOOD_LABEL[e.mood] ?? e.mood}`,
    time: timeAgo(e.date),
    color: MOOD_COLOR[e.mood] ?? C.green,
  }));

  // Mood trend
  const recentScores = moodLog.slice(0, 7).map(e => MOOD_SCORE[e.mood] ?? 5);
  const moodTrend = recentScores.length >= 2
    ? recentScores[0] > recentScores[recentScores.length - 1] ? 'improving'
    : recentScores[0] < recentScores[recentScores.length - 1] ? 'declining' : 'stable'
    : 'stable';

  const TrendIcon = moodTrend === 'improving' ? TrendingUp : moodTrend === 'declining' ? TrendingDown : Minus;
  const trendColor = moodTrend === 'improving' ? '#22c55e' : moodTrend === 'declining' ? '#ef4444' : '#eab308';

  // Recovery points
  const points = streakDays * 10 + totalCheckIns * 5;
  const nextReward = Math.ceil((points + 1) / 100) * 100;
  const pointsPct  = Math.round((points % 100));

  // ── Handlers ──
  const showToast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type });
  }, []);

  const handleQuickCheckIn = async () => {
    if (checkedIn || checkInLoading || !selectedMood) return;
    setCheckInLoading(true);
    try {
      const backendMood = MOOD_MAP[selectedMood] ?? 'okay';
      await dailyCheckIn({ mood: backendMood });
      showToast('Check-in complete! Streak updated.', 'success');
      setSelectedMood(null);
      await fetchData();
    } catch (err: any) {
      const msg = err?.message ?? '';
      if (msg.toLowerCase().includes('already')) {
        showToast('Already checked in today!', 'info');
      } else {
        showToast(err?.message ?? 'Check-in failed', 'error');
      }
    } finally {
      setCheckInLoading(false);
    }
  };

  const handlePopupSubmit = async () => {
    setPopLoading(true);
    try {
      const moodLabels: Record<number, string> = { 1:'relapsed',2:'relapsed',3:'struggling',4:'struggling',5:'okay',6:'okay',7:'good',8:'good',9:'great',10:'great' };
      const mood = moodLabels[popScore] ?? 'okay';
      // Try daily check-in first (will fail silently if already done)
      await dailyCheckIn({ mood, energy: popScore, notes: popNotes || undefined }).catch(() => {});
      // Always log mood entry
      await logMood({ score: popScore, notes: popNotes || undefined });
      showToast('Mood logged successfully!', 'success');
      setShowMoodPop(false);
      setPopNotes('');
      setPopScore(6);
      await fetchData();
    } catch (err: any) {
      showToast(err?.message ?? 'Failed to log mood', 'error');
    } finally {
      setPopLoading(false);
    }
  };

  // ── Greeting ──
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // ── Styles ──
  const card: React.CSSProperties = {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 20,
    boxShadow: '0 2px 12px rgba(74,124,124,.06)',
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '.1em',
    textTransform: 'uppercase',
    color: C.inkMuted,
    marginBottom: 12,
  };

  if (loading) return (
    <>
      <style>{FONTS}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.green}`, borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: 14, color: C.inkMuted, fontFamily: "'DM Sans', sans-serif" }}>Loading your dashboard…</p>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </>
  );

  return (
    <>
      <style>{FONTS}</style>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        @keyframes slideIn { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:none; } }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(.95); } to { opacity:1; transform:scale(1); } }
        .dash-fi { animation: fadeUp .4s both; }
        .dash-fi-1 { animation-delay:.06s; }
        .dash-fi-2 { animation-delay:.12s; }
        .dash-fi-3 { animation-delay:.18s; }
        .dash-fi-4 { animation-delay:.24s; }
        .dash-fi-5 { animation-delay:.30s; }
        .hover-lift { transition: transform .15s, box-shadow .15s; }
        .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(74,124,124,.12) !important; }
      `}</style>

      {/* Mood popup */}
      {showMoodPop && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,36,32,.45)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: '0 16px' }}>
          <div style={{ background: C.surface, borderRadius: 24, padding: '32px 28px', width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(15,36,32,.2)', animation: 'scaleIn .3s ease', fontFamily: "'DM Sans', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, fontWeight: 400, color: C.ink, lineHeight: 1.2, marginBottom: 4 }}>How are you feeling today?</p>
                <p style={{ fontSize: 13, color: C.inkMuted }}>Take a moment to check in with yourself</p>
              </div>
              <button onClick={() => setShowMoodPop(false)} style={{ background: C.offWhite, border: 'none', borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <X size={16} strokeWidth={2} color={C.inkMuted} />
              </button>
            </div>

            {/* Score display */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 72, fontWeight: 300, color: C.teal, lineHeight: 1, marginBottom: 4 }}>{popScore}</div>
              <div style={{ fontSize: 12, color: C.inkMuted, letterSpacing: '.08em', textTransform: 'uppercase' }}>out of 10</div>
            </div>

            {/* Slider */}
            <div style={{ marginBottom: 20 }}>
              <input type="range" min={1} max={10} value={popScore} onChange={e => setPopScore(Number(e.target.value))}
                style={{ width: '100%', accentColor: C.teal, height: 6 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.inkMuted, marginTop: 4 }}>
                <span>Struggling</span><span>Thriving</span>
              </div>
            </div>

            {/* Quick picks */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
              {[{s:2,l:'Low'},{s:4,l:'Rough'},{s:6,l:'Okay'},{s:8,l:'Good'},{s:10,l:'Great'}].map(m => (
                <button key={m.s} onClick={() => setPopScore(m.s)}
                  style={{ padding: '6px 14px', borderRadius: 999, border: `1.5px solid ${popScore === m.s ? C.teal : C.border}`, background: popScore === m.s ? C.tealFaint : C.surface, color: popScore === m.s ? C.teal : C.inkMuted, fontSize: 12, fontWeight: popScore === m.s ? 600 : 400, cursor: 'pointer', transition: 'all .15s', fontFamily: "'DM Sans', sans-serif" }}>
                  {m.l}
                </button>
              ))}
            </div>

            {/* Notes */}
            <textarea value={popNotes} onChange={e => setPopNotes(e.target.value)}
              placeholder="Any notes? (optional)" rows={2} maxLength={500}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "'DM Sans', sans-serif", resize: 'none', outline: 'none', color: C.ink, background: C.offWhite, boxSizing: 'border-box', marginBottom: 16 }} />

            {/* Submit */}
            <button onClick={handlePopupSubmit} disabled={popLoading}
              style={{ width: '100%', padding: '13px', borderRadius: 14, border: 'none', background: `linear-gradient(135deg, ${C.teal}, ${C.green})`, color: '#fff', fontSize: 14, fontWeight: 600, cursor: popLoading ? 'not-allowed' : 'pointer', opacity: popLoading ? .65 : 1, fontFamily: "'DM Sans', sans-serif", transition: 'opacity .15s' }}>
              {popLoading ? 'Saving…' : 'Log Mood & Check In'}
            </button>
            <button onClick={() => setShowMoodPop(false)} style={{ width: '100%', marginTop: 8, padding: '10px', borderRadius: 12, border: 'none', background: 'none', color: C.inkMuted, fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              Skip for now
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* ═══ PAGE ROOT ═══ */}
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: C.ink }}>

        {/* ── PAGE HEADER ── */}
        <div className="dash-fi" style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 12, color: C.inkMuted, marginBottom: 6, letterSpacing: '.03em' }}>
            Portal &rsaquo; <strong style={{ color: C.inkMid, fontWeight: 600 }}>Dashboard</strong>
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 34, fontWeight: 400, color: C.ink, letterSpacing: '-.3px', lineHeight: 1.1, marginBottom: 4 }}>
                {greeting}, {firstName}
              </h1>
              <p style={{ fontSize: 14, color: C.inkMuted, fontWeight: 400 }}>
                {checkedIn ? "You've checked in today — keep the momentum going." : "Start your day with a check-in below."}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowMoodPop(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.surface, color: C.inkMid, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.color = C.teal; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.inkMid; }}>
                <BarChart3 size={15} strokeWidth={2} /> Log Mood
              </button>
              <Link href="/progress"
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 12, border: 'none', background: C.teal, color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>
                <Activity size={15} strokeWidth={2} /> View Progress
              </Link>
            </div>
          </div>
        </div>

        {/* ═══ HERO STATS STRIP ═══ */}
        <div className="dash-fi dash-fi-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {/* Streak — featured card */}
          <div className="hover-lift" style={{ ...card, background: `linear-gradient(135deg, ${C.teal} 0%, ${C.tealDark} 100%)`, borderColor: 'transparent', padding: '22px 20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
            <div style={{ position: 'absolute', bottom: -30, left: -10, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, position: 'relative' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Flame size={18} strokeWidth={2} color="#fff" />
              </div>
              {checkedIn && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,.7)', background: 'rgba(255,255,255,.12)', borderRadius: 999, padding: '3px 10px' }}>Today Done</span>}
            </div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 52, fontWeight: 300, color: '#fff', lineHeight: 1, marginBottom: 4, position: 'relative' }}>
              <CountUp target={streakDays} />
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.08em', position: 'relative' }}>Day Streak</p>
          </div>

          {/* Longest Streak */}
          <div className="hover-lift" style={{ ...card, padding: '22px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef9e7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={18} strokeWidth={2} color="#b45309" />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#b45309', background: '#fef9e7', borderRadius: 999, padding: '3px 10px', letterSpacing: '.04em' }}>Best</span>
            </div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 44, fontWeight: 300, color: C.ink, lineHeight: 1, marginBottom: 4 }}>
              <CountUp target={longestStreak} />
            </div>
            <p style={{ fontSize: 12, color: C.inkMuted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.08em' }}>Longest Streak</p>
          </div>

          {/* Avg Mood */}
          <div className="hover-lift" style={{ ...card, padding: '22px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${C.greenFaint}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart size={18} strokeWidth={2} color={C.green} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <TrendIcon size={13} strokeWidth={2.5} color={trendColor} />
                <span style={{ fontSize: 11, fontWeight: 600, color: trendColor, textTransform: 'capitalize' }}>{moodTrend}</span>
              </div>
            </div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 44, fontWeight: 300, color: C.ink, lineHeight: 1, marginBottom: 4 }}>
              {avgMoodScore > 0 ? avgMoodScore.toFixed(1) : '—'}
            </div>
            <p style={{ fontSize: 12, color: C.inkMuted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.08em' }}>Avg Mood (30d)</p>
          </div>

          {/* Check-ins */}
          <div className="hover-lift" style={{ ...card, padding: '22px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.tealFaint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={18} strokeWidth={2} color={C.teal} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.teal, background: C.tealFaint, borderRadius: 999, padding: '3px 10px', letterSpacing: '.04em' }}>Total</span>
            </div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 44, fontWeight: 300, color: C.ink, lineHeight: 1, marginBottom: 4 }}>
              <CountUp target={totalCheckIns} />
            </div>
            <p style={{ fontSize: 12, color: C.inkMuted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.08em' }}>Check-ins</p>
          </div>
        </div>

        {/* ═══ MAIN GRID ═══ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

          {/* ── LEFT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>

            {/* CHECK-IN + MOOD SELECTOR */}
            <div className="dash-fi dash-fi-2" style={{ ...card, padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <p style={sectionLabel}>Today's Check-in</p>
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 400, color: C.ink }}>
                    {checkedIn ? 'Already checked in — great work!' : 'Select your mood to check in'}
                  </p>
                </div>
                {checkedIn && (
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: C.greenFaint, border: `2px solid ${C.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={22} strokeWidth={2} color={C.green} />
                  </div>
                )}
              </div>

              {!checkedIn && (
                <>
                  <MoodPicker selected={selectedMood} onSelect={setSelectedMood} />
                  {selectedMood && (
                    <button onClick={handleQuickCheckIn} disabled={checkInLoading}
                      style={{ marginTop: 14, width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${C.teal}, ${C.green})`, color: '#fff', fontSize: 14, fontWeight: 600, cursor: checkInLoading ? 'not-allowed' : 'pointer', opacity: checkInLoading ? .7 : 1, fontFamily: "'DM Sans', sans-serif", transition: 'opacity .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      {checkInLoading
                        ? <><RefreshCw size={15} strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }} /> Checking in…</>
                        : <><CheckCircle2 size={15} strokeWidth={2} /> Check In as {selectedMood}</>}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* MOOD CHART */}
            <div className="dash-fi dash-fi-2" style={{ ...card, padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <p style={sectionLabel}>Weekly Mood</p>
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 400, color: C.ink }}>This week's overview</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: `${trendColor}12`, border: `1px solid ${trendColor}30` }}>
                  <TrendIcon size={13} strokeWidth={2.5} color={trendColor} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: trendColor, textTransform: 'capitalize' }}>{moodTrend}</span>
                </div>
              </div>
              {moodLog.length > 0 ? (
                <MoodBarChart entries={moodLog} />
              ) : (
                <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.offWhite, borderRadius: 12 }}>
                  <p style={{ fontSize: 13, color: C.inkMuted }}>Log moods to see your chart</p>
                </div>
              )}
              {/* Legend */}
              <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
                {[['#22c55e', 'Great (7-10)'], ['#eab308', 'Okay (4-6)'], ['#f97316', 'Low (1-3)']].map(([col, label]) => (
                  <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: col as string }} />
                    <span style={{ fontSize: 11, color: C.inkMuted }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* TODAY'S FOCUS */}
            <div className="dash-fi dash-fi-3" style={{ ...card, padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <p style={sectionLabel}>Today's Focus</p>
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 400, color: C.ink }}>
                    {focusDone} of {focusTotal} tasks done
                  </p>
                </div>
                {/* Progress ring */}
                <svg width={52} height={52} viewBox="0 0 52 52">
                  <circle cx={26} cy={26} r={22} fill="none" stroke={C.border} strokeWidth={5} />
                  <circle cx={26} cy={26} r={22} fill="none" stroke={C.teal} strokeWidth={5}
                    strokeDasharray={2 * Math.PI * 22}
                    strokeDashoffset={2 * Math.PI * 22 * (1 - focusDone / focusTotal)}
                    strokeLinecap="round" transform="rotate(-90 26 26)"
                    style={{ transition: 'stroke-dashoffset .8s ease' }} />
                  <text x={26} y={31} textAnchor="middle" fontSize={14} fontWeight={700} fill={C.teal}>
                    {Math.round(focusDone / focusTotal * 100)}%
                  </text>
                </svg>
              </div>

              {/* Progress bar */}
              <div style={{ height: 6, background: C.offWhite, borderRadius: 999, overflow: 'hidden', marginBottom: 18 }}>
                <div style={{ height: '100%', width: `${(focusDone / focusTotal) * 100}%`, background: `linear-gradient(90deg, ${C.teal}, ${C.green})`, borderRadius: 999, transition: 'width .8s ease' }} />
              </div>

              {/* Tasks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {todaysFocus.map(task => (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: task.done ? C.greenFaint : C.offWhite, border: `1px solid ${task.done ? '#b0dfc4' : C.border}`, transition: 'all .2s' }}>
                    {task.done
                      ? <CheckCircle2 size={18} strokeWidth={2} color={C.green} />
                      : <Circle size={18} strokeWidth={1.8} color={C.inkMuted} />}
                    <span style={{ flex: 1, fontSize: 14, fontWeight: task.done ? 400 : 500, color: task.done ? C.inkMuted : C.ink, textDecoration: task.done ? 'line-through' : 'none' }}>
                      {task.label}
                    </span>
                    {!task.done && (
                      <Link href={task.id === 'checkin' ? '/dashboard' : task.id === 'mood' ? '/progress' : task.id === 'journal' ? '/journals' : '/games'}
                        style={{ fontSize: 12, color: C.teal, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                        Do it <ArrowRight size={12} strokeWidth={2.5} />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div className="dash-fi dash-fi-3" style={{ ...card, padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <p style={sectionLabel}>Recent Activity</p>
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 400, color: C.ink }}>Your latest actions</p>
                </div>
                <Link href="/progress" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: C.teal, fontWeight: 600, textDecoration: 'none' }}>
                  View all <ChevronRight size={15} strokeWidth={2.5} />
                </Link>
              </div>

              {recentActivity.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', background: C.offWhite, borderRadius: 12 }}>
                  <Clock size={28} strokeWidth={1.5} color={C.inkMuted} style={{ marginBottom: 8 }} />
                  <p style={{ fontSize: 13, color: C.inkMuted }}>No activity yet — start by logging your mood!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {recentActivity.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, transition: 'background .15s', cursor: 'default' }}
                      onMouseEnter={e => (e.currentTarget.style.background = C.offWhite)}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <item.icon size={16} strokeWidth={2} color={item.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</p>
                        <p style={{ fontSize: 11, color: C.inkMuted, marginTop: 1 }}>{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>

            {/* PROFILE CARD */}
            <div className="dash-fi dash-fi-2" style={{ ...card, padding: '24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60, background: `linear-gradient(135deg, ${C.teal}, ${C.green})` }} />
              <div style={{ position: 'relative', paddingTop: 20 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${C.teal}, ${C.green})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '3px solid #fff', boxShadow: '0 4px 12px rgba(74,124,124,.3)' }}>
                  <span style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 400, color: '#fff' }}>
                    {firstName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 400, color: C.ink, marginBottom: 2 }}>{user?.name || 'Member'}</p>
                <p style={{ fontSize: 12, color: C.inkMuted, marginBottom: 16 }}>Recovery Member</p>
                {/* Tier badge */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, background: C.tealFaint, border: `1px solid ${C.tealLight}` }}>
                  <Star size={13} strokeWidth={2} color={C.teal} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.teal }}>
                    {streakDays >= 90 ? 'Diamond Member' : streakDays >= 30 ? 'Gold Member' : streakDays >= 7 ? 'Silver Member' : 'Bronze Member'}
                  </span>
                </div>
              </div>
            </div>

            {/* RECOVERY POINTS */}
            <div className="dash-fi dash-fi-2 hover-lift" style={{ ...card, background: `linear-gradient(135deg, ${C.teal} 0%, #2d5f5f 100%)`, borderColor: 'transparent', padding: '22px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.6)', marginBottom: 4 }}>Recovery Points</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 12 }}>
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 40, fontWeight: 300, color: '#fff', lineHeight: 1 }}>
                  <CountUp target={points} />
                </span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', paddingBottom: 4 }}>pts</span>
              </div>
              {/* Progress to next reward */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,.55)', marginBottom: 6 }}>
                  <span>Next reward at {nextReward} pts</span>
                  <span>{pointsPct}%</span>
                </div>
                <div style={{ height: 5, background: 'rgba(255,255,255,.15)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pointsPct}%`, background: C.green, borderRadius: 999, transition: 'width 1s ease' }} />
                </div>
              </div>
              {/* How points are earned */}
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>
                <Zap size={11} strokeWidth={2} style={{ display: 'inline', marginRight: 4 }} />
                +10 per streak day · +5 per check-in
              </div>
            </div>

            {/* SUPPORT NETWORK */}
            <div className="dash-fi dash-fi-3" style={{ ...card, padding: '22px' }}>
              <p style={sectionLabel}>Support Network</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { Icon: Bot,       label: 'AI Assistant',  sub: 'Available 24/7',  status: 'Online',     statusColor: C.green,    href: '/chat'       },
                  { Icon: UserCheck, label: 'Counselor',     sub: 'Book a session',  status: 'Available',  statusColor: C.green,    href: '/counselors' },
                  { Icon: Users,     label: 'Community',     sub: 'Join the feed',   status: 'Active',     statusColor: '#f97316',  href: '/community'  },
                  { Icon: MessageSquare, label: 'Journal',   sub: 'Write an entry',  status: 'Private',    statusColor: C.teal,     href: '/journals'   },
                ].map(item => (
                  <Link key={item.label} href={item.href}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, textDecoration: 'none', transition: 'background .15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.offWhite)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: C.tealFaint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <item.Icon size={18} strokeWidth={1.8} color={C.teal} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 1 }}>{item.label}</p>
                      <p style={{ fontSize: 11, color: C.inkMuted }}>{item.sub}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: item.statusColor }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: item.statusColor }}>{item.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* MILESTONES PEEK */}
            {streak?.milestones && streak.milestones.length > 0 && (
              <div className="dash-fi dash-fi-4" style={{ ...card, padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <p style={sectionLabel}>Milestones</p>
                  <Link href="/progress" style={{ fontSize: 12, color: C.teal, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                    All <ChevronRight size={13} strokeWidth={2.5} />
                  </Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {streak.milestones.slice(0, 4).map((m, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: m.achieved ? C.greenFaint : C.offWhite, border: `1px solid ${m.achieved ? '#b0dfc4' : C.border}` }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: m.achieved ? C.green : C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {m.achieved
                          ? <CheckCircle2 size={14} strokeWidth={2.5} color="#fff" />
                          : <Star size={13} strokeWidth={2} color="#fff" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: m.achieved ? '#166534' : C.inkMid }}>{m.name}</p>
                        <p style={{ fontSize: 10, color: C.inkMuted }}>{m.targetDays} days</p>
                      </div>
                      {m.achieved && <CheckCircle2 size={14} strokeWidth={2.5} color={C.green} />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QUICK ACTIONS */}
            <div className="dash-fi dash-fi-5" style={{ ...card, padding: '22px' }}>
              <p style={sectionLabel}>Quick Actions</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Start AI Chat',        href: '/chat',        Icon: MessageSquare, bg: C.tealFaint,  color: C.teal    },
                  { label: 'Find a Counselor',      href: '/counselors',  Icon: UserCheck,     bg: '#fef9e7',    color: '#b45309' },
                  { label: 'Browse Games',          href: '/games',       Icon: Zap,           bg: C.greenFaint, color: C.greenDark },
                  { label: 'View Community',        href: '/community',   Icon: Users,         bg: '#f3eeff',    color: '#6d28d9' },
                ].map(item => (
                  <Link key={item.label} href={item.href}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 12, background: item.bg, border: `1px solid ${C.border}`, textDecoration: 'none', transition: 'transform .15s, box-shadow .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(3px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(74,124,124,.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <item.Icon size={16} strokeWidth={2} color={item.color} />
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: C.inkMid }}>{item.label}</span>
                    <ArrowRight size={14} strokeWidth={2} color={C.inkMuted} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
