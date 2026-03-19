'use client';
import React, { useState } from 'react';
import { GameProgress } from '@/types/games.types';

interface Props {
  progress: GameProgress;
  onUpdateProgress: (u: Partial<GameProgress>) => Promise<void>;
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void;
}

const TASKS = [
  { id: 'med',  icon: '🧘', name: 'Morning meditation (10 min)',  xp: 15 },
  { id: 'soc',  icon: '📵', name: 'No social media before noon', xp: 20 },
  { id: 'h2o',  icon: '💧', name: 'Drink 8 glasses of water',    xp: 10 },
  { id: 'call', icon: '📞', name: 'Call a support buddy',        xp: 25 },
  { id: 'jour', icon: '📓', name: 'Write in your journal',       xp: 15 },
  { id: 'run',  icon: '🏃', name: '20 minutes of exercise',      xp: 20 },
];
const XP_LV = 500;
const getToday = () => new Date().toISOString().slice(0, 10);

export default function HabiticaGame({ progress, onUpdateProgress, showToast }: Props) {
  const h      = progress.habiticaData;
  const newDay = h?.lastTaskReset !== getToday();

  const [tasks, setTasks] = useState(
    TASKS.map(t => ({ ...t, done: newDay ? false : (h?.tasksDoneToday?.includes(t.id) ?? false) }))
  );
  const [hp,   setHp]   = useState(h?.hp    ?? 100);
  const [xp,   setXp]   = useState(h?.xp    ?? 0);
  const [lv,   setLv]   = useState(h?.level ?? 1);
  const [busy, setBusy] = useState<string | null>(null);

  const done    = tasks.filter(t => t.done).length;
  const xpInLv  = xp % XP_LV;
  const xpPct   = Math.round((xpInLv / XP_LV) * 100);
  const bossPct = Math.round((done / TASKS.length) * 100);

  async function toggleTask(id: string) {
    if (busy) return;
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const was     = task.done;
    const updated = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    const xpDiff  = was ? -task.xp : task.xp;
    const hpDiff  = was ? -5 : +5;
    const nx = Math.max(0, xp + xpDiff);
    const nh = Math.min(100, Math.max(0, hp + hpDiff));
    const nl = Math.floor(nx / XP_LV) + 1;
    const ids = updated.filter(t => t.done).map(t => t.id);

    setTasks(updated); setXp(nx); setHp(nh); setLv(nl); setBusy(id);
    try {
      await onUpdateProgress({
        habiticaData: { ...h, hp: nh, maxHp: 100, xp: nx, xpToNext: XP_LV, mp: h?.mp ?? 60, maxMp: 100, level: nl, class: h?.class ?? 'Warrior', tasksCompleted: ids.length, questsCompleted: h?.questsCompleted ?? 0, tasksDoneToday: ids, lastTaskReset: getToday() },
        totalPoints: Math.max(0, (progress.totalPoints ?? 0) + xpDiff),
        lastPlayed: new Date().toISOString(),
      });
      showToast(was ? 'Task unchecked (−5 HP)' : `✅ +${task.xp} XP earned!`, was ? 'info' : 'success');
    } catch {
      setTasks(tasks); setXp(xp); setHp(hp); setLv(lv);
      showToast('Save failed', 'error');
    } finally { setBusy(null); }
  }

  return (
    <div style={{ maxWidth: 580, margin: '0 auto', fontFamily: "'Trebuchet MS', sans-serif" }}>

      {/* ══ FANTASY HEADER ══ */}
      <div style={{ 
        background: 'linear-gradient(135deg,#4a148c,#7b1fa2)', 
        borderRadius: '32px 32px 0 0', 
        padding: '18px 24px', 
        textAlign: 'center',
        boxShadow: '0 6px 30px rgba(74,20,140,0.5)',
        border: '2px solid #9c27b0'
      }}>
        <span style={{ 
          color: '#f3e5f5', 
          fontWeight: 700, 
          fontSize: 14, 
          textTransform: 'uppercase', 
          letterSpacing: '.2em',
          fontFamily: "'Trebuchet MS', sans-serif",
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          ⚔️ RECOVERY HERO RPG
        </span>
      </div>

      {/* ══ CHARACTER CARD ══ */}
      <div style={{ 
        background: 'linear-gradient(135deg,#6a1b9a,#8e24aa)', 
        padding: '28px 24px', 
        color: '#f3e5f5',
        border: '3px solid #9c27b0',
        borderTop: 'none',
        boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <div style={{ 
            width: 90, 
            height: 90, 
            background: 'linear-gradient(135deg,#f3e5f5,#e1bee7)', 
            borderRadius: 50, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: 48, 
            flexShrink: 0,
            boxShadow: '0 4px 20px rgba(156,39,176,0.5)',
            border: '3px solid #ce93d8'
          }}>⚔️</div>
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontSize: 24, 
              fontWeight: 800, 
              marginBottom: 8,
              fontFamily: "'Trebuchet MS', sans-serif",
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>Recovery Hero</div>
            <div style={{ 
              fontSize: 13, 
              color: '#e1bee7', 
              marginBottom: 16,
              fontFamily: "'Trebuchet MS', sans-serif",
              fontWeight: 600
            }}>Level {lv} Warrior • {done}/{TASKS.length} Quests Complete</div>
            {[
              { lb: '❤️ HP', p: hp,   c: '#e91e63', v: `${hp}/100` },
              { lb: '⭐ XP', p: xpPct, c: '#ffc107', v: `${xpInLv}/${XP_LV}` },
              { lb: '💙 MP', p: h?.mp ?? 60, c: '#2196f3', v: `${h?.mp ?? 60}/100` },
            ].map(b => (
              <div key={b.lb} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 10, 
                marginBottom: 10,
                padding: '4px 0'
              }}>
                <span style={{ 
                  fontSize: 13, 
                  width: 32, 
                  color: '#f3e5f5',
                  fontWeight: 700,
                  fontFamily: "'Trebuchet MS', sans-serif"
                }}>{b.lb}</span>
                <div style={{ 
                  flex: 1, 
                  height: 12, 
                  background: 'rgba(255,255,255,0.2)', 
                  borderRadius: 8, 
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${b.p}%`, 
                    background: `linear-gradient(90deg,${b.c},${b.c}dd)`, 
                    borderRadius: 8, 
                    transition: 'width .6s ease',
                    boxShadow: `0 0 10px ${b.c}66`
                  }} />
                </div>
                <span style={{ 
                  fontSize: 11, 
                  color: '#e1bee7', 
                  minWidth: 45, 
                  textAlign: 'right',
                  fontWeight: 600,
                  fontFamily: "'Trebuchet MS', sans-serif"
                }}>{b.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ TASK LIST ══ */}
      <div style={{ 
        background: 'linear-gradient(135deg,#f3e5f5,#e1bee7)', 
        border: '3px solid #9c27b0', 
        borderTop: 'none', 
        padding: 24,
        boxShadow: 'inset 0 2px 10px rgba(156,39,176,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 20,
          padding: '12px 16px',
          background: 'rgba(156,39,176,0.1)',
          borderRadius: 12,
          border: '1px solid #ce93d8'
        }}>
          <div style={{ 
            fontSize: 18, 
            fontWeight: 700, 
            color: '#4a148c',
            fontFamily: "'Trebuchet MS', sans-serif"
          }}>⚔️ Daily Quests</div>
          <div style={{ 
            background: 'linear-gradient(135deg,#9c27b0,#7b1fa2)', 
            borderRadius: 20, 
            padding: '6px 16px', 
            fontSize: 13, 
            fontWeight: 700, 
            color: '#f3e5f5',
            fontFamily: "'Trebuchet MS', sans-serif",
            boxShadow: '0 2px 8px rgba(156,39,176,0.4)'
          }}>
            {done}/{TASKS.length} Complete
          </div>
        </div>

        {tasks.map(t => (
          <button key={t.id} onClick={() => toggleTask(t.id)} disabled={!!busy}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 16, 
              width: '100%', 
              padding: '16px 20px', 
              borderRadius: 16, 
              border: `2px solid ${t.done ? '#9c27b0' : '#ce93d8'}`, 
              background: t.done ? 'linear-gradient(135deg,#e1bee7,#f3e5f5)' : 'linear-gradient(135deg,#faf5ff,#f3e5f5)', 
              marginBottom: 12, 
              cursor: busy ? 'wait' : 'pointer', 
              textAlign: 'left', 
              transition: 'all .3s', 
              boxShadow: t.done ? '0 4px 16px rgba(156,39,176,0.3)' : '0 2px 8px rgba(156,39,176,0.1)',
              fontFamily: "'Trebuchet MS', sans-serif"
            }}
            onMouseEnter={e => { 
              if (!busy) {
                e.currentTarget.style.background = t.done ? 'linear-gradient(135deg,#ce93d8,#e1bee7)' : 'linear-gradient(135deg,#f3e5f5,#faf5ff)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }} 
            onMouseLeave={e => { 
              e.currentTarget.style.background = t.done ? 'linear-gradient(135deg,#e1bee7,#f3e5f5)' : 'linear-gradient(135deg,#faf5ff,#f3e5f5)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
            <div style={{ 
              width: 32, 
              height: 32, 
              minWidth: 32, 
              borderRadius: 10, 
              border: `3px solid ${t.done ? '#9c27b0' : '#ce93d8'}`, 
              background: t.done ? 'linear-gradient(135deg,#9c27b0,#7b1fa2)' : '#fff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: 16, 
              fontWeight: 700, 
              color: t.done ? '#f3e5f5' : '#9c27b0', 
              flexShrink: 0, 
              transition: 'all .3s',
              boxShadow: t.done ? '0 2px 8px rgba(156,39,176,0.4)' : 'none'
            }}>
              {busy === t.id ? '⌛' : t.done ? '✓' : ''}
            </div>
            <span style={{ fontSize: 22, lineHeight: 1 }}>{t.icon}</span>
            <span style={{ 
              flex: 1, 
              fontSize: 14, 
              fontWeight: 600, 
              color: t.done ? '#4a148c' : '#6a1b9a', 
              textDecoration: t.done ? 'line-through' : 'none',
              fontFamily: "'Trebuchet MS', sans-serif"
            }}>{t.name}</span>
            <span style={{ 
              background: t.done ? 'linear-gradient(135deg,#9c27b0,#7b1fa2)' : 'linear-gradient(135deg,#ffc107,#ff9800)', 
              border: `2px solid ${t.done ? '#9c27b0' : '#ff9800'}`, 
              borderRadius: 20, 
              padding: '6px 14px', 
              fontSize: 12, 
              fontWeight: 700, 
              color: t.done ? '#f3e5f5' : '#fff', 
              flexShrink: 0,
              fontFamily: "'Trebuchet MS', sans-serif",
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}>
              {t.done ? '✓ Complete' : `+${t.xp} XP`}
            </span>
          </button>
        ))}

        <div style={{ 
          padding: '16px 20px', 
          background: 'linear-gradient(135deg,#faf5ff,#f3e5f5)', 
          borderRadius: 16, 
          fontSize: 13, 
          color: '#4a148c', 
          border: '2px solid #ce93d8',
          fontFamily: "'Trebuchet MS', sans-serif",
          fontWeight: 600,
          textAlign: 'center',
          boxShadow: 'inset 0 2px 8px rgba(156,39,176,0.1)'
        }}>
          ⚡ Complete quests to earn XP and HP • Uncheck quests to lose HP • Level up every 500 XP!
        </div>
      </div>

      {/* ══ BOSS BATTLE ══ */}
      <div style={{ 
        background: 'linear-gradient(135deg,#4a148c,#6a1b9a)', 
        border: '3px solid #9c27b0', 
        borderTop: 'none', 
        borderRadius: '0 0 32px 32px', 
        padding: 28,
        boxShadow: '0 6px 30px rgba(74,20,140,0.4)'
      }}>
        <div style={{ 
          fontSize: 18, 
          fontWeight: 700, 
          color: '#f3e5f5', 
          marginBottom: 8,
          fontFamily: "'Trebuchet MS', sans-serif",
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>🐉 Dragon Battle: Procrastination Beast</div>
        <div style={{ 
          fontSize: 14, 
          color: '#e1bee7', 
          marginBottom: 20,
          fontFamily: "'Trebuchet MS', sans-serif"
        }}>Complete quests to attack the beast!</div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: 13, 
          fontWeight: 600, 
          color: '#f3e5f5', 
          marginBottom: 8,
          fontFamily: "'Trebuchet MS', sans-serif"
        }}>
          <span>🐉 Beast Health</span>
          <span>{100 - bossPct}% Remaining</span>
        </div>
        <div style={{ 
          background: 'rgba(255,255,255,0.2)', 
          borderRadius: 12, 
          height: 20, 
          overflow: 'hidden', 
          marginBottom: 16,
          border: '2px solid rgba(255,255,255,0.3)'
        }}>
          <div style={{ 
            height: '100%', 
            width: `${bossPct}%`, 
            background: 'linear-gradient(90deg,#ff5722,#f44336,#e91e63)', 
            borderRadius: 12, 
            transition: 'width .8s ease',
            boxShadow: '0 0 20px rgba(255,87,34,0.6)'
          }} />
        </div>
        <div style={{ 
          textAlign: 'center', 
          fontSize: 14, 
          color: '#f3e5f5', 
          fontWeight: 600,
          fontFamily: "'Trebuchet MS', sans-serif",
          padding: '12px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          {done === 0 && '⚔️ Begin your quest! Complete tasks to attack!'}
          {done > 0 && done < TASKS.length && `⚔️ ${bossPct}% Damage Dealt — Continue the Battle!`}
          {done === TASKS.length && '🏆 Victory! Beast Defeated — All Quests Complete!'}
        </div>
      </div>

    </div>
  );
}
