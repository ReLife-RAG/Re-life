'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  getStreak, getMoodData, getMoodAnalytics, getCheckInHistory,
  logMood, dailyCheckIn,
  type StreakData, type MoodDataResponse, type MoodAnalyticsResponse, type HistoryResponse,
} from '@/lib/auth-client';
import {
  Flame, Trophy, Heart, Calendar, TrendingUp, TrendingDown, Minus,
  BarChart3, Clock, Star, ChevronLeft, ChevronRight, Target, Plus,
  Download, CheckCircle2, Circle, Trash2, X, Zap, Activity, Award,
  ShieldCheck, AlertTriangle, Snowflake, RotateCcw, Info, Check,
  Lock, ChevronRight as Chevron, BookOpen, Smile, Frown, Meh,
  Laugh, Wind, Sun,
} from 'lucide-react';

// ─── Google Fonts ─────────────────────────────────────────────────────────────
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');`;

// ─── Design tokens — same as dashboard ───────────────────────────────────────
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
  warn:       '#b45309',
  warnFaint:  '#fef9e7',
  danger:     '#dc2626',
  dangerFaint:'#fef2f2',
};

// ─── Mood config — Lucide icons, no emoji ─────────────────────────────────────
const MOOD_CFG: Record<string, { Icon: React.FC<any>; label: string; color: string; bg: string }> = {
  great:      { Icon: Laugh,       label: 'Great',      color: '#22c55e', bg: '#dcfce7' },
  good:       { Icon: Smile,       label: 'Good',       color: C.green,   bg: C.greenFaint },
  okay:       { Icon: Meh,         label: 'Okay',       color: '#eab308', bg: '#fef9c3' },
  struggling: { Icon: Frown,       label: 'Struggling', color: '#f97316', bg: '#ffedd5' },
  relapsed:   { Icon: TrendingDown,label: 'Relapsed',   color: C.danger,  bg: C.dangerFaint },
};
const SCORE_TO_MOOD: Record<number, string> = {
  1:'relapsed',2:'relapsed',3:'struggling',4:'struggling',
  5:'okay',6:'okay',7:'good',8:'good',9:'great',10:'great',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Goal {
  id: string; title: string; targetDays: number; startDate: string;
  completed: boolean; completedDate?: string;
  category: 'streak' | 'mood' | 'checkin' | 'custom';
}
interface RelapseLog {
  id: string; date: string; trigger: string; notes: string;
  severity: 'minor' | 'moderate' | 'severe'; recoveryPlan: string;
}
interface StreakFreeze {
  active: boolean; usedDates: string[]; totalUsed: number; maxAllowed: number;
}

const fmt  = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const fmtL = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const todayKey = () => new Date().toISOString().split('T')[0];

// ─── Shared style helpers ─────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 20,
  boxShadow: '0 2px 12px rgba(74,124,124,.06)',
};
const sLabel: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, letterSpacing: '.1em',
  textTransform: 'uppercase', color: C.inkMuted, marginBottom: 10,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** SVG sparkline */
function Sparkline({ entries }: { entries: { score: number | null; date: string }[] }) {
  const pts = [...entries].slice(0, 14).reverse();
  if (pts.length < 2) return (
    <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.offWhite, borderRadius: 12 }}>
      <p style={{ fontSize: 13, color: C.inkMuted, fontStyle: 'italic' }}>Log at least 2 moods to see your trend</p>
    </div>
  );
  const W = 560, H = 90, p = 12;
  const sc = pts.map(e => e.score ?? 5);
  const mn = Math.min(...sc), mx = Math.max(...sc), rng = mx - mn || 1;
  const x = (i: number) => p + (i / (sc.length - 1)) * (W - p * 2);
  const y = (s: number) => H - p - ((s - mn) / rng) * (H - p * 2);
  const polyPts = sc.map((s, i) => `${x(i)},${y(s)}`).join(' ');
  const areaPts = `${p},${H - p} ${polyPts} ${W - p},${H - p}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 80 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="spkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.teal} stopOpacity="0.18" />
          <stop offset="100%" stopColor={C.teal} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <polygon points={areaPts} fill="url(#spkGrad)" />
      <polyline points={polyPts} fill="none" stroke={C.teal} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {sc.map((s, i) => <circle key={i} cx={x(i)} cy={y(s)} r="4" fill={C.surface} stroke={C.teal} strokeWidth="2" />)}
    </svg>
  );
}

/** Day-of-week bar chart */
function DowBarChart({ data }: { data: Record<string, number | null> }) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const full = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const vals = full.map(d => data[d] ?? 0);
  const max = Math.max(...vals, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
      {days.map((d, i) => {
        const v = vals[i], pct = (v / max) * 100;
        const col = v >= 7 ? C.green : v >= 4 ? '#eab308' : v > 0 ? '#f97316' : C.border;
        return (
          <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: C.inkMuted }}>{v > 0 ? v.toFixed(1) : ''}</span>
            <div style={{ width: '100%', background: C.offWhite, borderRadius: 8, height: 88, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: `${pct}%`, background: col, borderRadius: 8, transition: 'height .8s ease', minHeight: v > 0 ? 4 : 0 }} />
            </div>
            <span style={{ fontSize: 9, fontWeight: 600, color: C.inkMuted }}>{d}</span>
          </div>
        );
      })}
    </div>
  );
}

/** SVG progress ring */
function Ring({ value, max, label, sub }: { value: number; max: number; label: string; sub: string }) {
  const r = 46, cx = 56, cy = 56, circ = 2 * Math.PI * r;
  const pct = Math.min(value / Math.max(max, 1), 1);
  return (
    <svg width="112" height="112" viewBox="0 0 112 112">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth="8" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.teal} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
      <text x={cx} y={cy - 7} textAnchor="middle" fontSize="20" fontWeight="700" fill={C.ink}>{label}</text>
      <text x={cx} y={cy + 13} textAnchor="middle" fontSize="9" fill={C.inkMuted} fontWeight="600">{sub}</text>
    </svg>
  );
}

/** Goal creation modal */
function GoalModal({ onClose, onSave }: {
  onClose: () => void;
  onSave: (g: Omit<Goal, 'id' | 'completed'>) => void;
}) {
  const [title, setTitle] = useState('');
  const [days,  setDays]  = useState(30);
  const [cat,   setCat]   = useState<Goal['category']>('streak');
  const presets = [{ l: '1 week', d: 7 }, { l: '30 days', d: 30 }, { l: '90 days', d: 90 }, { l: '6 months', d: 180 }, { l: '1 year', d: 365 }];
  const CAT_ICONS: Record<Goal['category'], React.FC<any>> = { streak: Flame, mood: Heart, checkin: CheckCircle2, custom: Star };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,36,32,.5)', backdropFilter: 'blur(4px)', padding: 16 }}>
      <div style={{ ...card, padding: '32px 28px', width: '100%', maxWidth: 440, animation: 'scaleIn .25s ease', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, color: C.ink }}>Set a Recovery Goal</p>
          <button onClick={onClose} style={{ background: C.offWhite, border: 'none', borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} strokeWidth={2} color={C.inkMuted} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <p style={sLabel}>Goal title</p>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Stay sober for 30 days"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: C.ink, background: C.offWhite, outline: 'none', boxSizing: 'border-box', transition: 'border .15s' }}
              onFocus={e => e.target.style.borderColor = C.teal}
              onBlur={e  => e.target.style.borderColor = C.border} />
          </div>
          <div>
            <p style={sLabel}>Category</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {(['streak', 'mood', 'checkin', 'custom'] as Goal['category'][]).map(c => {
                const Ic = CAT_ICONS[c];
                return (
                  <button key={c} onClick={() => setCat(c)}
                    style={{ padding: '10px 6px', borderRadius: 12, border: `1.5px solid ${cat === c ? C.teal : C.border}`, background: cat === c ? C.tealFaint : C.surface, color: cat === c ? C.teal : C.inkMuted, fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all .15s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, fontFamily: "'DM Sans', sans-serif", textTransform: 'capitalize' }}>
                    <Ic size={14} strokeWidth={2} />
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <p style={{ ...sLabel, marginBottom: 0 }}>Target days</p>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.teal }}>{days} days</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {presets.map(p => (
                <button key={p.d} onClick={() => setDays(p.d)}
                  style={{ padding: '5px 12px', borderRadius: 999, border: `1.5px solid ${days === p.d ? C.teal : C.border}`, background: days === p.d ? C.tealFaint : C.surface, color: days === p.d ? C.teal : C.inkMuted, fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all .15s', fontFamily: "'DM Sans', sans-serif" }}>
                  {p.l}
                </button>
              ))}
            </div>
            <input type="range" min={1} max={365} value={days} onChange={e => setDays(Number(e.target.value))}
              style={{ width: '100%', accentColor: C.teal }} />
          </div>
          <button onClick={() => { if (!title.trim()) return; onSave({ title: title.trim(), targetDays: days, startDate: new Date().toISOString(), category: cat }); onClose(); }}
            disabled={!title.trim()}
            style={{ width: '100%', padding: '13px', borderRadius: 14, border: 'none', background: `linear-gradient(135deg, ${C.teal}, ${C.green})`, color: '#fff', fontSize: 14, fontWeight: 600, cursor: title.trim() ? 'pointer' : 'not-allowed', opacity: title.trim() ? 1 : .45, fontFamily: "'DM Sans', sans-serif" }}>
            Create Goal
          </button>
        </div>
      </div>
    </div>
  );
}

/** Setback modal */
function SetbackModal({ onClose, onSave }: {
  onClose: () => void;
  onSave: (r: Omit<RelapseLog, 'id' | 'date'>) => void;
}) {
  const [trigger,  setTrigger]  = useState('');
  const [notes,    setNotes]    = useState('');
  const [sev,      setSev]      = useState<RelapseLog['severity']>('minor');
  const [plan,     setPlan]     = useState('');
  const [saving,   setSaving]   = useState(false);
  const sevCfg = {
    minor:    { border: '#fbbf24', bg: '#fef9e7', color: '#b45309', label: 'Minor'    },
    moderate: { border: '#fb923c', bg: '#fff7ed', color: '#c2410c', label: 'Moderate' },
    severe:   { border: '#f87171', bg: C.dangerFaint, color: C.danger, label: 'Severe' },
  };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: C.ink, background: C.offWhite, outline: 'none', boxSizing: 'border-box', resize: 'none' as any };

  const handle = async () => {
    setSaving(true);
    try {
      await dailyCheckIn({ mood: 'relapsed', notes: `Trigger: ${trigger}. ${notes}` }).catch(() => {});
      onSave({ trigger, notes, severity: sev, recoveryPlan: plan });
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,36,32,.5)', backdropFilter: 'blur(4px)', padding: 16 }}>
      <div style={{ ...card, padding: '32px 28px', width: '100%', maxWidth: 480, fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, color: C.ink }}>Log a Setback</p>
          <button onClick={onClose} style={{ background: C.offWhite, border: 'none', borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} strokeWidth={2} color={C.inkMuted} />
          </button>
        </div>
        <p style={{ fontSize: 13, color: C.inkMuted, marginBottom: 20, lineHeight: 1.5 }}>Logging this honestly is a courageous step. You're still on your journey.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <p style={sLabel}>What triggered it?</p>
            <input value={trigger} onChange={e => setTrigger(e.target.value)} placeholder="e.g. stress, social situation…" style={inputStyle} />
          </div>
          <div>
            <p style={sLabel}>Severity</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {(['minor', 'moderate', 'severe'] as RelapseLog['severity'][]).map(s => {
                const c = sevCfg[s];
                return (
                  <button key={s} onClick={() => setSev(s)}
                    style={{ padding: '11px', borderRadius: 12, border: `2px solid ${sev === s ? c.border : C.border}`, background: sev === s ? c.bg : C.surface, color: sev === s ? c.color : C.inkMuted, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .15s', fontFamily: "'DM Sans', sans-serif", textTransform: 'capitalize' }}>
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p style={sLabel}>Notes (optional)</p>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="How were you feeling beforehand?" style={inputStyle} />
          </div>
          <div>
            <p style={sLabel}>Recovery plan (optional)</p>
            <textarea value={plan} onChange={e => setPlan(e.target.value)} rows={2} placeholder="What will you do differently? Who can you call?" style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.surface, color: C.inkMuted, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
            <button onClick={handle} disabled={saving || !trigger.trim()}
              style={{ flex: 2, padding: '11px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`, color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving || !trigger.trim() ? 'not-allowed' : 'pointer', opacity: saving || !trigger.trim() ? .55 : 1, fontFamily: "'DM Sans', sans-serif" }}>
              {saving ? 'Saving…' : 'Log & Keep Going'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProgressPage() {
  // ── Backend state ──
  const [streak,    setStreak]    = useState<StreakData | null>(null);
  const [moodData,  setMoodData]  = useState<MoodDataResponse | null>(null);
  const [analytics, setAnalytics] = useState<MoodAnalyticsResponse | null>(null);
  const [history,   setHistory]   = useState<HistoryResponse | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  // ── Mood logger ──
  const [moodScore,  setMoodScore]  = useState(6);
  const [moodNotes,  setMoodNotes]  = useState('');
  const [logLoading, setLogLoading] = useState(false);
  const [logMsg,     setLogMsg]     = useState<{ text: string; ok: boolean } | null>(null);

  // ── localStorage state ──
  const [goals,         setGoals]         = useState<Goal[]>([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [freeze,        setFreeze]        = useState<StreakFreeze>({ active: false, usedDates: [], totalUsed: 0, maxAllowed: 3 });
  const [showFzInfo,    setShowFzInfo]    = useState(false);
  const [relapses,      setRelapses]      = useState<RelapseLog[]>([]);
  const [showRelModal,  setShowRelModal]  = useState(false);
  const [showRelHist,   setShowRelHist]   = useState(false);

  // ── Tabs ──
  const [tab, setTab] = useState<'overview' | 'mood' | 'goals' | 'calendar' | 'tools'>('overview');

  // ── Calendar ──
  const [calMonth, setCalMonth] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); });

  const today = todayKey();

  // ── Fetch ──
  const fetchAll = useCallback(async () => {
    try {
      const [s, m, a, h] = await Promise.all([getStreak(), getMoodData({ days: 30 }), getMoodAnalytics(), getCheckInHistory(90)]);
      setStreak(s); setMoodData(m); setAnalytics(a); setHistory(h);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    try {
      const g = localStorage.getItem('recovery_goals');   if (g) setGoals(JSON.parse(g));
      const f = localStorage.getItem('streak_freeze');    if (f) setFreeze(JSON.parse(f));
      const r = localStorage.getItem('relapse_logs');     if (r) setRelapses(JSON.parse(r));
    } catch {}
  }, []);

  // ── Goals helpers ──
  const saveGoals  = (u: Goal[]) => { setGoals(u); localStorage.setItem('recovery_goals', JSON.stringify(u)); };
  const addGoal    = (d: Omit<Goal, 'id' | 'completed'>) => saveGoals([...goals, { ...d, id: Date.now().toString(), completed: false }]);
  const toggleGoal = (id: string) => saveGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed, completedDate: !g.completed ? new Date().toISOString() : undefined } : g));
  const deleteGoal = (id: string) => saveGoals(goals.filter(g => g.id !== id));
  const goalPct    = (g: Goal) => { if (g.completed) return 100; const e = Math.floor((Date.now() - new Date(g.startDate).getTime()) / 86400000); return Math.min(Math.round((e / g.targetDays) * 100), 99); };

  // ── Freeze helpers ──
  const fzThisMonth = freeze.usedDates.filter(d => d.startsWith(new Date().toISOString().slice(0, 7))).length;
  const canFreeze   = fzThisMonth < freeze.maxAllowed && !freeze.usedDates.includes(today);
  const activateFz  = () => { if (!canFreeze) return; const u = { ...freeze, active: true, usedDates: [...freeze.usedDates, today], totalUsed: freeze.totalUsed + 1 }; setFreeze(u); localStorage.setItem('streak_freeze', JSON.stringify(u)); };
  const deactivFz   = () => { const u = { ...freeze, active: false }; setFreeze(u); localStorage.setItem('streak_freeze', JSON.stringify(u)); };

  // ── Relapse helpers ──
  const saveRel = (u: RelapseLog[]) => { setRelapses(u); localStorage.setItem('relapse_logs', JSON.stringify(u)); };
  const addRel  = (d: Omit<RelapseLog, 'id' | 'date'>) => saveRel([{ ...d, id: Date.now().toString(), date: new Date().toISOString() }, ...relapses]);
  const delRel  = (id: string) => saveRel(relapses.filter(r => r.id !== id));

  // ── Mood log handler ──
  const handleLogMood = async () => {
    setLogLoading(true); setLogMsg(null);
    try {
      await logMood({ score: moodScore, notes: moodNotes || undefined });
      setLogMsg({ text: 'Mood logged successfully!', ok: true });
      setMoodNotes('');
      await fetchAll();
      setTimeout(() => setLogMsg(null), 3000);
    } catch (err: any) { setLogMsg({ text: err.message, ok: false }); }
    finally { setLogLoading(false); }
  };

  // ── Export CSV ──
  const exportCSV = () => {
    const rows = [
      'Date,Mood,Score,Notes',
      ...(moodData?.entries || []).map(e => `${fmt(e.date)},${e.mood},${e.score ?? ''},"${(e.notes || '').replace(/"/g, "'")}"`),
      '', 'Goals', 'Title,Category,Target,Start,Completed',
      ...goals.map(g => `"${g.title}",${g.category},${g.targetDays},${fmt(g.startDate)},${g.completed}`),
      '', 'Setbacks', 'Date,Severity,Trigger,Notes',
      ...relapses.map(r => `${fmt(r.date)},${r.severity},"${r.trigger}","${r.notes}"`),
    ].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([rows], { type: 'text/csv' }));
    a.download = `recovery-progress-${today}.csv`;
    a.click();
  };

  // ── Calendar helpers ──
  const calDays = () => {
    const y = calMonth.getFullYear(), m = calMonth.getMonth();
    const cells: (number | null)[] = [];
    for (let i = 0; i < new Date(y, m, 1).getDay(); i++) cells.push(null);
    for (let d = 1; d <= new Date(y, m + 1, 0).getDate(); d++) cells.push(d);
    return cells;
  };
  const dateKey = (day: number) => new Date(calMonth.getFullYear(), calMonth.getMonth(), day).toISOString().split('T')[0];

  const TrendIcon = ({ dir }: { dir: string }) =>
    dir === 'improving' ? <TrendingUp  size={13} strokeWidth={2.5} color="#22c55e" /> :
    dir === 'declining' ? <TrendingDown size={13} strokeWidth={2.5} color={C.danger} /> :
                          <Minus size={13} strokeWidth={2.5} color="#eab308" />;

  const CAT_ICONS: Record<Goal['category'], React.FC<any>> = {
    streak: Flame, mood: Heart, checkin: CheckCircle2, custom: Star,
  };
  const SEV_STYLE = {
    minor:    { bg: '#fef9e7', border: '#fbbf24', badge: 'color:#b45309;background:#fef9e7' },
    moderate: { bg: '#fff7ed', border: '#fb923c', badge: 'color:#c2410c;background:#fff7ed' },
    severe:   { bg: C.dangerFaint, border: '#f87171', badge: `color:${C.danger};background:${C.dangerFaint}` },
  };

  if (loading) return (
    <>
      <style>{FONTS}</style>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12, fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.teal}`, borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: 14, color: C.inkMuted }}>Loading your progress…</p>
      </div>
    </>
  );

  if (error) return (
    <>
      <style>{FONTS}</style>
      <div style={{ background: C.dangerFaint, border: `1px solid #fca5a5`, borderRadius: 20, padding: '32px', textAlign: 'center', maxWidth: 400, margin: '48px auto', fontFamily: "'DM Sans', sans-serif" }}>
        <AlertTriangle size={32} strokeWidth={1.5} color={C.danger} style={{ marginBottom: 12 }} />
        <p style={{ fontSize: 16, fontWeight: 600, color: C.ink, marginBottom: 6 }}>Failed to load</p>
        <p style={{ fontSize: 13, color: C.inkMuted, marginBottom: 16 }}>{error}</p>
        <button onClick={() => { setError(null); setLoading(true); fetchAll(); }} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: C.teal, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Retry</button>
      </div>
    </>
  );

  const sparkEntries  = (moodData?.entries || []).map(e => ({ score: e.score, date: e.date }));
  const dowData       = analytics?.patterns?.dayOfWeekAverages || {};
  const trendDir      = analytics?.trends?.direction ?? 'stable';
  const trendColor    = trendDir === 'improving' ? '#22c55e' : trendDir === 'declining' ? C.danger : '#eab308';

  return (
    <>
      <style>{FONTS}</style>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
        @keyframes scaleIn { from { opacity:0; transform:scale(.96); } to { opacity:1; transform:scale(1); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        .pfi { animation: fadeUp .38s both; }
        .pfi-1{animation-delay:.05s;} .pfi-2{animation-delay:.1s;} .pfi-3{animation-delay:.15s;} .pfi-4{animation-delay:.2s;}
        .p-hover { transition: transform .15s, box-shadow .15s; }
        .p-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(74,124,124,.12) !important; }
        @media (max-width: 1024px) {
          .p-grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .p-overview-grid, .p-mood-grid, .p-goals-grid, .p-calendar-grid, .p-tools-grid { grid-template-columns: 1fr !important; }
          .p-goal-summary { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .p-milestones-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @media (max-width: 768px) {
          .p-grid-4, .p-goal-summary, .p-milestones-grid, .p-relapse-stats { grid-template-columns: 1fr !important; }
          .p-tabs { width: 100% !important; }
          .p-calendar-controls { flex-wrap: wrap; justify-content: center; }
          .p-calendar-month { min-width: 0 !important; flex: 1; text-align: center !important; }
        }
      `}</style>

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '0 0 40px', fontFamily: "'DM Sans', system-ui, sans-serif", color: C.ink }}>

        {/* ── Header ── */}
        <div className="pfi" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 28 }}>
          <div>
            <p style={{ fontSize: 12, color: C.inkMuted, marginBottom: 6, letterSpacing: '.03em' }}>
              Portal &rsaquo; <strong style={{ color: C.inkMid, fontWeight: 600 }}>Progress</strong>
            </p>
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 34, fontWeight: 400, color: C.ink, letterSpacing: '-.3px', lineHeight: 1.1, marginBottom: 4 }}>My Progress</h1>
            <p style={{ fontSize: 14, color: C.inkMuted }}>Streaks, mood, goals &amp; recovery tools</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={exportCSV}
              disabled={!moodData?.entries.length && !goals.length && !relapses.length}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.surface, color: C.inkMid, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all .15s', opacity: !moodData?.entries.length && !goals.length && !relapses.length ? .45 : 1 }}>
              <Download size={14} strokeWidth={2} /> Export CSV
            </button>
            <button onClick={() => setShowGoalModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${C.teal}, ${C.green})`, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              <Plus size={14} strokeWidth={2.5} /> Add Goal
            </button>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className="pfi pfi-1 p-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
          {/* Streak */}
          <div className="p-hover" style={{ ...card, background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`, borderColor: 'transparent', padding: '22px 20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, position: 'relative' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Flame size={18} strokeWidth={2} color="#fff" />
              </div>
              {freeze.active && <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,.15)', color: 'rgba(255,255,255,.85)', borderRadius: 999, padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 4 }}><Snowflake size={10} strokeWidth={2} />Frozen</span>}
            </div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 52, fontWeight: 300, color: '#fff', lineHeight: 1, marginBottom: 4, position: 'relative' }}>{streak?.currentStreak ?? 0}</div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>Day Streak</p>
          </div>

          {/* Longest */}
          <div className="p-hover" style={{ ...card, padding: '22px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.warnFaint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trophy size={18} strokeWidth={2} color={C.warn} /></div>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.warn, background: C.warnFaint, borderRadius: 999, padding: '3px 10px' }}>Best</span>
            </div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 44, fontWeight: 300, color: C.ink, lineHeight: 1, marginBottom: 4 }}>{streak?.longestStreak ?? 0}</div>
            <p style={{ fontSize: 11, color: C.inkMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>Longest Streak</p>
          </div>

          {/* Avg mood */}
          <div className="p-hover" style={{ ...card, padding: '22px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.greenFaint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Heart size={18} strokeWidth={2} color={C.green} /></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><TrendIcon dir={trendDir} /><span style={{ fontSize: 11, fontWeight: 600, color: trendColor, textTransform: 'capitalize' }}>{trendDir.replace('_', ' ')}</span></div>
            </div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 44, fontWeight: 300, color: C.ink, lineHeight: 1, marginBottom: 4 }}>{moodData?.averageScore ? moodData.averageScore.toFixed(1) : '—'}</div>
            <p style={{ fontSize: 11, color: C.inkMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>Avg Mood (30d)</p>
          </div>

          {/* Check-ins */}
          <div className="p-hover" style={{ ...card, padding: '22px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.tealFaint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={18} strokeWidth={2} color={C.teal} /></div>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.teal, background: C.tealFaint, borderRadius: 999, padding: '3px 10px' }}>Total</span>
            </div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 44, fontWeight: 300, color: C.ink, lineHeight: 1, marginBottom: 4 }}>{history?.stats?.totalCheckIns ?? 0}</div>
            <p style={{ fontSize: 11, color: C.inkMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>Check-ins</p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="pfi pfi-1 p-tabs" style={{ display: 'flex', gap: 4, background: C.offWhite, borderRadius: 16, padding: 4, width: 'fit-content', marginBottom: 24, overflowX: 'auto' }}>
          {[
            { id: 'overview', label: 'Overview'    },
            { id: 'mood',     label: 'Mood'        },
            { id: 'goals',    label: 'Goals'       },
            { id: 'calendar', label: 'Calendar'    },
            { id: 'tools',    label: 'Recovery Tools' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
              style={{ padding: '9px 18px', borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', transition: 'all .18s', background: tab === t.id ? C.surface : 'transparent', color: tab === t.id ? C.ink : C.inkMuted, boxShadow: tab === t.id ? '0 2px 8px rgba(74,124,124,.1)' : 'none' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════════ OVERVIEW ══════════════════ */}
        {tab === 'overview' && (
          <div className="p-overview-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
            {/* Sparkline — spans 2 cols */}
            <div className="pfi pfi-2 p-hover" style={{ ...card, padding: '24px', gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div><p style={sLabel}>Mood Trend</p><p style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 400, color: C.ink }}>Last 14 entries</p></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: `${trendColor}12`, border: `1px solid ${trendColor}30` }}>
                  <TrendIcon dir={trendDir} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: trendColor, textTransform: 'capitalize' }}>{trendDir.replace('_', ' ')}</span>
                </div>
              </div>
              <Sparkline entries={sparkEntries} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.inkMuted, marginTop: 6, padding: '0 4px' }}>
                <span>Oldest</span><span>Latest</span>
              </div>
            </div>

            {/* Ring summary */}
            <div className="pfi pfi-2 p-hover" style={{ ...card, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <p style={{ ...sLabel, alignSelf: 'flex-start' }}>Streak Goal</p>
              <Ring value={streak?.currentStreak ?? 0} max={90} label={String(streak?.currentStreak ?? 0)} sub="of 90 days" />
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Check-ins', val: history?.stats?.totalCheckIns ?? 0,  color: C.teal  },
                  { label: 'Mood Logs', val: moodData?.totalEntries ?? 0,           color: C.green },
                  { label: 'Goals Set', val: goals.length,                          color: C.warn  },
                  { label: 'Setbacks',  val: relapses.length,                       color: '#f97316' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                      <span style={{ fontSize: 12, color: C.inkMuted }}>{item.label}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trend boxes */}
            {analytics && analytics.totalEntries > 0 && (
              <>
                {[
                  { label: '7-Day Average',  val: analytics.trends.sevenDay?.average?.toFixed(1)  ?? '—', sub: `${analytics.trends.sevenDay?.entries  ?? 0} entries` },
                  { label: '30-Day Average', val: analytics.trends.thirtyDay?.average?.toFixed(1) ?? '—', sub: `${analytics.trends.thirtyDay?.entries ?? 0} entries` },
                  { label: 'Most Frequent',
                    val: analytics.patterns.mostFrequentMood ? MOOD_CFG[analytics.patterns.mostFrequentMood]?.label : '—',
                    sub: analytics.patterns.mostFrequentMood ? `Mood: ${MOOD_CFG[analytics.patterns.mostFrequentMood]?.label}` : 'No data' },
                ].map(item => (
                  <div key={item.label} className="pfi pfi-3 p-hover" style={{ ...card, padding: '20px' }}>
                    <p style={sLabel}>{item.label}</p>
                    <p style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 300, color: C.ink, marginBottom: 4 }}>{item.val}</p>
                    <p style={{ fontSize: 12, color: C.inkMuted }}>{item.sub}</p>
                  </div>
                ))}
              </>
            )}

            {/* Milestones */}
            {streak?.milestones && streak.milestones.length > 0 && (
              <div className="pfi pfi-3" style={{ ...card, padding: '24px', gridColumn: 'span 3' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <Award size={18} strokeWidth={2} color={C.warn} />
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 400, color: C.ink }}>Milestones</p>
                </div>
                <div className="p-milestones-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                  {streak.milestones.map((m, i) => (
                    <div key={i} style={{ padding: '16px', borderRadius: 14, background: m.achieved ? C.greenFaint : C.offWhite, border: `1px solid ${m.achieved ? '#b0dfc4' : C.border}`, transition: 'all .2s' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: m.achieved ? C.green : C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                        {m.achieved ? <CheckCircle2 size={16} strokeWidth={2.5} color="#fff" /> : <Lock size={14} strokeWidth={2} color="#fff" />}
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: m.achieved ? '#166534' : C.inkMid, marginBottom: 3 }}>{m.name}</p>
                      {m.description && <p style={{ fontSize: 11, color: C.inkMuted, marginBottom: 6 }}>{m.description}</p>}
                      {m.achieved && m.achievedDate && <p style={{ fontSize: 10, color: C.green, fontWeight: 700 }}>Achieved {fmt(m.achievedDate)}</p>}
                      {!m.achieved && <p style={{ fontSize: 10, color: C.inkMuted }}>Goal: {m.targetDays} days</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════ MOOD ══════════════════ */}
        {tab === 'mood' && (
          <div className="p-mood-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
            {/* Logger */}
            <div className="pfi pfi-2" style={{ ...card, padding: '24px', gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <BarChart3 size={17} strokeWidth={2} color={C.teal} />
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 400, color: C.ink }}>Log Today's Mood</p>
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 13, color: C.inkMuted }}>How are you feeling?</span>
                    <span style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 300, color: C.teal }}>{moodScore}</span>
                  </div>
                  <input type="range" min={1} max={10} value={moodScore} onChange={e => setMoodScore(Number(e.target.value))}
                    style={{ width: '100%', accentColor: C.teal, height: 4, marginBottom: 6 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.inkMuted }}>
                    <span>1 — Low</span>
                    <span style={{ fontWeight: 700, color: C.teal }}>{moodScore}/10</span>
                    <span>10 — Great</span>
                  </div>
                  {/* Quick pick buttons */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                    {[{ s: 2, l: 'Low' }, { s: 4, l: 'Rough' }, { s: 6, l: 'Okay' }, { s: 8, l: 'Good' }, { s: 10, l: 'Great' }].map(m => (
                      <button key={m.s} onClick={() => setMoodScore(m.s)}
                        style={{ padding: '6px 14px', borderRadius: 999, border: `1.5px solid ${moodScore === m.s ? C.teal : C.border}`, background: moodScore === m.s ? C.tealFaint : C.surface, color: moodScore === m.s ? C.teal : C.inkMuted, fontSize: 12, fontWeight: moodScore === m.s ? 600 : 400, cursor: 'pointer', transition: 'all .15s', fontFamily: "'DM Sans', sans-serif" }}>
                        {m.l}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <textarea value={moodNotes} onChange={e => setMoodNotes(e.target.value)} rows={4}
                    placeholder="Any notes? (optional)" maxLength={500}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 13, fontFamily: "'DM Sans', sans-serif", resize: 'none', outline: 'none', color: C.ink, background: C.offWhite, boxSizing: 'border-box', transition: 'border .15s' }}
                    onFocus={e => e.target.style.borderColor = C.teal}
                    onBlur={e  => e.target.style.borderColor = C.border} />
                  <button onClick={handleLogMood} disabled={logLoading}
                    style={{ padding: '12px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${C.teal}, ${C.green})`, color: '#fff', fontSize: 13, fontWeight: 600, cursor: logLoading ? 'not-allowed' : 'pointer', opacity: logLoading ? .65 : 1, fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                    {logLoading ? <><RotateCcw size={14} strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }} /> Logging…</> : <><CheckCircle2 size={14} strokeWidth={2} /> Log Mood</>}
                  </button>
                  {logMsg && (
                    <p style={{ fontSize: 12, fontWeight: 600, color: logMsg.ok ? C.greenDark : C.danger, textAlign: 'center' }}>{logMsg.text}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Distribution */}
            <div className="pfi pfi-2 p-hover" style={{ ...card, padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <Star size={16} strokeWidth={2} color={C.warn} />
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 400, color: C.ink }}>Distribution</p>
              </div>
              {analytics && analytics.totalEntries > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {Object.entries(analytics.patterns.moodDistribution).sort(([, a], [, b]) => b - a).map(([mood, count]) => {
                    const pct = Math.round((count / analytics.totalEntries) * 100);
                    const cfg = MOOD_CFG[mood];
                    if (!cfg) return null;
                    return (
                      <div key={mood}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <cfg.Icon size={14} strokeWidth={2} color={cfg.color} />
                            <span style={{ fontSize: 13, fontWeight: 500, color: C.inkMid }}>{cfg.label}</span>
                          </div>
                          <span style={{ fontSize: 11, color: C.inkMuted, fontWeight: 600 }}>{count} ({pct}%)</span>
                        </div>
                        <div style={{ height: 6, background: C.offWhite, borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: cfg.color, borderRadius: 999, transition: 'width .8s' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80, background: C.offWhite, borderRadius: 12 }}>
                  <p style={{ fontSize: 13, color: C.inkMuted, fontStyle: 'italic' }}>Log moods to see distribution</p>
                </div>
              )}
            </div>

            {/* DOW chart */}
            {analytics && analytics.totalEntries > 0 && (
              <div className="pfi pfi-3 p-hover" style={{ ...card, padding: '24px', gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Zap size={16} strokeWidth={2} color={C.teal} />
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 400, color: C.ink }}>Day-of-Week Pattern</p>
                </div>
                <p style={{ fontSize: 12, color: C.inkMuted, marginBottom: 16 }}>Average mood score by day of week</p>
                <DowBarChart data={dowData} />
                <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
                  {analytics.patterns.bestDay  && <span style={{ fontSize: 12, color: C.greenDark, fontWeight: 600 }}>Best day: {analytics.patterns.bestDay}</span>}
                  {analytics.patterns.worstDay && <span style={{ fontSize: 12, color: '#f97316', fontWeight: 600 }}>Lowest: {analytics.patterns.worstDay}</span>}
                </div>
              </div>
            )}

            {/* Recent entries */}
            {moodData && moodData.entries.length > 0 && (
              <div className="pfi pfi-3" style={{ ...card, padding: '24px', gridColumn: 'span 3' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Clock size={16} strokeWidth={2} color={C.inkMuted} />
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 400, color: C.ink }}>Recent Entries</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 280, overflowY: 'auto' }}>
                  {moodData.entries.slice(0, 20).map((entry, i) => {
                    const cfg = MOOD_CFG[entry.mood];
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px', borderRadius: 12, transition: 'background .15s', cursor: 'default' }}
                        onMouseEnter={e => (e.currentTarget.style.background = C.offWhite)}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: cfg?.bg ?? C.offWhite, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {cfg && <cfg.Icon size={16} strokeWidth={2} color={cfg.color} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: C.inkMid }}>{cfg?.label ?? entry.mood}</span>
                            {entry.score != null && <span style={{ fontSize: 11, fontWeight: 700, color: C.inkMuted, background: C.offWhite, padding: '2px 8px', borderRadius: 999, border: `1px solid ${C.border}` }}>{entry.score}/10</span>}
                          </div>
                          {entry.notes && <p style={{ fontSize: 12, color: C.inkMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{entry.notes}</p>}
                        </div>
                        <span style={{ fontSize: 12, color: C.inkMuted, flexShrink: 0 }}>{fmt(entry.date)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════ GOALS ══════════════════ */}
        {tab === 'goals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Summary */}
            <div className="pfi pfi-2 p-goal-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              {[
                { label: 'Total Goals',   val: goals.length,                          color: C.teal,      bg: C.tealFaint  },
                { label: 'In Progress',   val: goals.filter(g => !g.completed).length, color: C.warn,     bg: C.warnFaint  },
                { label: 'Completed',     val: goals.filter(g =>  g.completed).length, color: C.greenDark, bg: C.greenFaint },
              ].map(item => (
                <div key={item.label} className="p-hover" style={{ ...card, padding: '20px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                    <Target size={17} strokeWidth={2} color={item.color} />
                  </div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 300, color: C.ink, lineHeight: 1, marginBottom: 4 }}>{item.val}</div>
                  <p style={{ fontSize: 11, color: C.inkMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>{item.label}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, color: C.ink }}>Recovery Goals</p>
              <button onClick={() => setShowGoalModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${C.teal}, ${C.green})`, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                <Plus size={14} strokeWidth={2.5} /> New Goal
              </button>
            </div>

            {goals.length === 0 ? (
              <div className="pfi pfi-2" style={{ ...card, padding: '64px 32px', textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: 16, background: C.offWhite, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Target size={26} strokeWidth={1.5} color={C.inkMuted} />
                </div>
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: C.ink, marginBottom: 8 }}>No goals yet</p>
                <p style={{ fontSize: 14, color: C.inkMuted, marginBottom: 20 }}>Goals keep you motivated and accountable</p>
                <button onClick={() => setShowGoalModal(true)} style={{ padding: '11px 28px', borderRadius: 999, border: 'none', background: `linear-gradient(135deg, ${C.teal}, ${C.green})`, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Set Your First Goal</button>
              </div>
            ) : (
              <div className="p-goals-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                {goals.map(goal => {
                  const pct     = goalPct(goal);
                  const elapsed = Math.floor((Date.now() - new Date(goal.startDate).getTime()) / 86400000);
                  const left    = Math.max(goal.targetDays - elapsed, 0);
                  const CatIc   = CAT_ICONS[goal.category];
                  return (
                    <div key={goal.id} className="p-hover" style={{ ...card, padding: '22px', border: `1px solid ${goal.completed ? '#b0dfc4' : C.border}`, background: goal.completed ? C.greenFaint : C.surface }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CatIc size={13} strokeWidth={2} color={C.inkMuted} />
                          <span style={{ fontSize: 10, fontWeight: 700, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: '.08em' }}>{goal.category}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => toggleGoal(goal.id)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: C.offWhite, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={goal.completed ? 'Mark incomplete' : 'Mark complete'}>
                            {goal.completed ? <CheckCircle2 size={15} strokeWidth={2} color={C.green} /> : <Circle size={15} strokeWidth={1.8} color={C.inkMuted} />}
                          </button>
                          <button onClick={() => deleteGoal(goal.id)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: C.offWhite, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Trash2 size={13} strokeWidth={2} color={C.danger} />
                          </button>
                        </div>
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: goal.completed ? C.greenDark : C.ink, textDecoration: goal.completed ? 'line-through' : 'none', marginBottom: 14, lineHeight: 1.4 }}>{goal.title}</p>
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 5 }}>
                          <span style={{ color: C.inkMuted }}>Progress</span>
                          <span style={{ fontWeight: 700, color: goal.completed ? C.greenDark : C.teal }}>{pct}%</span>
                        </div>
                        <div style={{ height: 6, background: C.offWhite, borderRadius: 999, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: goal.completed ? C.green : `linear-gradient(90deg, ${C.teal}, ${C.green})`, borderRadius: 999, transition: 'width .8s' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.inkMuted, fontWeight: 500 }}>
                        <span>{elapsed}d elapsed</span>
                        {goal.completed ? <span style={{ color: C.greenDark, fontWeight: 700 }}>Complete!</span> : <span>{left}d left</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════ CALENDAR ══════════════════ */}
        {tab === 'calendar' && (
          <div className="p-calendar-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18 }}>
            <div className="pfi pfi-2 p-hover" style={{ ...card, padding: '26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={17} strokeWidth={2} color={C.teal} />
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 400, color: C.ink }}>Check-in Calendar</p>
                </div>
                <div className="p-calendar-controls" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))} style={{ width: 32, height: 32, borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronLeft size={15} strokeWidth={2} color={C.inkMid} />
                  </button>
                  <span className="p-calendar-month" style={{ fontSize: 14, fontWeight: 600, color: C.ink, minWidth: 140, textAlign: 'center' }}>
                    {calMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))} style={{ width: 32, height: 32, borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronRight size={15} strokeWidth={2} color={C.inkMid} />
                  </button>
                </div>
              </div>
              {/* Day headers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 6 }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: C.inkMuted, padding: '4px 0' }}>{d}</div>
                ))}
              </div>
              {/* Days grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
                {calDays().map((day, i) => {
                  if (day === null) return <div key={i} />;
                  const k     = dateKey(day);
                  const entry = history?.calendar?.[k];
                  const isToday  = k === today;
                  const isFrozen = freeze.usedDates.includes(k);
                  const moodCfg  = entry?.mood ? MOOD_CFG[entry.mood] : null;
                  return (
                    <div key={i} title={entry ? `${entry.mood}${entry.energy ? ` · ${entry.energy}/10` : ''}` : isFrozen ? 'Freeze used' : ''}
                      style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 10, fontSize: 12, fontWeight: entry?.hasCheckIn ? 700 : 500, cursor: 'default', userSelect: 'none', transition: 'all .15s',
                        background: entry?.hasCheckIn ? moodCfg?.color ?? C.teal : isFrozen ? '#eff6ff' : C.offWhite,
                        color: entry?.hasCheckIn ? '#fff' : isFrozen ? '#3b82f6' : C.inkMuted,
                        border: isToday ? `2px solid ${C.teal}` : `1px solid ${entry?.hasCheckIn ? 'transparent' : C.border}`,
                        boxShadow: entry?.hasCheckIn ? `0 2px 8px ${(moodCfg?.color ?? C.teal)}30` : 'none',
                      }}>
                      <span>{day}</span>
                      {isFrozen && !entry?.hasCheckIn && <Snowflake size={8} strokeWidth={2} color="#3b82f6" />}
                    </div>
                  );
                })}
              </div>
              {/* Legend */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
                {Object.entries(MOOD_CFG).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: v.color }} />
                    <span style={{ fontSize: 11, color: C.inkMuted }}>{v.label}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: '#eff6ff', border: '1px solid #bfdbfe' }} />
                  <span style={{ fontSize: 11, color: C.inkMuted }}>Freeze</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, border: `2px solid ${C.teal}` }} />
                  <span style={{ fontSize: 11, color: C.inkMuted }}>Today</span>
                </div>
              </div>
            </div>

            {/* Cal sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="pfi pfi-2 p-hover" style={{ ...card, padding: '20px' }}>
                <p style={sLabel}>This Month</p>
                {(() => {
                  const y = calMonth.getFullYear(), m = calMonth.getMonth();
                  const dim = new Date(y, m + 1, 0).getDate();
                  const now = new Date();
                  const el  = (y === now.getFullYear() && m === now.getMonth()) ? now.getDate() : dim;
                  let chk   = 0;
                  for (let d = 1; d <= dim; d++) {
                    const k = new Date(y, m, d).toISOString().split('T')[0];
                    if (history?.calendar?.[k]?.hasCheckIn) chk++;
                  }
                  const pct = Math.round((chk / el) * 100);
                  return (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                        <span style={{ color: C.inkMuted }}>Checked in</span>
                        <span style={{ fontWeight: 700, fontFamily: "'Fraunces', serif", color: C.ink, fontSize: 18 }}>{chk}</span>
                      </div>
                      <div style={{ height: 8, background: C.offWhite, borderRadius: 999, overflow: 'hidden', border: `1px solid ${C.border}`, marginBottom: 6 }}>
                        <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: `linear-gradient(90deg, ${C.teal}, ${C.green})`, borderRadius: 999, transition: 'width .8s' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.inkMuted }}>
                        <span>{pct}% consistency</span><span>{chk} / {el} days</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="pfi pfi-3 p-hover" style={{ ...card, padding: '20px' }}>
                <p style={sLabel}>Streak Info</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { Icon: Flame,        label: 'Current streak',  val: `${streak?.currentStreak ?? 0} days`,  hl: false },
                    { Icon: Trophy,       label: 'Longest streak',  val: `${streak?.longestStreak ?? 0} days`,  hl: false },
                    { Icon: Calendar,     label: 'Last check-in',   val: streak?.lastCheckIn ? fmt(streak.lastCheckIn) : 'Never', hl: false },
                    { Icon: CheckCircle2, label: 'Today',           val: streak?.checkedInToday ? 'Done' : 'Not yet', hl: streak?.checkedInToday },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: `1px solid ${C.border}` }} className="last:border-0">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <item.Icon size={14} strokeWidth={2} color={C.inkMuted} />
                        <span style={{ fontSize: 12, color: C.inkMuted }}>{item.label}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: item.hl ? C.greenDark : C.ink }}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════ TOOLS ══════════════════ */}
        {tab === 'tools' && (
          <div className="p-tools-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>

            {/* Streak Freeze */}
            <div className="pfi pfi-2 p-hover" style={{ ...card, padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Snowflake size={22} strokeWidth={1.8} color="#3b82f6" />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 400, color: C.ink, marginBottom: 2 }}>Streak Freeze</p>
                    <p style={{ fontSize: 12, color: C.inkMuted }}>Protect your streak on hard days</p>
                  </div>
                </div>
                <button onClick={() => setShowFzInfo(!showFzInfo)} style={{ background: C.offWhite, border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Info size={14} strokeWidth={2} color={C.inkMuted} />
                </button>
              </div>
              {showFzInfo && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '12px 14px', marginBottom: 14, fontSize: 13, color: '#1d4ed8', lineHeight: 1.5 }}>
                  A streak freeze protects today's streak if you miss a check-in. You get <strong>{freeze.maxAllowed} per month</strong>. Frozen days show on your calendar.
                </div>
              )}
              {/* Usage bar */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.inkMuted, marginBottom: 6 }}>
                  <span>Monthly usage</span><span style={{ fontWeight: 700, color: C.ink }}>{fzThisMonth} / {freeze.maxAllowed}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {Array.from({ length: freeze.maxAllowed }).map((_, i) => (
                    <div key={i} style={{ flex: 1, height: 8, borderRadius: 999, background: i < fzThisMonth ? '#3b82f6' : C.border, transition: 'background .3s' }} />
                  ))}
                </div>
              </div>
              {/* Status */}
              <div style={{ padding: '14px', borderRadius: 12, marginBottom: 14, background: freeze.active ? '#eff6ff' : canFreeze ? C.offWhite : C.warnFaint, border: `1px solid ${freeze.active ? '#bfdbfe' : canFreeze ? C.border : '#fbbf24'}` }}>
                {freeze.active ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Snowflake size={18} strokeWidth={2} color="#3b82f6" />
                    <div><p style={{ fontSize: 13, fontWeight: 600, color: '#1e3a8a' }}>Freeze active for today</p><p style={{ fontSize: 12, color: '#3b82f6', marginTop: 2 }}>Your streak is protected. Check in tomorrow!</p></div>
                  </div>
                ) : canFreeze ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ShieldCheck size={18} strokeWidth={2} color={C.inkMuted} />
                    <div><p style={{ fontSize: 13, fontWeight: 600, color: C.inkMid }}>Freeze available</p><p style={{ fontSize: 12, color: C.inkMuted, marginTop: 2 }}>Activate to protect today's streak</p></div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <AlertTriangle size={18} strokeWidth={2} color={C.warn} />
                    <div><p style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>{freeze.usedDates.includes(today) ? 'Already used today' : 'Monthly limit reached'}</p><p style={{ fontSize: 12, color: C.warn, marginTop: 2 }}>Resets at the start of next month</p></div>
                  </div>
                )}
              </div>
              {!freeze.active ? (
                <button onClick={activateFz} disabled={!canFreeze}
                  style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: canFreeze ? '#3b82f6' : C.border, color: canFreeze ? '#fff' : C.inkMuted, fontSize: 13, fontWeight: 600, cursor: canFreeze ? 'pointer' : 'not-allowed', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Snowflake size={15} strokeWidth={2} /> Activate Freeze
                </button>
              ) : (
                <button onClick={deactivFz} style={{ width: '100%', padding: '12px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.surface, color: C.inkMuted, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <X size={14} strokeWidth={2} /> Deactivate
                </button>
              )}
              {freeze.totalUsed > 0 && <p style={{ textAlign: 'center', fontSize: 11, color: C.inkMuted, marginTop: 10 }}>{freeze.totalUsed} freeze{freeze.totalUsed !== 1 ? 's' : ''} used in total</p>}
            </div>

            {/* Setback Tracker */}
            <div className="pfi pfi-2 p-hover" style={{ ...card, padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <RotateCcw size={20} strokeWidth={1.8} color="#f97316" />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 400, color: C.ink, marginBottom: 2 }}>Setback Tracker</p>
                    <p style={{ fontSize: 12, color: C.inkMuted }}>Log &amp; learn from setbacks honestly</p>
                  </div>
                </div>
                {relapses.length > 0 && (
                  <button onClick={() => setShowRelHist(!showRelHist)} style={{ fontSize: 12, color: C.teal, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showRelHist ? 'Hide' : 'View all'}
                  </button>
                )}
              </div>
              <div style={{ background: C.greenFaint, border: `1px solid ${C.tealLight}`, borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
                <p style={{ fontSize: 13, color: C.tealDark, lineHeight: 1.5 }}>Logging setbacks honestly is a courageous act. Every log is a step forward, not backward.</p>
              </div>
              <div className="p-relapse-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
                {[
                  { label: 'Total',    val: relapses.length,                                       color: C.inkMid  },
                  { label: 'Minor',    val: relapses.filter(r => r.severity === 'minor').length,    color: C.warn    },
                  { label: 'Moderate', val: relapses.filter(r => r.severity === 'moderate').length, color: '#f97316' },
                ].map(item => (
                  <div key={item.label} style={{ background: C.offWhite, borderRadius: 12, padding: '12px', textAlign: 'center', border: `1px solid ${C.border}` }}>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 300, color: item.color }}>{item.val}</div>
                    <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 2 }}>{item.label}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowRelModal(true)} style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Plus size={14} strokeWidth={2.5} /> Log a Setback
              </button>
              {showRelHist && relapses.length > 0 && (
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 260, overflowY: 'auto' }}>
                  <p style={sLabel}>History</p>
                  {relapses.map(r => {
                    const s = SEV_STYLE[r.severity];
                    return (
                      <div key={r.id} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 14, padding: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 999, textTransform: 'capitalize', ...Object.fromEntries(s.badge.split(';').filter(Boolean).map(kv => { const [k, v] = kv.split(':'); return [k.trim().replace(/-([a-z])/g, (_: string, l: string) => l.toUpperCase()), v.trim()]; })) }}>{r.severity}</span>
                            <span style={{ fontSize: 11, color: C.inkMuted }}>{fmtL(r.date)}</span>
                          </div>
                          <button onClick={() => delRel(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <Trash2 size={13} strokeWidth={2} color={C.inkMuted} />
                          </button>
                        </div>
                        {r.trigger      && <p style={{ fontSize: 12, color: C.inkMid, marginBottom: 3 }}><strong>Trigger:</strong> {r.trigger}</p>}
                        {r.recoveryPlan && <p style={{ fontSize: 12, color: C.tealDark }}><strong>Plan:</strong> {r.recoveryPlan}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Coping Strategies */}
            <div className="pfi pfi-3 p-hover" style={{ ...card, padding: '24px', background: `linear-gradient(135deg, ${C.teal} 0%, ${C.tealDark} 100%)`, borderColor: 'transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={22} strokeWidth={1.8} color="#fff" />
                </div>
                <div>
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 400, color: '#fff', marginBottom: 2 }}>Coping Strategies</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>Evidence-based tools for hard moments</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { Icon: Wind,       title: '5-4-3-2-1 Grounding',       desc: 'Name 5 things you see, 4 feel, 3 hear, 2 smell, 1 taste.' },
                  { Icon: Activity,   title: 'Change your environment',    desc: 'A 10-minute walk breaks the mental loop.' },
                  { Icon: BookOpen,   title: 'Urge surf in your journal',  desc: 'Write what you feel. Urges peak and fade in under 20 min.' },
                  { Icon: Heart,      title: 'Call your support person',   desc: 'Reach out before the urge peaks — not after.' },
                  { Icon: Zap,        title: 'Talk to the AI chat',        desc: 'Your recovery assistant is available 24/7.' },
                ].map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.1)', transition: 'background .15s', cursor: 'default' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.15)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,.1)')}>
                    <tip.Icon size={17} strokeWidth={1.8} color="rgba(255,255,255,.8)" style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{tip.title}</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', lineHeight: 1.4 }}>{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export */}
            <div className="pfi pfi-3 p-hover" style={{ ...card, padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: C.offWhite, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Download size={20} strokeWidth={1.8} color={C.inkMid} />
                </div>
                <div>
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 400, color: C.ink, marginBottom: 2 }}>Export Full Report</p>
                  <p style={{ fontSize: 12, color: C.inkMuted }}>Download everything as a CSV file</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 18 }}>
                {[
                  { Icon: BarChart3, label: 'Mood entries',    val: moodData?.totalEntries ?? 0 },
                  { Icon: Target,    label: 'Goals tracked',   val: goals.length               },
                  { Icon: RotateCcw, label: 'Setbacks logged', val: relapses.length            },
                  { Icon: Calendar,  label: 'Check-in days',   val: history?.stats?.totalCheckIns ?? 0 },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <item.Icon size={14} strokeWidth={2} color={C.inkMuted} />
                      <span style={{ fontSize: 13, color: C.inkMid }}>{item.label}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{item.val} records</span>
                  </div>
                ))}
              </div>
              <button onClick={exportCSV} disabled={!moodData?.entries.length && !goals.length && !relapses.length}
                style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: C.ink, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: !moodData?.entries.length && !goals.length && !relapses.length ? .4 : 1 }}>
                <Download size={15} strokeWidth={2} /> Download Full Report
              </button>
              <p style={{ textAlign: 'center', fontSize: 11, color: C.inkMuted, marginTop: 10 }}>Includes mood log, goals &amp; setback history. Share with your counselor if needed.</p>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showGoalModal && <GoalModal onClose={() => setShowGoalModal(false)} onSave={addGoal} />}
      {showRelModal  && <SetbackModal onClose={() => setShowRelModal(false)} onSave={addRel} />}
    </>
  );
}
