'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Coins, Trees, AlertTriangle, RefreshCw, Play, XCircle, CheckCircle } from 'lucide-react';
import { GameProgress } from '@/types/games.types';

interface Props { progress:GameProgress; onUpdateProgress:(u:Partial<GameProgress>)=>Promise<void>; showToast:(m:string,t?:'success'|'error'|'info')=>void; }

const TOTAL   = 25*60;
const accent  = '#92400e';
type View     = 'idle'|'running'|'done'|'dead';

// Stage progress shown as filled segments instead of tree emojis
const STAGE_LABELS = ['Seed','Sprout','Sapling','Tree'];

export default function ForestGame({ progress, onUpdateProgress, showToast }: Props) {
  const f = progress.forestData;
  const [coins, setCoins] = useState(f?.coins??0);
  const [trees, setTrees] = useState(f?.treesPlanted??0);
  const [secs,  setSecs]  = useState(TOTAL);
  const [view,  setView]  = useState<View>('idle');

  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const coinsRef = useRef(coins);
  const progRef  = useRef(progress);
  useEffect(()=>{ coinsRef.current=coins; },[coins]);
  useEffect(()=>{ progRef.current=progress; },[progress]);
  useEffect(()=>()=>{ if(timerRef.current) clearInterval(timerRef.current); },[]);

  const elapsed = TOTAL-secs;
  const pct     = elapsed/TOTAL;
  const stageIdx= Math.min(3,Math.floor(pct*4));
  const mm      = String(Math.floor(secs/60)).padStart(2,'0');
  const ss      = String(secs%60).padStart(2,'0');

  // SVG ring
  const R=68, C=2*Math.PI*R;

  function startTimer() {
    setSecs(TOTAL); setView('running');
    timerRef.current = setInterval(()=>{
      setSecs(prev=>{
        if(prev<=1){
          clearInterval(timerRef.current!); timerRef.current=null;
          const nc=coinsRef.current+10, nt=Math.floor(nc/10);
          setCoins(nc); setTrees(nt); setView('done');
          const p=progRef.current;
          onUpdateProgress({ forestData:{coins:nc,treesPlanted:nt,totalFocusTime:(p.forestData?.totalFocusTime??0)+25}, totalPoints:(p.totalPoints??0)+20, currentStreak:(p.currentStreak??0)+1, lastPlayed:new Date().toISOString() }).catch(()=>{});
          return 0;
        }
        return prev-1;
      });
    },1000);
  }

  function cancelTimer() {
    if(timerRef.current){ clearInterval(timerRef.current); timerRef.current=null; }
    setSecs(TOTAL); setView('dead');
    showToast('Session abandoned — try again','error');
  }

  /* ── Done ── */
  if(view==='done') return (
    <div style={{ maxWidth:480,margin:'0 auto',fontFamily:"'DM Sans',system-ui,sans-serif" }}>
      <div style={{ background:'#fff',border:'1px solid #e4ede8',borderTop:`3px solid ${accent}`,borderRadius:20,padding:'48px 36px',textAlign:'center',boxShadow:'0 4px 16px rgba(10,15,13,.06)' }}>
        <div style={{ width:72,height:72,borderRadius:20,background:`${accent}12`,border:`1.5px solid ${accent}30`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px' }}>
          <CheckCircle size={36} strokeWidth={1.5} color={accent}/>
        </div>
        <p style={{ fontFamily:"'DM Serif Display',serif",fontSize:28,color:'#0a0f0d',marginBottom:8 }}>Session Complete</p>
        <p style={{ fontSize:15,color:'#7a8f86',marginBottom:32 }}>Full 25 minutes of focus achieved.</p>
        <div style={{ display:'flex',justifyContent:'center',gap:12,marginBottom:32 }}>
          {[
            { Icon:Trees,   label:'+1 Tree',    color:accent   },
            { Icon:Coins,   label:'+10 Coins',  color:'#78350f'},
          ].map(item=>(
            <div key={item.label} style={{ background:'#f7faf8',border:'1px solid #e4ede8',borderRadius:14,padding:'16px 20px',textAlign:'center' }}>
              <div style={{ display:'flex',justifyContent:'center',marginBottom:8 }}>
                <item.Icon size={26} strokeWidth={1.8} color={item.color}/>
              </div>
              <div style={{ fontSize:13,fontWeight:600,color:item.color }}>{item.label}</div>
            </div>
          ))}
          <div style={{ background:'#f7faf8',border:'1px solid #e4ede8',borderRadius:14,padding:'16px 20px',textAlign:'center' }}>
            <p style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:'#b45309',marginBottom:4 }}>+20</p>
            <p style={{ fontSize:13,fontWeight:600,color:'#b45309' }}>pts</p>
          </div>
        </div>
        <button onClick={()=>{setView('idle');setSecs(TOTAL);}}
          style={{ width:'100%',padding:14,borderRadius:14,border:'none',background:'#0a0f0d',color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
          <RefreshCw size={15} strokeWidth={2}/> Plant Another Tree
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth:520,margin:'0 auto',fontFamily:"'DM Sans',system-ui,sans-serif" }}>
      <div style={{ background:'#fff',border:'1px solid #e4ede8',borderTop:`3px solid ${accent}`,borderRadius:20,padding:'28px 32px',marginBottom:14,boxShadow:'0 4px 16px rgba(10,15,13,.06)' }}>

        {/* Header row */}
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:28 }}>
          <div>
            <p style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:'#0a0f0d',marginBottom:4 }}>Focus Timer</p>
            <p style={{ fontSize:13,color:'#7a8f86' }}>Stay present — grow your forest</p>
          </div>
          <div style={{ display:'flex',gap:20 }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:4,marginBottom:2 }}>
                <Coins size={14} strokeWidth={2} color={accent}/>
                <span style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,color:accent }}>{coins}</span>
              </div>
              <p style={{ fontSize:11,color:'#7a8f86' }}>coins</p>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:4,marginBottom:2 }}>
                <Trees size={14} strokeWidth={2} color={accent}/>
                <span style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,color:accent }}>{trees}</span>
              </div>
              <p style={{ fontSize:11,color:'#7a8f86' }}>trees</p>
            </div>
          </div>
        </div>

        {/* Timer ring */}
        <div style={{ position:'relative',width:200,height:200,margin:'0 auto 24px' }}>
          <svg viewBox="0 0 200 200" style={{ position:'absolute',inset:0,width:200,height:200,transform:'rotate(-90deg)' }}>
            <circle cx={100} cy={100} r={R} fill="none" stroke="#f0f4f2" strokeWidth={10}/>
            <circle cx={100} cy={100} r={R} fill="none" stroke={view==='dead'?'#dc2626':accent} strokeWidth={10}
              strokeDasharray={C} strokeDashoffset={C*(1-pct)} strokeLinecap="round"
              style={{ transition:'stroke-dashoffset 1s linear' }}/>
          </svg>
          <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center' }}>
            {/* Icon in centre */}
            <div style={{ marginBottom:8,opacity:view==='dead'?.4:1 }}>
              <Trees size={32} strokeWidth={1.5} color={view==='dead'?'#dc2626':accent}/>
            </div>
            <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:38,color:view==='dead'?'#dc2626':'#0a0f0d',letterSpacing:-1,lineHeight:1 }}>{mm}:{ss}</div>
            <div style={{ fontSize:11,color:'#7a8f86',marginTop:4,letterSpacing:'.04em',textTransform:'uppercase' }}>
              {view==='running'?'focus session':view==='dead'?'abandoned':'minutes'}
            </div>
          </div>
        </div>

        {/* Growth stage indicator */}
        {view==='running'&&(
          <div style={{ marginBottom:20 }}>
            <div style={{ display:'flex',gap:6,marginBottom:6 }}>
              {STAGE_LABELS.map((label,i)=>(
                <div key={i} style={{ flex:1,height:4,background:i<=stageIdx?accent:'#e4ede8',borderRadius:999,transition:'background .5s' }}/>
              ))}
            </div>
            <p style={{ fontSize:12,color:'#7a8f86',textAlign:'center' }}>
              Stage {stageIdx+1} of 4 — {STAGE_LABELS[stageIdx]}
            </p>
          </div>
        )}

        {/* Warning */}
        {view==='running'&&(
          <div style={{ background:'#fef9e7',border:'1px solid #f0d060',borderRadius:10,padding:'10px 14px',marginBottom:20,fontSize:12.5,color:'#92400e',fontWeight:500,display:'flex',alignItems:'center',gap:8 }}>
            <AlertTriangle size={15} strokeWidth={2}/> Leaving will end your session
          </div>
        )}

        {/* CTA */}
        {view!=='running'
          ? <button onClick={startTimer}
              style={{ width:'100%',padding:15,borderRadius:14,border:'none',background:'#0a0f0d',color:'#fff',fontSize:15,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",boxShadow:'0 4px 16px rgba(10,15,13,.2)',display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}
              onMouseEnter={e=>{ e.currentTarget.style.background='#1a2e26'; e.currentTarget.style.transform='translateY(-1px)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.background='#0a0f0d'; e.currentTarget.style.transform='none'; }}>
              <Play size={15} fill="#fff" strokeWidth={0}/> {view==='dead'?'Try Again':'Start 25-minute Session'}
            </button>
          : <button onClick={cancelTimer}
              style={{ width:'100%',padding:14,borderRadius:14,background:'#fef2f2',border:'1.5px solid #fca5a5',color:'#dc2626',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}
              onMouseEnter={e=>e.currentTarget.style.background='#fee2e2'}
              onMouseLeave={e=>e.currentTarget.style.background='#fef2f2'}>
              <XCircle size={15} strokeWidth={2}/> Give Up
            </button>
        }
      </div>

      {/* Forest display */}
      <div style={{ background:'#fff',border:'1px solid #e4ede8',borderRadius:18,padding:'20px 22px',boxShadow:'0 1px 4px rgba(10,15,13,.04)' }}>
        <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:14 }}>
          <Trees size={18} strokeWidth={1.8} color={accent}/>
          <p style={{ fontFamily:"'DM Serif Display',serif",fontSize:18,color:'#0a0f0d' }}>My Forest — {trees} {trees===1?'tree':'trees'}</p>
        </div>
        {trees===0
          ? <p style={{ textAlign:'center',padding:'24px 0',color:'#7a8f86',fontSize:13 }}>Complete a session to grow your first tree</p>
          : (
            <div style={{ display:'grid',gridTemplateColumns:'repeat(8,1fr)',gap:10,padding:'8px' }}>
              {Array.from({length:trees},(_,i)=>(
                <div key={i} style={{ display:'flex',justifyContent:'center' }}>
                  <Trees size={20} strokeWidth={1.5} color={accent}/>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
}
