'use client';
import React, { useState } from 'react';
import { GameProgress } from '@/types/games.types';

// ═══════════════════════════════════════════════════════════
//  JOURNAL GAME — Daily reflection journaling
//  Theme: Warm coral/rose/cream
//  Mechanic: Answer prompts, build journal streak, unlock insights
// ═══════════════════════════════════════════════════════════

interface Props {
  progress: GameProgress;
  onUpdateProgress: (u: Partial<GameProgress>) => Promise<void>;
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void;
}

const PROMPTS = [
  { id: 'p1', icon: '🌅', text: 'What is one thing you are grateful for today?',           pts: 15 },
  { id: 'p2', icon: '💪', text: 'Describe one moment today where you stayed strong.',       pts: 20 },
  { id: 'p3', icon: '🎯', text: 'What is your main goal for tomorrow?',                    pts: 15 },
  { id: 'p4', icon: '💭', text: 'What was the hardest part of today and how did you cope?', pts: 25 },
  { id: 'p5', icon: '🌟', text: 'Write down one thing you are proud of about yourself.',    pts: 20 },
];

const MOODS = [
  { emoji: '😤', label: 'Struggling',  color: '#ef4444', val: 1 },
  { emoji: '😔', label: 'Low',         color: '#f97316', val: 2 },
  { emoji: '😐', label: 'Neutral',     color: '#eab308', val: 3 },
  { emoji: '😊', label: 'Good',        color: '#22c55e', val: 4 },
  { emoji: '🤩', label: 'Thriving',    color: '#8b5cf6', val: 5 },
];

const INSIGHTS = [
  { days: 3,  text: '3-day journaler! Consistency is key 🗝️',         icon: '🗝️'  },
  { days: 7,  text: 'One week of reflection! You are building wisdom', icon: '📖'  },
  { days: 14, text: 'Two-week streak! Self-awareness is growing',      icon: '🌱'  },
  { days: 30, text: 'Month of journaling! You are truly dedicated',    icon: '🏆'  },
];

const getToday = () => new Date().toISOString().slice(0, 10);
const MIN_WORDS = 5;

export default function JournalGame({ progress, onUpdateProgress, showToast }: Props) {
  const saved      = (progress as any).journalData ?? {};
  const journalStreak = saved.journalStreak   ?? 0;
  const totalEntries  = saved.totalEntries    ?? 0;
  const lastEntry     = saved.lastEntryDate;
  const alreadyWrote  = lastEntry === getToday();

  const [mood,      setMood]      = useState<number | null>(null);
  const [promptIdx, setPromptIdx] = useState(0);
  const [answers,   setAnswers]   = useState<Record<string, string>>({});
  const [saving,    setSaving]    = useState(false);
  const [submitted, setSubmitted] = useState(alreadyWrote);
  const [earnedPts, setEarnedPts] = useState(0);

  const prompt    = PROMPTS[promptIdx];
  const wordCount = (answers[prompt.id] ?? '').trim().split(/\s+/).filter(Boolean).length;
  const allDone   = PROMPTS.every(p => (answers[p.id] ?? '').trim().split(/\s+/).filter(Boolean).length >= MIN_WORDS);
  const nextMs    = INSIGHTS.find(ins => journalStreak < ins.days);

  async function submitJournal() {
    if (!mood) { showToast('Please select your mood first!', 'error'); return; }
    if (!allDone) { showToast('Please answer all prompts (5+ words each)', 'error'); return; }
    setSaving(true);
    try {
      const pts = PROMPTS.reduce((sum, p) => {
        const wc = (answers[p.id] ?? '').trim().split(/\s+/).filter(Boolean).length;
        return sum + (wc >= MIN_WORDS ? p.pts : 0);
      }, 0);
      const bonusPts  = mood >= 4 ? 10 : 0;
      const total     = pts + bonusPts;
      const newStreak = journalStreak + 1;
      const newTotal  = totalEntries  + 1;

      await onUpdateProgress({
        totalPoints:   (progress.totalPoints   ?? 0) + total,
        currentStreak: (progress.currentStreak ?? 0) + 1,
        lastPlayed:    new Date().toISOString(),
      } as any);

      setEarnedPts(total);
      setSubmitted(true);
      showToast(`Journal saved! +${total} pts 📓`, 'success');
    } catch { showToast('Save failed', 'error'); }
    finally { setSaving(false); }
  }

  // ── SUBMITTED / DONE STATE ──
  if (submitted) return (
    <div style={{ maxWidth: 540, margin: '0 auto', fontFamily: "'Georgia', serif" }}>
      <div style={{ background: 'linear-gradient(135deg,#7f1d1d,#be123c)', borderRadius: '24px 24px 0 0', padding: '14px 24px', textAlign: 'center' }}>
        <span style={{ color: '#fecdd3', fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '.14em', fontFamily: "'Inter',sans-serif" }}>
          📓 JOURNAL — DAILY REFLECTION
        </span>
      </div>
      <div style={{ background: 'linear-gradient(135deg,#fff1f2,#ffe4e6)', border: '1px solid #fecdd3', borderTop: 'none', borderRadius: '0 0 24px 24px', padding: '40px 28px', textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>📓</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#881337', marginBottom: 8, fontFamily: "'Georgia',serif" }}>Today's Journal Complete!</div>
        {earnedPts > 0 && <div style={{ fontSize: 18, color: '#be123c', marginBottom: 20, fontWeight: 600 }}>+{earnedPts} points earned 🌟</div>}
        <div style={{ fontSize: 14, color: '#9f1239', marginBottom: 28, lineHeight: 1.7 }}>
          You've written {totalEntries + 1} {totalEntries === 0 ? 'entry' : 'entries'} total.<br />
          Journal streak: <strong>{journalStreak + 1} days</strong> 🔥
        </div>
        {nextMs && (
          <div style={{ background: 'rgba(190,18,60,.1)', border: '1px solid #fecdd3', borderRadius: 14, padding: '14px 18px', marginBottom: 20, textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#881337', marginBottom: 4 }}>Next milestone: {nextMs.icon} {nextMs.days}-day journaler</div>
            <div style={{ height: 8, background: 'rgba(190,18,60,.15)', borderRadius: 5, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.round(((journalStreak + 1) / nextMs.days) * 100)}%`, background: 'linear-gradient(90deg,#be123c,#f43f5e)', borderRadius: 5 }} />
            </div>
            <div style={{ fontSize: 11, color: '#9f1239', marginTop: 4 }}>{journalStreak + 1} / {nextMs.days} days</div>
          </div>
        )}
        <div style={{ fontSize: 13, color: '#9f1239', fontStyle: 'italic' }}>Come back tomorrow for your next journal entry 🌄</div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 580, margin: '0 auto', fontFamily: "'Georgia', serif" }}>

      {/* ══ ROSE HEADER ══ */}
      <div style={{ background: 'linear-gradient(135deg,#7f1d1d,#be123c)', borderRadius: '24px 24px 0 0', padding: '14px 24px', textAlign: 'center' }}>
        <span style={{ color: '#fecdd3', fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '.14em', fontFamily: "'Inter',sans-serif" }}>
          📓 JOURNAL — DAILY REFLECTION GAME
        </span>
      </div>

      {/* ══ STATS ══ */}
      <div style={{ background: 'linear-gradient(135deg,#fff1f2,#ffe4e6)', border: '1px solid #fecdd3', borderTop: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center', padding: '14px 0' }}>
        {[
          { icon: '🔥', val: journalStreak, label: 'Day Streak'     },
          { icon: '📝', val: totalEntries,  label: 'Total Entries'  },
          { icon: '⭐', val: progress.totalPoints ?? 0, label: 'Points Earned' },
        ].map((s, i) => (
          <div key={s.label} style={{ padding: '8px 12px', borderLeft: i > 0 ? '1px solid #fecdd3' : 'none' }}>
            <div style={{ fontSize: 22, marginBottom: 2 }}>{s.icon}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#881337', fontFamily: "'Inter',sans-serif" }}>{s.val}</div>
            <div style={{ fontSize: 10.5, color: '#be123c', marginTop: 1, fontFamily: "'Inter',sans-serif" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ══ MOOD CHECK ══ */}
      <div style={{ background: '#fff', border: '1px solid #fecdd3', borderTop: 'none', padding: '20px 24px' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#881337', marginBottom: 14 }}>How are you feeling right now?</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {MOODS.map(m => (
            <button key={m.val} onClick={() => setMood(m.val)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '12px 16px', borderRadius: 14, border: `2.5px solid ${mood === m.val ? m.color : '#fecdd3'}`, background: mood === m.val ? `${m.color}18` : '#fff', cursor: 'pointer', transition: 'all .2s', minWidth: 72 }}>
              <span style={{ fontSize: 28 }}>{m.emoji}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: mood === m.val ? m.color : '#9f1239', fontFamily: "'Inter',sans-serif" }}>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ══ JOURNAL PROMPT ══ */}
      <div style={{ background: '#fffbfb', border: '1px solid #fecdd3', borderTop: 'none', padding: '20px 24px' }}>
        {/* Prompt navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#881337' }}>
            {PROMPTS[promptIdx].icon} Prompt {promptIdx + 1} of {PROMPTS.length}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {PROMPTS.map((p, i) => {
              const wc = (answers[p.id] ?? '').trim().split(/\s+/).filter(Boolean).length;
              return (
                <button key={p.id} onClick={() => setPromptIdx(i)}
                  style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${wc >= MIN_WORDS ? '#be123c' : i === promptIdx ? '#fda4af' : '#fecdd3'}`, background: wc >= MIN_WORDS ? '#be123c' : i === promptIdx ? '#ffe4e6' : '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: wc >= MIN_WORDS ? '#fff' : '#be123c', fontFamily: "'Inter',sans-serif" }}>
                  {wc >= MIN_WORDS ? '✓' : i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current prompt */}
        <div style={{ background: 'linear-gradient(135deg,#fff1f2,#ffe4e6)', border: '1px solid #fecdd3', borderRadius: 14, padding: '16px 18px', marginBottom: 16, fontSize: 15, color: '#7f1d1d', lineHeight: 1.6, fontStyle: 'italic' }}>
          "{prompt.text}"
        </div>

        {/* Text area */}
        <textarea
          value={answers[prompt.id] ?? ''}
          onChange={e => setAnswers({ ...answers, [prompt.id]: e.target.value })}
          placeholder="Write your thoughts here… (at least 5 words)"
          rows={4}
          style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `2px solid ${wordCount >= MIN_WORDS ? '#be123c' : '#fecdd3'}`, fontSize: 14, fontFamily: "'Georgia', serif", lineHeight: 1.7, color: '#1a1a1a', background: '#fff', resize: 'vertical', boxSizing: 'border-box', outline: 'none', transition: 'border .2s' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <span style={{ fontSize: 12, color: wordCount >= MIN_WORDS ? '#be123c' : '#9ca3af', fontFamily: "'Inter',sans-serif" }}>
            {wordCount} word{wordCount !== 1 ? 's' : ''} {wordCount >= MIN_WORDS ? '✓' : `(need ${MIN_WORDS - wordCount} more)`}
          </span>
          <span style={{ fontSize: 12, color: '#be123c', fontWeight: 600, fontFamily: "'Inter',sans-serif" }}>+{prompt.pts} pts</span>
        </div>

        {/* Next/Prev */}
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          {promptIdx > 0 && (
            <button onClick={() => setPromptIdx(promptIdx - 1)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '2px solid #fecdd3', background: '#fff', color: '#be123c', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
              ← Previous
            </button>
          )}
          {promptIdx < PROMPTS.length - 1 && (
            <button onClick={() => setPromptIdx(promptIdx + 1)} disabled={wordCount < MIN_WORDS}
              style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: wordCount >= MIN_WORDS ? 'linear-gradient(135deg,#be123c,#f43f5e)' : '#fecdd3', color: '#fff', fontSize: 13, fontWeight: 600, cursor: wordCount >= MIN_WORDS ? 'pointer' : 'not-allowed', fontFamily: "'Inter',sans-serif" }}>
              Next Prompt →
            </button>
          )}
        </div>
      </div>

      {/* ══ SUBMIT ══ */}
      <div style={{ background: 'linear-gradient(135deg,#fff1f2,#ffe4e6)', border: '1px solid #fecdd3', borderTop: 'none', borderRadius: '0 0 24px 24px', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#9f1239', marginBottom: 14, fontFamily: "'Inter',sans-serif" }}>
          <span>Prompts answered: {PROMPTS.filter(p => (answers[p.id] ?? '').trim().split(/\s+/).filter(Boolean).length >= MIN_WORDS).length}/{PROMPTS.length}</span>
          <span>Total pts available: {PROMPTS.reduce((s, p) => s + p.pts, 0) + (mood && mood >= 4 ? 10 : 0)}</span>
        </div>
        <button onClick={submitJournal} disabled={!allDone || !mood || saving}
          style={{ width: '100%', padding: 15, borderRadius: 14, border: 'none', fontSize: 16, fontWeight: 700, cursor: allDone && mood && !saving ? 'pointer' : 'not-allowed', background: allDone && mood ? 'linear-gradient(135deg,#be123c,#f43f5e)' : '#fecdd3', color: '#fff', transition: 'all .2s', fontFamily: "'Inter',sans-serif", boxShadow: allDone && mood ? '0 4px 20px rgba(190,18,60,.35)' : 'none', opacity: saving ? .7 : 1 }}>
          {saving ? '⌛ Saving…' : allDone && mood ? '📓 Submit Today\'s Journal (+pts)' : '📓 Complete all prompts to submit'}
        </button>
        {(!allDone || !mood) && (
          <div style={{ fontSize: 12, color: '#be123c', textAlign: 'center', marginTop: 8, fontFamily: "'Inter',sans-serif" }}>
            {!mood ? '⬆ Select your mood first' : '⬆ Answer all prompts with 5+ words'}
          </div>
        )}
      </div>
    </div>
  );
}
