'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  PenLine, Search, Trash2, Edit3, Lock, Unlock, X, Check,
  AlertCircle, BookOpen, Zap, Heart, TrendingUp, Filter,
  Image as ImageIcon, Sparkles, Flame, FileText,
  RefreshCw, ChevronRight, Smile, Frown, Meh,
  Cloud, ArrowLeft, Calendar, SortAsc, SortDesc,
} from 'lucide-react';

const C = {
  teal:       '#40738E', tealDark:'#2d5a72', tealLight:'#CFE1E1', tealFaint:'#EBF4F4',
  green:      '#8CD092', greenDark:'#5fa86e', greenFaint:'#EAF7ED',
  pageBg:     '#F7FBFE', surface:'#FFFFFF', dark:'#1B2A3D',
  ink:        '#0f2420', inkMid:'#2d4a47', inkMuted:'#6b8a87',
  border:     '#DDE9E8', borderMid:'#C8DCDB',
  danger:     '#dc2626', dangerFaint:'#fef2f2',
  warn:       '#b45309', warnFaint:'#fef9e7',
};

const API_URL = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

const MOOD_CFG: Record<string, { Icon: React.FC<any>; label: string; color: string; bg: string; border: string; dot: string }> = {
  great:      { Icon: Smile,      label: 'Great',      color: '#16a34a', bg: '#dcfce7',    border: '#86efac', dot: '#22c55e' },
  good:       { Icon: TrendingUp, label: 'Good',       color: C.teal,    bg: C.tealFaint,  border: C.tealLight, dot: C.teal },
  okay:       { Icon: Meh,        label: 'Okay',       color: C.warn,    bg: C.warnFaint,  border: '#fde68a', dot: '#f59e0b' },
  struggling: { Icon: Cloud,      label: 'Struggling', color: '#9a3412', bg: '#fff7ed',    border: '#fdba74', dot: '#f97316' },
  relapsed:   { Icon: Frown,      label: 'Relapsed',   color: C.danger,  bg: C.dangerFaint,border: '#fca5a5', dot: C.danger },
};
const MOOD_OPTIONS = ['great', 'good', 'okay', 'struggling', 'relapsed'];

const TRIGGER_SUGGESTIONS = [
  'Stress','Anxiety','Social pressure','Loneliness','Boredom','Work pressure',
  'Family issues','Sleep deprivation','Financial stress','Relationship conflict',
  'FOMO','Physical pain','Negative thoughts',
];
const COPING_SUGGESTIONS = [
  'Deep breathing','Exercise','Called support person','Journaling','Meditation',
  'Walked away','Distraction technique','Used hotline','Attended meeting',
  'Read recovery material','Cold water','Music',
];

interface JournalEntry {
  _id: string; user: string; content: string; mood: string;
  triggers: string[]; copingStrategies: string[];
  image?: string; isPrivate: boolean; createdAt: string; updatedAt: string;
}
interface Pagination { page: number; limit: number; total: number; totalPages: number; }

async function apiFetchEntries(page = 1, limit = 20, dateFilter?: string) {
  const p = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (dateFilter) p.set('date', dateFilter);
  const res = await fetch(`${API_URL}/api/journals?${p}`, { credentials: 'include' });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to load entries');
  return res.json() as Promise<{ entries: JournalEntry[]; pagination: Pagination }>;
}
async function apiCreate(fd: FormData): Promise<JournalEntry> {
  const res = await fetch(`${API_URL}/api/journals`, { method: 'POST', credentials: 'include', body: fd });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Failed to create entry');
  return json;
}
async function apiUpdate(id: string, fd: FormData): Promise<JournalEntry> {
  const res = await fetch(`${API_URL}/api/journals/${id}`, { method: 'PATCH', credentials: 'include', body: fd });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Failed to update entry');
  return json;
}
async function apiDelete(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/journals/${id}`, { method: 'DELETE', credentials: 'include' });
  if (!res.ok) throw new Error('Failed to delete entry');
}

const fmtDate  = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' });
const fmtTime  = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
const fmtShort = (d: string) => new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric' });
const fmtDay   = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });
const wc       = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

function TagInput({ label, value, onChange, suggestions, placeholder, accentColor }: {
  label: string; value: string[]; onChange: (v: string[]) => void;
  suggestions: string[]; placeholder: string; accentColor: string;
}) {
  const [inp, setInp]   = useState('');
  const [open, setOpen] = useState(false);
  const add = (t: string) => { const s = t.trim(); if (s && !value.includes(s)) onChange([...value, s]); setInp(''); setOpen(false); };

  return (
    <div>
      <label style={{ fontSize:10, fontWeight:700, color:C.inkMuted, textTransform:'uppercase' as const, letterSpacing:'.1em', display:'block', marginBottom:8 }}>{label}</label>
      {value.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap' as const, gap:6, marginBottom:8 }}>
          {value.map(t => (
            <span key={t} style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 12px', borderRadius:999, background:C.tealFaint, border:`1px solid ${C.tealLight}`, fontSize:12, color:C.teal, fontWeight:600 }}>
              {t}
              <button onClick={() => onChange(value.filter(x => x !== t))} style={{ background:'none', border:'none', cursor:'pointer', color:C.teal, display:'flex', padding:0, lineHeight:0 }}>
                <X size={10} strokeWidth={3} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div style={{ position:'relative' }}>
        <input value={inp} onChange={e => setInp(e.target.value)} onFocus={() => setOpen(true)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (inp.trim()) add(inp); } }}
          placeholder={placeholder}
          style={{ width:'100%', padding:'9px 12px', borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:13, color:C.ink, background:C.surface, outline:'none', boxSizing:'border-box' as const, fontFamily:'inherit' }}
          onFocus={e => (e.target.style.borderColor = C.teal)}
          onBlur={e => { e.target.style.borderColor = C.border; setTimeout(() => setOpen(false), 120); }} />
        {open && (suggestions.filter(s => s.toLowerCase().includes(inp.toLowerCase()) && !value.includes(s)).length > 0 || inp.trim()) && (
          <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, boxShadow:'0 12px 32px rgba(64,115,142,.14)', zIndex:60, maxHeight:200, overflowY:'auto' as const, padding:'4px 0' }}>
            {suggestions.filter(s => s.toLowerCase().includes(inp.toLowerCase()) && !value.includes(s)).map(s => (
              <button key={s} onMouseDown={() => add(s)}
                style={{ display:'block', width:'100%', padding:'9px 14px', textAlign:'left' as const, background:'none', border:'none', fontSize:13, color:C.inkMid, cursor:'pointer', fontFamily:'inherit' }}
                onMouseEnter={e => (e.currentTarget.style.background = C.tealFaint)}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}>{s}</button>
            ))}
            {inp.trim() && !suggestions.includes(inp.trim()) && (
              <button onMouseDown={() => add(inp)}
                style={{ display:'block', width:'100%', padding:'9px 14px', textAlign:'left' as const, background:'none', border:'none', fontSize:13, color:accentColor, fontWeight:600, cursor:'pointer', borderTop:`1px solid ${C.border}`, fontFamily:'inherit' }}>
                + Add "{inp.trim()}"
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EntryEditor({ entry, onSave, onCancel, saving }: {
  entry?: JournalEntry | null; onSave: (fd: FormData) => Promise<void>;
  onCancel: () => void; saving: boolean;
}) {
  const [content,  setContent]  = useState(entry?.content ?? '');
  const [mood,     setMood]     = useState(entry?.mood ?? 'okay');
  const [triggers, setTriggers] = useState<string[]>(entry?.triggers ?? []);
  const [coping,   setCoping]   = useState<string[]>(entry?.copingStrategies ?? []);
  const [isPrivate, setPrivate] = useState(entry?.isPrivate ?? true);
  const [imgFile,  setImgFile]  = useState<File | null>(null);
  const [imgPrev,  setImgPrev]  = useState<string | null>(entry?.image ?? null);
  const [error,    setError]    = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const words = wc(content);
  const moodCfg = MOOD_CFG[mood];

  const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setError('Image must be under 5 MB'); return; }
    setImgFile(f);
    const r = new FileReader(); r.onload = ev => setImgPrev(ev.target?.result as string); r.readAsDataURL(f);
  };

  const submit = async () => {
    if (content.trim().length < 10) { setError('Write at least 10 characters'); return; }
    setError('');
    const fd = new FormData();
    fd.append('content', content.trim()); fd.append('mood', mood);
    fd.append('triggers', JSON.stringify(triggers)); fd.append('copingStrategies', JSON.stringify(coping));
    fd.append('isPrivate', String(isPrivate));
    if (imgFile) fd.append('image', imgFile);
    try { await onSave(fd); } catch (e: any) { setError(e.message); }
  };

  const today = new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });

  return (
    <div>
      {/* Top bar */}
      <div style={{ display:'flex', alignItems:'center', gap:12, paddingBottom:20, marginBottom:24, borderBottom:`1px solid ${C.border}` }}>
        <button onClick={onCancel}
          style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:10, border:`1.5px solid ${C.border}`, background:'transparent', fontSize:13, color:C.inkMid, fontWeight:500, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' as const }}
          onMouseEnter={e => { e.currentTarget.style.borderColor=C.teal; e.currentTarget.style.color=C.teal; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.inkMid; }}>
          <ArrowLeft size={16} strokeWidth={2} /> Back
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:C.inkMuted, flex:1, justifyContent:'center' }}>
          <Calendar size={13} strokeWidth={2} color={C.inkMuted} /> {today}
        </div>
        <button onClick={submit} disabled={saving}
          style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 22px', borderRadius:12, border:'none', background:`linear-gradient(135deg,${C.teal},${C.green})`, color:'#fff', fontSize:13, fontWeight:700, cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', whiteSpace:'nowrap' as const, boxShadow:'0 4px 14px rgba(64,115,142,.28)', opacity:saving?.7:1, transition:'opacity .15s' }}>
          {saving ? <><RefreshCw size={14} style={{ animation:'spin 1s linear infinite' }} /> Saving…</> : <><Check size={14} strokeWidth={2.5} /> {entry ? 'Update Entry' : 'Save Entry'}</>}
        </button>
      </div>

      {error && (
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:C.dangerFaint, border:`1px solid #fca5a5`, borderRadius:10, marginBottom:16, fontSize:13, color:C.danger }}>
          <AlertCircle size={14} strokeWidth={2} /> {error}
        </div>
      )}

      {/* Two-column layout */}
      <div style={{ display:'grid', gridTemplateColumns:'290px 1fr', gap:22 }}>

        {/* ── Left panel ── */}
        <div style={{ display:'flex', flexDirection:'column' as const, gap:16 }}>

          {/* Mood */}
          <div style={{ background:C.pageBg, border:`1px solid ${C.border}`, borderRadius:14, padding:16 }}>
            <p style={{ fontSize:10, fontWeight:700, color:C.inkMuted, textTransform:'uppercase' as const, letterSpacing:'.1em', marginBottom:12 }}>How are you feeling?</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7 }}>
              {MOOD_OPTIONS.map(m => {
                const cfg = MOOD_CFG[m]; const active = mood === m;
                return (
                  <button key={m} onClick={() => setMood(m)}
                    style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 10px', borderRadius:10, border:`1.5px solid ${active ? cfg.color : C.border}`, background:active ? cfg.bg : C.surface, cursor:'pointer', fontFamily:'inherit', fontSize:13, position:'relative' as const, transition:'all .15s', textAlign:'left' as const }}>
                    <div style={{ width:30, height:30, borderRadius:8, background:active?cfg.bg:'transparent', border:`1.5px solid ${active?cfg.color:C.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <cfg.Icon size={16} strokeWidth={active?2.5:1.8} color={active?cfg.color:C.inkMuted} />
                    </div>
                    <span style={{ color:active?cfg.color:C.inkMuted, fontWeight:active?700:400 }}>{cfg.label}</span>
                    {active && <div style={{ position:'absolute', top:6, right:6, width:7, height:7, borderRadius:'50%', background:cfg.dot }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Triggers */}
          <div style={{ background:C.pageBg, border:`1px solid ${C.border}`, borderRadius:14, padding:16 }}>
            <TagInput label="Triggers" value={triggers} onChange={setTriggers} suggestions={TRIGGER_SUGGESTIONS} placeholder="Add trigger & press Enter…" accentColor={C.warn} />
          </div>

          {/* Coping */}
          <div style={{ background:C.pageBg, border:`1px solid ${C.border}`, borderRadius:14, padding:16 }}>
            <TagInput label="Coping Strategies" value={coping} onChange={setCoping} suggestions={COPING_SUGGESTIONS} placeholder="Add strategy & press Enter…" accentColor={C.teal} />
          </div>

          {/* Image */}
          <div style={{ background:C.pageBg, border:`1px solid ${C.border}`, borderRadius:14, padding:16 }}>
            <p style={{ fontSize:10, fontWeight:700, color:C.inkMuted, textTransform:'uppercase' as const, letterSpacing:'.1em', marginBottom:10 }}>Photo <span style={{ fontWeight:400, fontSize:10, textTransform:'none' as const }}>(optional · max 5 MB)</span></p>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImg} style={{ display:'none' }} />
            {imgPrev ? (
              <div style={{ position:'relative', display:'inline-flex', alignItems:'flex-start', gap:8 }}>
                <img src={imgPrev} alt="preview" style={{ maxWidth:200, maxHeight:150, borderRadius:10, border:`1px solid ${C.border}`, objectFit:'cover' }} />
                <button onClick={() => { setImgFile(null); setImgPrev(null); if(fileRef.current) fileRef.current.value=''; }}
                  style={{ width:24, height:24, borderRadius:'50%', background:C.danger, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', flexShrink:0 }}>
                  <X size={11} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 16px', borderRadius:10, border:`1.5px dashed ${C.borderMid}`, background:'transparent', color:C.inkMuted, fontSize:13, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=C.teal; e.currentTarget.style.color=C.teal; e.currentTarget.style.background=C.tealFaint; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=C.borderMid; e.currentTarget.style.color=C.inkMuted; e.currentTarget.style.background='transparent'; }}>
                <ImageIcon size={15} strokeWidth={1.8} /> Upload photo
              </button>
            )}
          </div>

          {/* Privacy */}
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', borderRadius:12, background:C.pageBg, border:`1px solid ${C.border}` }}>
            <button onClick={() => setPrivate(!isPrivate)}
              style={{ position:'relative', width:44, height:24, borderRadius:999, background:isPrivate?C.teal:C.green, border:'none', cursor:'pointer', transition:'background .2s', flexShrink:0 }}>
              <div style={{ position:'absolute', top:3, left:isPrivate?3:23, width:18, height:18, borderRadius:'50%', background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,.2)', transition:'left .2s' }} />
            </button>
            {isPrivate ? <Lock size={13} strokeWidth={2} color={C.teal} /> : <Unlock size={13} strokeWidth={2} color={C.greenDark} />}
            <div>
              <p style={{ fontSize:13, fontWeight:600, color:C.inkMid, margin:0 }}>{isPrivate?'Private entry':'Visible to supporters'}</p>
              <p style={{ fontSize:11, color:C.inkMuted, margin:0, marginTop:2 }}>{isPrivate?'Only you can read this':'Support network can view'}</p>
            </div>
          </div>
        </div>

        {/* ── Right: textarea ── */}
        <div style={{ display:'flex', flexDirection:'column' as const }}>
          <div style={{ flex:1, background:C.surface, border:`1px solid ${C.border}`, borderRadius:18, overflow:'hidden', display:'flex', flexDirection:'column' as const, boxShadow:'0 4px 16px rgba(64,115,142,.07)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px 0' }}>
              <span style={{ fontSize:11, fontWeight:700, color:C.inkMuted, textTransform:'uppercase' as const, letterSpacing:'.1em' }}>Your thoughts</span>
              <span style={{ fontSize:12, fontWeight:600, color:words>0?C.teal:C.inkMuted }}>{words} {words===1?'word':'words'}</span>
            </div>
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="What's on your mind today? This is your safe space…"
              style={{ flex:1, width:'100%', minHeight:440, padding:'14px 18px', border:'none', fontSize:15, lineHeight:1.85, color:C.ink, background:'transparent', resize:'none' as const, outline:'none', fontFamily:"'DM Serif Display', Georgia, serif", boxSizing:'border-box' as const }}
            />
            {/* Mood badge inside textarea box */}
            {mood && (
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, margin:'0 18px 14px', padding:'5px 12px', borderRadius:999, background:moodCfg.bg, border:`1px solid ${moodCfg.border}`, width:'fit-content' }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:moodCfg.dot }} />
                <span style={{ color:moodCfg.color, fontWeight:600, fontSize:12 }}>Feeling {moodCfg.label}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EntryDetail({ entry, onClose, onEdit }: { entry: JournalEntry; onClose: () => void; onEdit: () => void; }) {
  const moodCfg = MOOD_CFG[entry.mood] ?? MOOD_CFG.okay;
  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:14, paddingBottom:20, marginBottom:24, borderBottom:`1px solid ${C.border}` }}>
        <button onClick={onClose}
          style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:10, border:`1.5px solid ${C.border}`, background:'transparent', fontSize:13, color:C.inkMid, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor=C.teal; e.currentTarget.style.color=C.teal; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.inkMid; }}>
          <ArrowLeft size={16} strokeWidth={2} /> Back
        </button>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:999, background:moodCfg.bg, border:`1px solid ${moodCfg.border}` }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:moodCfg.dot }} />
          <moodCfg.Icon size={14} strokeWidth={2} color={moodCfg.color} />
          <span style={{ color:moodCfg.color, fontWeight:700, fontSize:13 }}>{moodCfg.label}</span>
        </div>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:15, fontWeight:600, color:C.ink, margin:0 }}>{fmtDay(entry.createdAt)}</p>
          <p style={{ fontSize:12, color:C.inkMuted, margin:0, marginTop:1 }}>{fmtTime(entry.createdAt)}</p>
        </div>
        <button onClick={onEdit}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 18px', borderRadius:10, border:`1.5px solid ${C.tealLight}`, background:C.tealFaint, color:C.teal, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}
          onMouseEnter={e => { e.currentTarget.style.background=C.teal; e.currentTarget.style.color='#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background=C.tealFaint; e.currentTarget.style.color=C.teal; }}>
          <Edit3 size={13} strokeWidth={2} /> Edit
        </button>
      </div>

      <div style={{ display:'flex', flexDirection:'column' as const, gap:18 }}>
        {entry.image && (
          <div style={{ borderRadius:16, overflow:'hidden', border:`1px solid ${C.border}` }}>
            <img src={entry.image} alt="journal" style={{ width:'100%', maxHeight:300, objectFit:'cover', display:'block' }} />
          </div>
        )}

        {/* Content block with decorative quote mark */}
        <div style={{ position:'relative', background:C.tealFaint, border:`1px solid ${C.tealLight}`, borderRadius:18, padding:'28px 32px 20px' }}>
          <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:72, color:C.tealLight, lineHeight:.7, position:'absolute', top:10, left:16, pointerEvents:'none', fontStyle:'italic' as const }}>"</div>
          <p style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:15.5, lineHeight:1.95, color:C.inkMid, margin:'0 0 16px', whiteSpace:'pre-wrap', position:'relative', zIndex:1 }}>{entry.content}</p>
          <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:C.inkMuted, paddingTop:12, borderTop:`1px solid ${C.tealLight}` }}>
            <span>{wc(entry.content)} words</span><span>·</span>
            <span>{entry.isPrivate ? '🔒 Private' : '👁 Shared'}</span>
            {entry.image && <><span>·</span><span>📷 Has photo</span></>}
          </div>
        </div>

        {(entry.triggers.length > 0 || entry.copingStrategies.length > 0) && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {entry.triggers.length > 0 && (
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'14px 16px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:10, fontWeight:700, color:C.inkMuted, textTransform:'uppercase' as const, letterSpacing:'.1em', marginBottom:10 }}>
                  <Zap size={12} strokeWidth={2} color={C.warn} /> Triggers
                </div>
                <div style={{ display:'flex', flexWrap:'wrap' as const, gap:6 }}>
                  {entry.triggers.map(t => <span key={t} style={{ fontSize:12, padding:'3px 10px', borderRadius:999, background:C.warnFaint, color:C.warn, border:'1px solid #fde68a', fontWeight:500 }}>{t}</span>)}
                </div>
              </div>
            )}
            {entry.copingStrategies.length > 0 && (
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'14px 16px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:10, fontWeight:700, color:C.inkMuted, textTransform:'uppercase' as const, letterSpacing:'.1em', marginBottom:10 }}>
                  <Heart size={12} strokeWidth={2} color={C.teal} /> Coping Strategies
                </div>
                <div style={{ display:'flex', flexWrap:'wrap' as const, gap:6 }}>
                  {entry.copingStrategies.map(s => <span key={s} style={{ fontSize:12, padding:'3px 10px', borderRadius:999, background:C.tealFaint, color:C.teal, border:`1px solid ${C.tealLight}`, fontWeight:500 }}>{s}</span>)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EntryCard({ entry, onEdit, onDelete, onView }: { entry: JournalEntry; onEdit: () => void; onDelete: () => void; onView: () => void; }) {
  const [delConfirm, setDelConfirm] = useState(false);
  const moodCfg = MOOD_CFG[entry.mood] ?? MOOD_CFG.okay;

  return (
    <div onClick={onView}
      style={{ position:'relative', overflow:'hidden', background:C.surface, border:`1px solid ${C.border}`, borderRadius:18, cursor:'pointer', boxShadow:'0 2px 10px rgba(64,115,142,.07)', transition:'transform .18s, box-shadow .18s' }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 10px 28px rgba(64,115,142,.14)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 2px 10px rgba(64,115,142,.07)'; }}>

      {/* Colour accent strip at top */}
      <div style={{ height:3, background:moodCfg.dot, width:'100%' }} />

      <div style={{ padding:'14px 16px 0' }}>
        {/* Header row */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            <div style={{ width:30, height:30, borderRadius:9, background:moodCfg.bg, border:`1px solid ${moodCfg.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <moodCfg.Icon size={14} strokeWidth={2} color={moodCfg.color} />
            </div>
            <div>
              <p style={{ fontSize:12, fontWeight:700, color:moodCfg.color, margin:0 }}>{moodCfg.label}</p>
              <p style={{ fontSize:11, color:C.inkMuted, margin:0 }}>{fmtShort(entry.createdAt)} · {fmtTime(entry.createdAt)}</p>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:4 }} onClick={e => e.stopPropagation()}>
            {entry.isPrivate && <Lock size={11} strokeWidth={2} color={C.inkMuted} style={{ opacity:.55, marginRight:2 }} />}
            {delConfirm ? (
              <div style={{ display:'flex', gap:4 }}>
                <button onClick={() => onDelete()} style={{ padding:'3px 10px', borderRadius:7, background:C.danger, border:'none', cursor:'pointer', fontSize:11, color:'#fff', fontWeight:700, fontFamily:'inherit' }}>Delete</button>
                <button onClick={() => setDelConfirm(false)} style={{ padding:'3px 10px', borderRadius:7, background:C.border, border:'none', cursor:'pointer', fontSize:11, color:C.inkMid, fontWeight:700, fontFamily:'inherit' }}>Cancel</button>
              </div>
            ) : (
              <>
                <button onClick={() => onEdit()}
                  style={{ width:28, height:28, borderRadius:8, background:'transparent', border:`1px solid ${C.border}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background=C.tealFaint; e.currentTarget.style.borderColor=C.teal; }}
                  onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor=C.border; }}>
                  <Edit3 size={12} strokeWidth={2} color={C.teal} />
                </button>
                <button onClick={() => setDelConfirm(true)}
                  style={{ width:28, height:28, borderRadius:8, background:'transparent', border:`1px solid ${C.border}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background=C.dangerFaint; e.currentTarget.style.borderColor=C.danger; }}
                  onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor=C.border; }}>
                  <Trash2 size={12} strokeWidth={2} color={C.danger} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Thumbnail */}
        {entry.image && (
          <div style={{ marginBottom:10 }}>
            <img src={entry.image} alt="" style={{ width:'100%', height:110, objectFit:'cover', borderRadius:10, display:'block' }} />
          </div>
        )}

        {/* Content preview */}
        <p style={{ fontSize:13.5, lineHeight:1.7, color:C.inkMid, margin:'0 0 10px', display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {entry.content}
        </p>
      </div>

      {/* Footer */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 16px 13px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:5, flexWrap:'wrap' as const }}>
          {entry.triggers.slice(0,2).map(t => (
            <span key={t} style={{ fontSize:11, padding:'2px 8px', borderRadius:999, background:C.warnFaint, color:C.warn, border:'1px solid #fde68a', fontWeight:500 }}>{t}</span>
          ))}
          {entry.triggers.length > 2 && <span style={{ fontSize:11, color:C.inkMuted }}>+{entry.triggers.length-2}</span>}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          {entry.image && <ImageIcon size={11} strokeWidth={2} color={C.inkMuted} />}
          <span style={{ fontSize:11, color:C.inkMuted }}>{wc(entry.content)}w</span>
          <ChevronRight size={13} strokeWidth={2} color={C.tealLight} />
        </div>
      </div>
    </div>
  );
}

function StatsBar({ entries }: { entries: JournalEntry[] }) {
  const total = entries.length;
  const words = entries.reduce((s, e) => s + wc(e.content), 0);
  const dist: Record<string,number> = {};
  entries.forEach(e => { dist[e.mood] = (dist[e.mood]??0)+1; });
  const topMood = Object.entries(dist).sort((a,b)=>b[1]-a[1])[0];
  const todayN  = entries.filter(e => new Date(e.createdAt).toDateString()===new Date().toDateString()).length;
  const topCfg  = topMood ? MOOD_CFG[topMood[0]] : null;

  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
      {[
        { icon:<FileText  size={18} strokeWidth={1.8} color={C.teal}    />, value:String(total), label:'Total Entries', bg:C.tealFaint  },
        { icon:<BookOpen  size={18} strokeWidth={1.8} color={C.tealDark}/>, value:String(words), label:'Total Words',   bg:C.tealFaint  },
        { icon:<Flame     size={18} strokeWidth={1.8} color='#f97316'   />, value:String(todayN),label:'Today',         bg:'#fff7ed'    },
        {
          icon: topCfg ? <topCfg.Icon size={18} strokeWidth={1.8} color={topCfg.color} /> : <Sparkles size={18} strokeWidth={1.8} color={C.inkMuted} />,
          value: topCfg ? topCfg.label : '—', label:'Top Mood',
          bg: topCfg ? topCfg.bg : C.pageBg,
        },
      ].map(s => (
        <div key={s.label} style={{ display:'flex', alignItems:'center', gap:14, padding:'18px 20px', borderRadius:18, background:s.bg, border:`1px solid ${C.border}`, boxShadow:'0 2px 8px rgba(64,115,142,.06)', transition:'transform .15s' }}
          onMouseEnter={e => (e.currentTarget.style.transform='translateY(-2px)')}
          onMouseLeave={e => (e.currentTarget.style.transform='none')}>
          <div style={{ width:40, height:40, borderRadius:12, background:C.surface, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 1px 4px rgba(64,115,142,.1)' }}>{s.icon}</div>
          <div>
            <p style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, fontWeight:400, color:C.ink, lineHeight:1, margin:'0 0 3px' }}>{s.value}</p>
            <p style={{ fontSize:10, fontWeight:700, color:C.inkMuted, textTransform:'uppercase' as const, letterSpacing:'.1em', margin:0 }}>{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function JournalsPage() {
  const [entries,    setEntries]    = useState<JournalEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [pageError,  setPageError]  = useState<string | null>(null);
  const [page,       setPage]       = useState(1);

  type Mode = 'list' | 'new' | 'edit' | 'view';
  const [mode,     setMode]     = useState<Mode>('list');
  const [selected, setSelected] = useState<JournalEntry | null>(null);
  const [saving,   setSaving]   = useState(false);

  const [search,        setSearch]        = useState('');
  const [moodFilter,    setMoodFilter]    = useState('all');
  const [privacyFilter, setPrivacyFilter] = useState('all');
  const [dateFilter,    setDateFilter]    = useState('');
  const [sortOrder,     setSortOrder]     = useState<'desc'|'asc'>('desc');

  const load = useCallback(async (pg = 1) => {
    setLoading(true); setPageError(null);
    try {
      const data = await apiFetchEntries(pg, 20, dateFilter || undefined);
      setEntries(data.entries); setPagination(data.pagination);
    } catch (e: any) { setPageError(e.message); }
    finally { setLoading(false); }
  }, [dateFilter]);

  useEffect(() => { load(page); }, [page, dateFilter]);

  const filtered = entries
    .filter(e => {
      const ms = !search || e.content.toLowerCase().includes(search.toLowerCase()) || e.triggers.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const mm = moodFilter==='all' || e.mood===moodFilter;
      const mp = privacyFilter==='all' || (privacyFilter==='private' ? e.isPrivate : !e.isPrivate);
      return ms && mm && mp;
    })
    .sort((a,b) => sortOrder==='desc'
      ? new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()
      : new Date(a.createdAt).getTime()-new Date(b.createdAt).getTime());

  async function handleSave(fd: FormData) {
    setSaving(true);
    try {
      if (mode==='edit' && selected) {
        const u = await apiUpdate(selected._id, fd);
        setEntries(prev => prev.map(e => e._id===u._id?u:e));
        setSelected(u); setMode('view');
      } else {
        const c = await apiCreate(fd);
        setEntries(prev => [c,...prev]);
        setMode('list');
      }
    } catch (e: any) { throw e; }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      await apiDelete(id);
      setEntries(prev => prev.filter(e => e._id!==id));
      if (selected?._id===id) { setMode('list'); setSelected(null); }
    } catch (e: any) { setPageError(e.message); }
  }

  const panelStyle: React.CSSProperties = {
    background:C.surface, border:`1px solid ${C.border}`, borderRadius:22,
    padding:28, boxShadow:'0 4px 24px rgba(64,115,142,.08)',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .journal-root * { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;} }
        @keyframes spin   { to{transform:rotate(360deg);} }
        .jfi   { animation:fadeUp .38s both; }
        .jfi-1 { animation-delay:.06s; }
        .jfi-2 { animation-delay:.12s; }
        .journal-root { font-family:'DM Sans',system-ui,sans-serif; }
        .journal-root textarea { font-family:'DM Serif Display',Georgia,serif; }
        @media(max-width:768px){
          .editor-2col{grid-template-columns:1fr!important;}
          .stats-4{grid-template-columns:1fr 1fr!important;}
          .cards-auto{grid-template-columns:1fr!important;}
          .detail-tags-2{grid-template-columns:1fr!important;}
          .page-h1{font-size:28px!important;}
        }
      `}</style>

      <div className="journal-root" style={{ color:C.ink, paddingBottom:48 }}>

        {/* ── Header ── */}
        <div className="jfi" style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-end', justifyContent:'space-between', gap:16, marginBottom:28 }}>
          <div>
            <p style={{ fontSize:12, color:C.inkMuted, marginBottom:5, letterSpacing:'.03em' }}>Portal &rsaquo; <strong style={{ color:C.inkMid }}>Recovery Journal</strong></p>
            <h1 className="page-h1" style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:38, fontWeight:400, color:C.dark, letterSpacing:'-.5px', lineHeight:1.1, margin:'0 0 5px' }}>My Journal</h1>
            <p style={{ fontSize:14, color:C.inkMuted, margin:0 }}>Your private space to reflect, process, and grow.</p>
          </div>
          {mode==='list' && (
            <button onClick={() => { setMode('new'); setSelected(null); }}
              style={{ display:'flex', alignItems:'center', gap:9, padding:'12px 24px', borderRadius:14, border:'none', background:`linear-gradient(135deg,${C.teal},${C.green})`, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 16px rgba(64,115,142,.28)', transition:'transform .15s,box-shadow .15s' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(64,115,142,.38)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 4px 16px rgba(64,115,142,.28)';}}>
              <PenLine size={16} strokeWidth={2} /> New Entry
            </button>
          )}
        </div>

        {/* ── Stats ── */}
        {mode==='list' && entries.length>0 && (
          <div className="jfi jfi-1 stats-4"><StatsBar entries={entries} /></div>
        )}

        {/* ── Editor ── */}
        {(mode==='new'||mode==='edit') && (
          <div className="jfi" style={panelStyle}>
            <EntryEditor entry={mode==='edit'?selected:null} onSave={handleSave} onCancel={() => setMode(selected?'view':'list')} saving={saving} />
          </div>
        )}

        {/* ── Detail ── */}
        {mode==='view' && selected && (
          <div className="jfi" style={panelStyle}>
            <EntryDetail entry={selected} onClose={() => { setMode('list'); setSelected(null); }} onEdit={() => setMode('edit')} />
          </div>
        )}

        {/* ── List ── */}
        {mode==='list' && (
          <>
            {/* Filter bar */}
            <div className="jfi jfi-1" style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:18, padding:'14px 18px', marginBottom:20, boxShadow:'0 2px 8px rgba(64,115,142,.05)', display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
              <div style={{ position:'relative', flex:1, minWidth:200 }}>
                <Search size={14} strokeWidth={2} color={C.inkMuted} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search entries, triggers…"
                  style={{ width:'100%', paddingLeft:34, paddingRight:10, paddingTop:9, paddingBottom:9, borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:13, color:C.ink, background:C.pageBg, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
                  onFocus={e=>(e.target.style.borderColor=C.teal)} onBlur={e=>(e.target.style.borderColor=C.border)} />
              </div>
              {[
                { value:moodFilter, onChange:(v:string)=>setMoodFilter(v), options:[['all','All Moods'],...MOOD_OPTIONS.map(m=>[m,MOOD_CFG[m].label])] },
                { value:privacyFilter, onChange:(v:string)=>setPrivacyFilter(v), options:[['all','All Entries'],['private','Private'],['shared','Shared']] },
              ].map((sel,i) => (
                <select key={i} value={sel.value} onChange={e => sel.onChange(e.target.value)}
                  style={{ padding:'9px 12px', borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:13, color:C.inkMid, background:C.pageBg, outline:'none', cursor:'pointer', fontFamily:'inherit' }}
                  onFocus={e=>(e.target.style.borderColor=C.teal)} onBlur={e=>(e.target.style.borderColor=C.border)}>
                  {sel.options.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              ))}
              <input type="date" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(1); }}
                style={{ padding:'9px 12px', borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:13, color:C.inkMid, background:C.pageBg, outline:'none', cursor:'pointer', fontFamily:'inherit' }} />
              {dateFilter && (
                <button onClick={() => setDateFilter('')}
                  style={{ width:36, height:36, borderRadius:10, border:`1.5px solid ${C.border}`, background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <X size={14} strokeWidth={2} color={C.inkMuted} />
                </button>
              )}
              <button onClick={() => setSortOrder(s => s==='desc'?'asc':'desc')}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 14px', borderRadius:10, border:`1.5px solid ${C.border}`, background:'transparent', fontSize:13, color:C.inkMuted, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap', transition:'all .15s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=C.teal;e.currentTarget.style.color=C.teal;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.inkMuted;}}>
                {sortOrder==='desc' ? <SortDesc size={14} strokeWidth={2}/> : <SortAsc size={14} strokeWidth={2}/>}
                {sortOrder==='desc' ? 'Newest' : 'Oldest'}
              </button>
            </div>

            {pageError && (
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'11px 16px', background:C.dangerFaint, border:`1px solid #fca5a5`, borderRadius:12, marginBottom:14, fontSize:13, color:C.danger }}>
                <AlertCircle size={14} strokeWidth={2} /> {pageError}
                <button onClick={() => load(page)} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:C.danger, fontWeight:700, fontSize:12, fontFamily:'inherit' }}>Retry</button>
              </div>
            )}

            {loading && (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:14, padding:80 }}>
                <div style={{ width:44, height:44, borderRadius:'50%', border:`3px solid ${C.tealLight}`, borderTopColor:C.teal, animation:'spin 1s linear infinite' }} />
                <p style={{ fontSize:14, color:C.inkMuted }}>Loading your journal…</p>
              </div>
            )}

            {!loading && filtered.length===0 && (
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:20, padding:'80px 32px', textAlign:'center', boxShadow:'0 4px 16px rgba(64,115,142,.06)' }}>
                <div style={{ width:72, height:72, borderRadius:20, background:C.tealFaint, border:`1px solid ${C.tealLight}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
                  <BookOpen size={30} strokeWidth={1.5} color={C.teal} />
                </div>
                <p style={{ fontFamily:"'DM Serif Display',serif", fontSize:26, color:C.ink, margin:'0 0 10px' }}>
                  {entries.length===0 ? 'Your journal awaits' : 'No entries match'}
                </p>
                <p style={{ fontSize:14, color:C.inkMuted, lineHeight:1.7, margin:'0 0 28px' }}>
                  {entries.length===0 ? 'Start writing — every entry is a step toward healing. Your words matter.' : 'Try adjusting your search or filters.'}
                </p>
                {entries.length===0 && (
                  <button onClick={() => setMode('new')}
                    style={{ padding:'13px 32px', borderRadius:14, border:'none', background:`linear-gradient(135deg,${C.teal},${C.green})`, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                    Write Your First Entry
                  </button>
                )}
              </div>
            )}

            {!loading && filtered.length>0 && (
              <>
                <div className="cards-auto" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:14, marginBottom:24 }}>
                  {filtered.map((e,i) => (
                    <div key={e._id} className="jfi" style={{ animationDelay:`${i*.04}s` }}>
                      <EntryCard entry={e}
                        onEdit={() => { setSelected(e); setMode('edit'); }}
                        onDelete={() => handleDelete(e._id)}
                        onView={() => { setSelected(e); setMode('view'); }} />
                    </div>
                  ))}
                </div>
                {pagination && pagination.totalPages>1 && (
                  <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:10 }}>
                    <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1}
                      style={{ padding:'8px 18px', borderRadius:10, border:`1.5px solid ${C.border}`, background:'transparent', color:C.inkMid, fontSize:13, cursor:page===1?'not-allowed':'pointer', fontFamily:'inherit', opacity:page===1?.4:1, transition:'all .15s' }}
                      onMouseEnter={e=>{if(page>1){e.currentTarget.style.borderColor=C.teal;e.currentTarget.style.color=C.teal;}}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.inkMid;}}>
                      ← Previous
                    </button>
                    <span style={{ fontSize:13, color:C.inkMuted, padding:'0 6px' }}>Page {page} of {pagination.totalPages}</span>
                    <button onClick={() => setPage(p=>Math.min(pagination.totalPages,p+1))} disabled={page===pagination.totalPages}
                      style={{ padding:'8px 18px', borderRadius:10, border:`1.5px solid ${C.border}`, background:'transparent', color:C.inkMid, fontSize:13, cursor:page===pagination.totalPages?'not-allowed':'pointer', fontFamily:'inherit', opacity:page===pagination.totalPages?.4:1, transition:'all .15s' }}
                      onMouseEnter={e=>{if(page<pagination.totalPages){e.currentTarget.style.borderColor=C.teal;e.currentTarget.style.color=C.teal;}}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.inkMid;}}>
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}