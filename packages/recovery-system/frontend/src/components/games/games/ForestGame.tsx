'use client';
import React, { useState, useEffect, useRef } from 'react';
import { GameProgress } from '@/types/games.types';

interface Props {
  progress: GameProgress;
  onUpdateProgress: (u: Partial<GameProgress>) => Promise<void>;
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void;
}

const TOTAL   = 25 * 60;
const R       = 72;
const CIRCUM  = 2 * Math.PI * R;
const STAGES  = ['🌱', '🌿', '🌲', '🌳'];
type View     = 'idle' | 'running' | 'done' | 'dead';

export default function ForestGame({ progress, onUpdateProgress, showToast }: Props) {
  const f = progress.forestData;
  const [coins,  setCoins]  = useState(f?.coins        ?? 0);
  const [trees,  setTrees]  = useState(f?.treesPlanted ?? 0);
  const [secs,   setSecs]   = useState(TOTAL);
  const [view,   setView]   = useState<View>('idle');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const coinsRef = useRef(coins);
  const progRef  = useRef(progress);
  useEffect(() => { coinsRef.current = coins;    }, [coins]);
  useEffect(() => { progRef.current  = progress; }, [progress]);
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const elapsed  = TOTAL - secs;
  const pct      = elapsed / TOTAL;
  const stage    = STAGES[Math.min(3, Math.floor(pct * 4))];
  const mm       = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss       = String(secs % 60).padStart(2, '0');

  function startTimer() {
    setSecs(TOTAL); setView('running');
    timerRef.current = setInterval(() => {
      setSecs(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!); timerRef.current = null;
          const nc = coinsRef.current + 10;
          const nt = Math.floor(nc / 10);
          setCoins(nc); setTrees(nt); setView('done');
          const p = progRef.current;
          onUpdateProgress({
            forestData: { coins: nc, treesPlanted: nt, totalFocusTime: (p.forestData?.totalFocusTime ?? 0) + 25 },
            totalPoints: (p.totalPoints ?? 0) + 20,
            currentStreak: (p.currentStreak ?? 0) + 1,
            lastPlayed: new Date().toISOString(),
          }).catch(() => {});
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function cancelTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setSecs(TOTAL); setView('dead');
    showToast('Tree died 🥀 — Try again!', 'error');
  }

  /* ── DONE ── */
  if (view === 'done') return (
    <div style={{ maxWidth: 440, margin: '0 auto', fontFamily: "'Inter',sans-serif" }}>
      <div style={{ background: 'linear-gradient(135deg,#e0f7ea,#b8efd4)', border: '2px solid #6ad4a0', borderRadius: 24, padding: '48px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 80, marginBottom: 12 }}>🎉</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#1a4a2c', marginBottom: 8 }}>Session Complete!</div>
        <div style={{ fontSize: 15, color: '#2d6a48', marginBottom: 32 }}>Your tree fully grew! 🌳</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 28 }}>
          {[['🌲', '+1 Tree', '#3a9a60'], ['⭐', '+20 XP', '#c87000'], ['🪙', '+10 Coins', '#9a6000']].map(([ic, v, c]) => (
            <div key={v} style={{ background: '#fff', borderRadius: 16, padding: '18px 14px', boxShadow: '0 4px 16px rgba(30,100,60,.15)' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{ic}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: c as string }}>{v}</div>
            </div>
          ))}
        </div>
        <button onClick={() => { setView('idle'); setSecs(TOTAL); }} style={{ width: '100%', padding: 15, borderRadius: 14, border: 'none', background: '#3a9a60', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          🌱 Plant Another Tree
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: "'Courier New', monospace" }}>

      {/* ══ FOREST HEADER ══ */}
      <div style={{ 
        background: 'linear-gradient(135deg,#5d4037,#8d6e63)', 
        borderRadius: '24px 24px 0 0', 
        padding: '16px 24px', 
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(93,64,55,0.4)'
      }}>
        <span style={{ 
          color: '#efebe9', 
          fontWeight: 700, 
          fontSize: 13, 
          textTransform: 'uppercase', 
          letterSpacing: '.18em',
          fontFamily: "'Courier New', monospace"
        }}>
          🌲 FOREST FOCUS TIMER
        </span>
      </div>

      {/* ══ TIMER CARD ══ */}
      <div style={{ 
        background: 'linear-gradient(135deg,#fff8e1,#f3e5f5)', 
        border: '3px solid #8d6e63', 
        borderTop: 'none', 
        padding: '40px 28px', 
        textAlign: 'center',
        boxShadow: 'inset 0 2px 10px rgba(93,64,55,0.1)'
      }}>

        {/* SVG ring with tree inside */}
        <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto 24px' }}>
          <svg viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0, width: 200, height: 200, transform: 'rotate(-90deg)' }}>
            <circle cx={100} cy={100} r={75} fill="none" stroke="#d7ccc8" strokeWidth={12} />
            <circle cx={100} cy={100} r={75} fill="none" stroke="#6d4c41" strokeWidth={12}
              strokeDasharray={471} strokeDashoffset={471 * (1 - pct)}
              strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: view === 'dead' ? 64 : 60, lineHeight: 1, marginBottom: 8, transition: 'all .5s' }}>
              {view === 'dead' ? '🥀' : stage}
            </div>
            <div style={{ 
              fontSize: 42, 
              fontWeight: 900, 
              color: '#5d4037', 
              letterSpacing: -2, 
              lineHeight: 1,
              fontFamily: "'Courier New', monospace"
            }}>{mm}:{ss}</div>
            <div style={{ 
              fontSize: 11, 
              color: '#8d6e63', 
              marginTop: 4,
              fontFamily: "'Courier New', monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>
              {view === 'running' ? 'focus growing…' : view === 'dead' ? 'tree withered' : 'minutes remaining'}
            </div>
          </div>
        </div>

        {/* Coin / tree stats */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 32, 
          marginBottom: 26, 
          fontSize: 14, 
          fontWeight: 700,
          fontFamily: "'Courier New', monospace"
        }}>
          <span style={{ 
            color: '#8d6e63',
            background: '#f3e5f5',
            padding: '6px 12px',
            borderRadius: 12,
            border: '1px solid #d7ccc8'
          }}>🪙 {coins} coins</span>
          <span style={{ 
            color: '#5d4037',
            background: '#efebe9',
            padding: '6px 12px',
            borderRadius: 12,
            border: '1px solid #bcaaa4'
          }}>🌲 {trees} trees</span>
        </div>

        {/* Stage row */}
        {view === 'running' && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 24 }}>
            {STAGES.map((s, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ 
                  fontSize: 22, 
                  opacity: Math.floor(pct * 4) >= i ? 1 : .3,
                  filter: Math.floor(pct * 4) >= i ? 'drop-shadow(0 2px 4px rgba(93,64,55,0.3))' : 'none'
                }}>{s}</span>
                <div style={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  background: Math.floor(pct * 4) >= i ? '#6d4c41' : '#d7ccc8',
                  border: '2px solid #8d6e63'
                }} />
              </div>
            ))}
          </div>
        )}

        {/* Warning */}
        {view === 'running' && (
          <div style={{ 
            background: 'linear-gradient(135deg,#fff3e0,#ffe0b2)', 
            border: '2px solid #ff9800', 
            borderRadius: 12, 
            padding: '12px 16px', 
            marginBottom: 24, 
            fontSize: 12.5, 
            color: '#e65100',
            fontWeight: 600,
            fontFamily: "'Courier New', monospace"
          }}>
            ⚠️ Stay focused — leaving will wither your tree!
          </div>
        )}

        {/* Buttons */}
        {view !== 'running'
          ? <button onClick={startTimer} style={{ 
              width: '100%', 
              padding: 16, 
              borderRadius: 16, 
              border: '2px solid #5d4037', 
              background: '#6d4c41', 
              color: '#efebe9', 
              fontSize: 16, 
              fontWeight: 700, 
              cursor: 'pointer', 
              boxShadow: '0 6px 20px rgba(93,64,55,0.4)',
              fontFamily: "'Courier New', monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all .3s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#5d4037'} 
              onMouseLeave={e => e.currentTarget.style.background = '#6d4c41'}>
              {view === 'dead' ? '🌱 Try Again' : '🌱 Start Focus Session'}
            </button>
          : <button onClick={cancelTimer} style={{ 
              width: '100%', 
              padding: 14, 
              borderRadius: 16, 
              background: '#ffebee', 
              border: '2px solid #d32f2f', 
              color: '#c62828', 
              fontSize: 14, 
              fontWeight: 700, 
              cursor: 'pointer',
              fontFamily: "'Courier New', monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all .3s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#ffcdd2'} 
              onMouseLeave={e => e.currentTarget.style.background = '#ffebee'}>
              ❌ Give Up (tree will wither)
            </button>
        }
      </div>

      {/* ══ MY FOREST ══ */}
      <div style={{ 
        background: 'linear-gradient(135deg,#efebe9,#d7ccc8)', 
        border: '3px solid #8d6e63', 
        borderTop: '3px dashed #8d6e63', 
        borderRadius: '0 0 24px 24px', 
        padding: 24,
        boxShadow: '0 4px 20px rgba(93,64,55,0.2)'
      }}>
        <div style={{ 
          fontSize: 15, 
          fontWeight: 700, 
          color: '#5d4037', 
          marginBottom: 16,
          fontFamily: "'Courier New', monospace",
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}>
          🌳 My Forest — {trees} {trees === 1 ? 'Tree' : 'Trees'} Planted
        </div>
        {trees === 0
          ? <div style={{ 
              color: '#8d6e63', 
              fontSize: 13, 
              fontFamily: "'Courier New', monospace",
              textAlign: 'center',
              padding: '16px',
              background: 'rgba(141,110,74,0.1)',
              borderRadius: 12,
              border: '1px dashed #bcaaa4'
            }}>
              🌱 Start your first focus session to grow a tree!
            </div>
          : <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(8,1fr)', 
              gap: 8,
              padding: '16px',
              background: 'rgba(141,110,74,0.05)',
              borderRadius: 12
            }}>
              {Array.from({ length: trees }, (_, i) => <div key={i} style={{ 
                fontSize: 24, 
                textAlign: 'center',
                filter: 'drop-shadow(0 2px 4px rgba(93,64,55,0.3))'
              }}>🌲</div>)}
            </div>
        }
      </div>
    </div>
  );
}
