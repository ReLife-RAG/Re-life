'use client';
import React, { useState } from 'react';
import { Smartphone, Moon, AlertCircle, BookOpen, TrendingUp, Check, X, Gauge, CheckCircle2, RotateCcw, MessageSquare, Gamepad2, Brain } from 'lucide-react';
import { GameProgress } from '@/types/games.types';

interface Props { progress:GameProgress; onUpdateProgress:(u:Partial<GameProgress>)=>Promise<void>; showToast:(m:string,t?:'success'|'error'|'info')=>void; }

interface Scenario { id:string; situation:string; Icon:React.FC<any>; options:{text:string;pts:number;feedback:string;strong:boolean}[]; }

const SCENARIOS: Scenario[] = [
  { id:'s1', Icon:Smartphone, situation:'You feel a strong urge to open social media…',
    options:[{ text:'Open Instagram',pts:-10,feedback:'That fed the urge. Try to resist next time.',strong:false },{ text:'Go for a 10-minute walk',pts:+15,feedback:'Great choice. Movement beats cravings every time.',strong:true },{ text:'Call a trusted friend',pts:+20,feedback:'Excellent. Connecting with people builds real strength.',strong:true }] },
  { id:'s2', Icon:AlertCircle, situation:'You feel stressed and anxious right now…',
    options:[{ text:'Watch videos for hours',pts:-5,feedback:"Numbing the feeling doesn't resolve it.",strong:false },{ text:'Do a 5-minute breathing exercise',pts:+15,feedback:'Smart. Breathing resets your nervous system.',strong:true },{ text:'Write how you feel',pts:+10,feedback:'Journaling helps you understand your emotions.',strong:true }] },
  { id:'s3', Icon:Moon, situation:"It's late at night and you can't sleep…",
    options:[{ text:'Scroll your phone',pts:-15,feedback:'Blue light makes sleep harder. Put the phone down.',strong:false },{ text:'Read a physical book',pts:+10,feedback:'Reading helps your brain wind down naturally.',strong:true },{ text:'Try a sleep meditation',pts:+20,feedback:'Meditation is proven to improve sleep quality.',strong:true }] },
  { id:'s4', Icon:MessageSquare, situation:'Someone upset you and you feel like reacting…',
    options:[{ text:'Respond angrily right now',pts:-10,feedback:'Acting in anger almost always makes things worse.',strong:false },{ text:'Take 10 deep breaths first',pts:+15,feedback:"Pausing before reacting — that's real strength.",strong:true },{ text:'Talk it out calmly later',pts:+25,feedback:'You controlled your emotions perfectly.',strong:true }] },
  { id:'s5', Icon:Gamepad2, situation:'You planned to work but friends want you to skip…',
    options:[{ text:'Skip your plan entirely',pts:-10,feedback:'Giving up goals damages your confidence over time.',strong:false },{ text:'Work first, then join them',pts:+20,feedback:'Balance. You kept your commitment and had fun.',strong:true },{ text:'Stick to your full plan',pts:+15,feedback:'Discipline. Your future self will thank you.',strong:true }] },
];

const getToday = () => new Date().toISOString().slice(0,10);
const accent   = '#c2410c';

export default function BraverGame({ progress, onUpdateProgress, showToast }: Props) {
  const b = progress.braverData;
  const [daysStrong, setDaysStrong] = useState(b?.daysStrong??0);
  const [checkedIn,  setCheckedIn]  = useState(b?.lastCheckinDate===getToday());
  const [ciLoading,  setCiLoading]  = useState(false);
  const [score,      setScore]      = useState(0);
  const [idx,        setIdx]        = useState(0);
  const [feedback,   setFeedback]   = useState<{text:string;pts:number;strong:boolean}|null>(null);
  const [gameOver,   setGameOver]   = useState(false);
  const [willpower,  setWillpower]  = useState(100);

  const scenario   = SCENARIOS[idx%SCENARIOS.length];
  const ScenIcon   = scenario.Icon;
  const wpColor    = willpower>60?'#1a7a4a':willpower>30?'#b45309':'#dc2626';

  function choose(opt:Scenario['options'][0]) {
    const nw=Math.min(100,Math.max(0,willpower+opt.pts));
    setWillpower(nw); setScore(s=>s+Math.max(0,opt.pts));
    setFeedback({ text:opt.feedback,pts:opt.pts,strong:opt.strong });
    setTimeout(()=>{ setFeedback(null); if(idx+1>=SCENARIOS.length) setGameOver(true); else setIdx(idx+1); },1800);
  }

  async function handleCheckIn() {
    if(checkedIn||ciLoading) return;
    setCiLoading(true);
    try {
      const nd=daysStrong+1;
      await onUpdateProgress({ braverData:{...b,daysStrong:nd,checkedInToday:true,lastCheckinDate:getToday(),challengesCompleted:b?.challengesCompleted??0,challengesDoneToday:[],lastChallengeReset:getToday(),badges:b?.badges??[]}, totalPoints:(progress.totalPoints??0)+15, currentStreak:(progress.currentStreak??0)+1, lastPlayed:new Date().toISOString() });
      setDaysStrong(nd); setCheckedIn(true);
      showToast(`Day ${nd} — +15 pts`,'success');
    } catch(e:any) { showToast(e?.message??'Check-in failed','error'); }
    finally { setCiLoading(false); }
  }

  function restart() { setIdx(0); setScore(0); setWillpower(100); setGameOver(false); setFeedback(null); }

  return (
    <div style={{ maxWidth:560,margin:'0 auto',fontFamily:"'DM Sans',system-ui,sans-serif" }}>

      {/* Header */}
      <div style={{ background:'#fff',border:'1px solid #e4ede8',borderTop:`3px solid ${accent}`,borderRadius:20,padding:'24px 28px',marginBottom:14,boxShadow:'0 4px 16px rgba(10,15,13,.06)' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',gap:16 }}>
          <div>
            <p style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:'#0a0f0d',marginBottom:4 }}>Mental Strength</p>
            <p style={{ fontSize:13,color:'#7a8f86' }}>Make strong decisions. Build willpower.</p>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:44,color:accent,lineHeight:1 }}>{daysStrong}</div>
            <div style={{ fontSize:11,color:'#7a8f86',marginTop:2 }}>days strong</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,margin:'20px 0' }}>
          <div style={{ background:'#f7faf8',borderRadius:12,padding:'12px 14px',border:'1px solid #e4ede8' }}>
            <div style={{ display:'flex',justifyContent:'space-between',fontSize:12,fontWeight:500,marginBottom:8 }}>
              <div style={{ display:'flex',alignItems:'center',gap:5,color:'#7a8f86' }}><Gauge size={13} strokeWidth={2}/> Willpower</div>
              <span style={{ color:wpColor,fontWeight:700 }}>{willpower}%</span>
            </div>
            <div style={{ height:6,background:'#e4ede8',borderRadius:999,overflow:'hidden' }}>
              <div style={{ height:'100%',width:`${willpower}%`,background:wpColor,borderRadius:999,transition:'width .5s' }}/>
            </div>
          </div>
          <div style={{ background:'#f7faf8',borderRadius:12,padding:'12px 14px',border:'1px solid #e4ede8',display:'flex',flexDirection:'column',justifyContent:'center' }}>
            <div style={{ display:'flex',alignItems:'center',gap:5,fontSize:12,color:'#7a8f86',marginBottom:4 }}><TrendingUp size={13} strokeWidth={2}/> Session Score</div>
            <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:28,color:'#0a0f0d' }}>{score}<span style={{ fontSize:14,color:'#7a8f86',fontWeight:400 }}> pts</span></div>
          </div>
        </div>

        <button onClick={handleCheckIn} disabled={checkedIn||ciLoading}
          style={{ width:'100%',padding:'12px',borderRadius:12,border:`1.5px solid ${checkedIn?'#1a7a4a40':'#0a0f0d'}`,background:checkedIn?'#f0fbf5':'#0a0f0d',color:checkedIn?'#1a7a4a':'#fff',fontSize:13.5,fontWeight:600,cursor:checkedIn?'default':'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all .2s',display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
          {checkedIn
            ? <><CheckCircle2 size={15} strokeWidth={2}/> Checked in today</>
            : ciLoading ? 'Saving…'
            : <><Check size={15} strokeWidth={2.5}/> Daily Check-in &nbsp;+15 pts</>
          }
        </button>
      </div>

      {/* Game over */}
      {gameOver?(
        <div style={{ background:'#fff',border:'1px solid #e4ede8',borderRadius:20,padding:'48px 36px',textAlign:'center',boxShadow:'0 4px 16px rgba(10,15,13,.06)' }}>
          <div style={{ width:72,height:72,borderRadius:20,background:score>=60?'#e8f7ee':score>=30?'#fef9e7':'#f7faf8',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',border:`1.5px solid ${score>=60?'#b0dfc4':score>=30?'#f0d878':'#e4ede8'}` }}>
            <TrendingUp size={32} strokeWidth={1.5} color={score>=60?'#1a7a4a':score>=30?'#b45309':'#7a8f86'}/>
          </div>
          <p style={{ fontFamily:"'DM Serif Display',serif",fontSize:28,color:'#0a0f0d',marginBottom:8 }}>
            {score>=60?'Champion Performance':score>=30?'Strong Effort':'Keep Practising'}
          </p>
          <p style={{ fontSize:16,color:'#7a8f86',marginBottom:8 }}>Final score: <strong style={{ color:accent }}>{score} pts</strong></p>
          <p style={{ fontSize:14,color:'#7a8f86',marginBottom:32 }}>Willpower remaining: <strong style={{ color:wpColor }}>{willpower}%</strong></p>
          <button onClick={restart}
            style={{ padding:'13px 36px',borderRadius:14,border:'none',background:'#0a0f0d',color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",display:'inline-flex',alignItems:'center',gap:8 }}>
            <RotateCcw size={15} strokeWidth={2}/> Train Again
          </button>
        </div>
      ):(
        /* Scenario */
        <div style={{ background:'#fff',border:'1px solid #e4ede8',borderRadius:20,padding:'28px',boxShadow:'0 4px 16px rgba(10,15,13,.06)' }}>
          {/* Progress dots */}
          <div style={{ display:'flex',justifyContent:'center',gap:8,marginBottom:28 }}>
            {SCENARIOS.map((_,i)=>(
              <div key={i} style={{ width:10,height:10,borderRadius:'50%',background:i<idx?accent:i===idx?`${accent}60`:'#e4ede8',transition:'all .3s' }}/>
            ))}
          </div>

          {/* Situation */}
          <div style={{ textAlign:'center',marginBottom:32 }}>
            <div style={{ width:64,height:64,borderRadius:18,background:`${accent}10`,border:`1.5px solid ${accent}22`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px' }}>
              <ScenIcon size={28} strokeWidth={1.5} color={accent}/>
            </div>
            <p style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,color:'#0a0f0d',lineHeight:1.5 }}>{scenario.situation}</p>
            <p style={{ fontSize:12,color:'#7a8f86',marginTop:8 }}>Challenge {idx+1} of {SCENARIOS.length}</p>
          </div>

          {/* Feedback or options */}
          {feedback?(
            <div style={{ padding:'24px',borderRadius:16,textAlign:'center',background:feedback.strong?'#f0fbf5':'#fef2f2',border:`1.5px solid ${feedback.strong?'#b0dfc4':'#fca5a5'}` }}>
              <div style={{ display:'flex',justifyContent:'center',marginBottom:12 }}>
                {feedback.strong
                  ? <CheckCircle2 size={44} strokeWidth={1.5} color="#1a7a4a"/>
                  : <X size={44} strokeWidth={1.5} color="#dc2626"/>
                }
              </div>
              <p style={{ fontSize:16,fontWeight:700,color:feedback.strong?'#1a7a4a':'#dc2626',marginBottom:8 }}>
                {feedback.pts>0?`+${feedback.pts} pts`:`${feedback.pts} pts`}
              </p>
              <p style={{ fontSize:14,color:feedback.strong?'#3d4f47':'#7a8f86' }}>{feedback.text}</p>
            </div>
          ):(
            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              {scenario.options.map((opt,i)=>(
                <button key={i} onClick={()=>choose(opt)}
                  style={{ padding:'16px 20px',borderRadius:14,border:`1.5px solid ${opt.strong?'#b0dfc4':'#fca5a5'}`,background:opt.strong?'#f0fbf5':'#fef2f2',color:'#0a0f0d',fontSize:14,fontWeight:500,cursor:'pointer',textAlign:'left',transition:'all .2s',fontFamily:"'DM Sans',sans-serif" }}
                  onMouseEnter={e=>{ e.currentTarget.style.transform='translateX(4px)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(10,15,13,.08)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
                  {opt.text}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
