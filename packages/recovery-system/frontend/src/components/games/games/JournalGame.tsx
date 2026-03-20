'use client';
import React, { useState } from 'react';
import {
  Flame, FileText, Star, Sun, Zap, Target, HelpCircle, Sparkles,
  ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, Check,
  TrendingDown, TrendingUp, Minus, Meh, Smile, Laugh, Frown,
} from 'lucide-react';
import { GameProgress } from '@/types/games.types';

interface Props { progress:GameProgress; onUpdateProgress:(u:Partial<GameProgress>)=>Promise<void>; showToast:(m:string,t?:'success'|'error'|'info')=>void; }

const PROMPTS = [
  { id:'p1', Icon:Sun,       text:'What is one thing you are grateful for today?',            pts:15 },
  { id:'p2', Icon:Zap,       text:'Describe one moment where you stayed strong.',             pts:20 },
  { id:'p3', Icon:Target,    text:'What is your main goal for tomorrow?',                     pts:15 },
  { id:'p4', Icon:HelpCircle,text:'What was the hardest part of today and how did you cope?', pts:25 },
  { id:'p5', Icon:Sparkles,  text:'Write one thing you are proud of about yourself.',          pts:20 },
];

const MOODS = [
  { Icon:Frown,        label:'Struggling', color:'#dc2626', val:1 },
  { Icon:TrendingDown, label:'Low',        color:'#f97316', val:2 },
  { Icon:Minus,        label:'Neutral',    color:'#eab308', val:3 },
  { Icon:Smile,        label:'Good',       color:'#22c55e', val:4 },
  { Icon:Laugh,        label:'Thriving',   color:'#8b5cf6', val:5 },
];

const INSIGHTS = [
  { days:3,  label:'3-Day Journaler',  Icon:Zap     },
  { days:7,  label:'One-Week Wisdom',  Icon:Star    },
  { days:14, label:'Two-Week Streak',  Icon:Sparkles},
  { days:30, label:'Month Dedicated',  Icon:Flame   },
];

const getToday  = () => new Date().toISOString().slice(0,10);
const MIN_WORDS = 5;
const accent    = '#be123c';

export default function JournalGame({ progress, onUpdateProgress, showToast }: Props) {
  const saved         = progress.journalData??({} as any);
  const journalStreak = (saved as any).journalStreak??0;
  const totalEntries  = (saved as any).totalEntries??0;
  const alreadyWrote  = (saved as any).lastEntryDate===getToday();

  const [mood,      setMood]      = useState<number|null>(null);
  const [promptIdx, setPromptIdx] = useState(0);
  const [answers,   setAnswers]   = useState<Record<string,string>>({});
  const [saving,    setSaving]    = useState(false);
  const [submitted, setSubmitted] = useState(alreadyWrote);
  const [earnedPts, setEarnedPts] = useState(0);

  const prompt    = PROMPTS[promptIdx];
  const wordCount = (answers[prompt.id]??'').trim().split(/\s+/).filter(Boolean).length;
  const allDone   = PROMPTS.every(p=>(answers[p.id]??'').trim().split(/\s+/).filter(Boolean).length>=MIN_WORDS);
  const nextMs    = INSIGHTS.find(ins=>journalStreak<ins.days);

  async function submit() {
    if(!mood||!allDone) return;
    setSaving(true);
    try {
      const pts=PROMPTS.reduce((sum,p)=>{
        const wc=(answers[p.id]??'').trim().split(/\s+/).filter(Boolean).length;
        return sum+(wc>=MIN_WORDS?p.pts:0);
      },0)+(mood>=4?10:0);
      const totalWords=Object.values(answers).join(' ').trim().split(/\s+/).filter(Boolean).length;
      await onUpdateProgress({ journalData:{ journalStreak:journalStreak+1,totalEntries:totalEntries+1,lastEntryDate:getToday(),totalWordsWritten:totalWords }, totalPoints:(progress.totalPoints??0)+pts, currentStreak:(progress.currentStreak??0)+1, lastPlayed:new Date().toISOString() } as any);
      setEarnedPts(pts); setSubmitted(true);
      showToast(`Journal saved — +${pts} pts`,'success');
    } catch { showToast('Save failed','error'); }
    finally { setSaving(false); }
  }

  /* ── Done state ── */
  if(submitted) return (
    <div style={{ maxWidth:520,margin:'0 auto',fontFamily:"'DM Sans',system-ui,sans-serif" }}>
      <div style={{ background:'#fff',border:'1px solid #e4ede8',borderTop:`3px solid ${accent}`,borderRadius:20,padding:'48px 36px',textAlign:'center',boxShadow:'0 4px 16px rgba(10,15,13,.06)' }}>
        <div style={{ width:72,height:72,borderRadius:20,background:`${accent}10`,border:`1.5px solid ${accent}22`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px' }}>
          <FileText size={32} strokeWidth={1.5} color={accent}/>
        </div>
        <p style={{ fontFamily:"'DM Serif Display',serif",fontSize:28,color:'#0a0f0d',marginBottom:8 }}>Journal Complete</p>
        {earnedPts>0&&<p style={{ fontSize:16,color:accent,fontWeight:600,marginBottom:16 }}>+{earnedPts} points earned</p>}
        <p style={{ fontSize:14,color:'#7a8f86',lineHeight:1.6,marginBottom:24 }}>
          {totalEntries+1} {totalEntries===0?'entry':'entries'} total &middot; {journalStreak+1}-day streak
        </p>
        {nextMs&&(
          <div style={{ background:'#fff8f9',border:'1px solid #fecdd3',borderRadius:14,padding:'14px 18px',marginBottom:20,textAlign:'left' }}>
            <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8 }}>
              <nextMs.Icon size={15} strokeWidth={2} color={accent}/>
              <p style={{ fontSize:13,fontWeight:600,color:accent }}>Next milestone: {nextMs.label}</p>
            </div>
            <div style={{ height:6,background:'#fecdd3',borderRadius:999,overflow:'hidden' }}>
              <div style={{ height:'100%',width:`${Math.round(((journalStreak+1)/nextMs.days)*100)}%`,background:accent,borderRadius:999 }}/>
            </div>
            <p style={{ fontSize:11,color:'#9f1239',marginTop:6 }}>{journalStreak+1} / {nextMs.days} days</p>
          </div>
        )}
        <p style={{ fontSize:13,color:'#7a8f86',fontStyle:'italic' }}>Come back tomorrow for your next entry</p>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth:580,margin:'0 auto',fontFamily:"'DM Sans',system-ui,sans-serif" }}>

      {/* Stats */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:14 }}>
        {[
          { Icon:Flame,    value:journalStreak,         label:'Day Streak'    },
          { Icon:FileText, value:totalEntries,           label:'Total Entries' },
          { Icon:Star,     value:progress.totalPoints??0, label:'Points'      },
        ].map((s,i)=>(
          <div key={i} style={{ background:'#fff',border:'1px solid #e4ede8',borderRadius:16,padding:'16px 12px',textAlign:'center',boxShadow:'0 1px 4px rgba(10,15,13,.04)' }}>
            <div style={{ display:'flex',justifyContent:'center',marginBottom:8 }}>
              <s.Icon size={20} strokeWidth={1.8} color={accent}/>
            </div>
            <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,color:'#0a0f0d',marginBottom:2 }}>{s.value}</div>
            <div style={{ fontSize:11,color:'#7a8f86',fontWeight:500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Mood selector */}
      <div style={{ background:'#fff',border:'1px solid #e4ede8',borderTop:`3px solid ${accent}`,borderRadius:20,padding:'22px 24px',marginBottom:14,boxShadow:'0 4px 16px rgba(10,15,13,.06)' }}>
        <p style={{ fontFamily:"'DM Serif Display',serif",fontSize:18,color:'#0a0f0d',marginBottom:14 }}>How are you feeling?</p>
        <div style={{ display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap' }}>
          {MOODS.map(m=>(
            <button key={m.val} onClick={()=>setMood(m.val)}
              style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:7,padding:'12px 14px',borderRadius:14,border:`2px solid ${mood===m.val?m.color:'#e4ede8'}`,background:mood===m.val?`${m.color}10`:'#fafafa',cursor:'pointer',transition:'all .2s',minWidth:72 }}>
              <m.Icon size={26} strokeWidth={1.8} color={mood===m.val?m.color:'#9ca3af'}/>
              <span style={{ fontSize:10,fontWeight:600,color:mood===m.val?m.color:'#7a8f86' }}>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Journal prompts */}
      <div style={{ background:'#fff',border:'1px solid #e4ede8',borderRadius:20,padding:'22px 24px',marginBottom:14,boxShadow:'0 1px 4px rgba(10,15,13,.04)' }}>
        {/* Progress dots */}
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
          <p style={{ fontFamily:"'DM Serif Display',serif",fontSize:18,color:'#0a0f0d' }}>
            Prompt {promptIdx+1} of {PROMPTS.length}
          </p>
          <div style={{ display:'flex',gap:6 }}>
            {PROMPTS.map((p,i)=>{
              const wc=(answers[p.id]??'').trim().split(/\s+/).filter(Boolean).length;
              return (
                <button key={p.id} onClick={()=>setPromptIdx(i)}
                  style={{ width:28,height:28,borderRadius:'50%',border:`2px solid ${wc>=MIN_WORDS?accent:i===promptIdx?'#fca5a5':'#e4ede8'}`,background:wc>=MIN_WORDS?accent:i===promptIdx?'#fff8f9':'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
                  {wc>=MIN_WORDS
                    ? <Check size={13} strokeWidth={3} color="#fff"/>
                    : <span style={{ fontSize:10,fontWeight:700,color:i===promptIdx?accent:'#9ca3af' }}>{i+1}</span>
                  }
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompt card */}
        <div style={{ background:'#fff8f9',border:'1px solid #fecdd3',borderRadius:12,padding:'16px 18px',marginBottom:14,display:'flex',alignItems:'flex-start',gap:12 }}>
          <prompt.Icon size={18} strokeWidth={2} color={accent} style={{ flexShrink:0,marginTop:2 }}/>
          <p style={{ fontFamily:"Georgia,serif",fontSize:15,color:'#7f1d1d',lineHeight:1.6,fontStyle:'italic' }}>"{prompt.text}"</p>
        </div>

        {/* Textarea */}
        <textarea value={answers[prompt.id]??''} onChange={e=>setAnswers({...answers,[prompt.id]:e.target.value})}
          placeholder="Write your thoughts here… (at least 5 words)"
          rows={4}
          style={{ width:'100%',padding:'14px 16px',borderRadius:12,border:`1.5px solid ${wordCount>=MIN_WORDS?accent:'#e4ede8'}`,fontSize:14,fontFamily:"Georgia,serif",lineHeight:1.7,color:'#0a0f0d',background:'#fff',resize:'vertical',boxSizing:'border-box',outline:'none',transition:'border .2s' }}/>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8 }}>
          <span style={{ fontSize:12,color:wordCount>=MIN_WORDS?accent:'#9ca3af' }}>
            {wordCount} word{wordCount!==1?'s':''} {wordCount>=MIN_WORDS?'— good to go':`(${MIN_WORDS-wordCount} more needed)`}
          </span>
          <span style={{ fontSize:12,color:accent,fontWeight:600 }}>+{prompt.pts} pts</span>
        </div>

        {/* Nav buttons */}
        <div style={{ display:'flex',gap:10,marginTop:14 }}>
          {promptIdx>0&&(
            <button onClick={()=>setPromptIdx(promptIdx-1)}
              style={{ flex:1,padding:'10px',borderRadius:10,border:'1.5px solid #e4ede8',background:'#fff',color:'#7a8f86',fontSize:13,fontWeight:500,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>
              <ChevronLeft size={15} strokeWidth={2}/> Previous
            </button>
          )}
          {promptIdx<PROMPTS.length-1&&(
            <button onClick={()=>setPromptIdx(promptIdx+1)} disabled={wordCount<MIN_WORDS}
              style={{ flex:1,padding:'10px',borderRadius:10,border:'none',background:wordCount>=MIN_WORDS?'#0a0f0d':'#f0f4f2',color:wordCount>=MIN_WORDS?'#fff':'#9ca3af',fontSize:13,fontWeight:600,cursor:wordCount>=MIN_WORDS?'pointer':'not-allowed',fontFamily:"'DM Sans',sans-serif",display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>
              Next <ChevronRight size={15} strokeWidth={2}/>
            </button>
          )}
        </div>
      </div>

      {/* Submit */}
      <div style={{ background:'#fff',border:'1px solid #e4ede8',borderRadius:20,padding:'20px 22px',boxShadow:'0 1px 4px rgba(10,15,13,.04)' }}>
        <div style={{ display:'flex',justifyContent:'space-between',fontSize:12,color:'#7a8f86',marginBottom:14 }}>
          <span>{PROMPTS.filter(p=>(answers[p.id]??'').trim().split(/\s+/).filter(Boolean).length>=MIN_WORDS).length}/{PROMPTS.length} prompts answered</span>
          <span>Up to {PROMPTS.reduce((s,p)=>s+p.pts,0)+(mood&&mood>=4?10:0)} pts available</span>
        </div>
        <button onClick={submit} disabled={!allDone||!mood||saving}
          style={{ width:'100%',padding:15,borderRadius:14,border:'none',fontSize:15,fontWeight:600,cursor:allDone&&mood&&!saving?'pointer':'not-allowed',background:allDone&&mood?'#0a0f0d':'#f0f4f2',color:allDone&&mood?'#fff':'#9ca3af',fontFamily:"'DM Sans',sans-serif",transition:'all .2s',opacity:saving?.7:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
          {saving
            ? 'Saving…'
            : allDone&&mood
              ? <><FileText size={15} strokeWidth={2}/> Submit Today's Journal</>
              : 'Complete all prompts first'
          }
        </button>
        {(!allDone||!mood)&&(
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:6,marginTop:8 }}>
            <AlertCircle size={13} strokeWidth={2} color={accent}/>
            <p style={{ fontSize:12,color:accent }}>
              {!mood?'Select your mood first':'Answer all prompts with 5+ words'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
