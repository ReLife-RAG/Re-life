'use client';
import React, { useState, useEffect } from 'react';

interface Props {
  onClose:()=>void;
  onCheckIn:(mood:number,games?:string[])=>Promise<void>;
  showToast:(msg:string,type?:'success'|'error'|'info')=>void;
  daysSober?:number; moneySaved?:number; treesGrown?:number; xpEarned?:number;
}

const MOODS=[{e:'😢',v:1},{e:'😔',v:2},{e:'😐',v:3},{e:'😊',v:4},{e:'😄',v:5}];

export default function CheckInModal({ onClose, onCheckIn, showToast, daysSober=0, moneySaved=0, treesGrown=0, xpEarned=0 }: Props) {
  const [sel, setSel]   = useState<number|null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{ if(e.key==='Escape') onClose(); };
    document.addEventListener('keydown',h);
    return ()=>document.removeEventListener('keydown',h);
  },[onClose]);

  async function submit() {
    if(!sel){ showToast('Please select your mood first!','error'); return; }
    setBusy(true);
    try { await onCheckIn(sel); }
    catch { showToast('Check-in failed. Try again.','error'); }
    finally { setBusy(false); }
  }

  return (
    <div onClick={(e)=>{ if(e.target===e.currentTarget) onClose(); }}
      style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.35)',zIndex:600,display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div style={{ background:'#fff',borderRadius:'18px',padding:'26px',width:'400px',maxWidth:'92vw',boxShadow:'0 20px 60px rgba(0,0,0,.18)' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px' }}>
          <h2 style={{ fontSize:'17px',fontWeight:700,color:'#1a2e26',margin:0 }}>📅 Daily Check-in</h2>
          <button onClick={onClose} style={{ background:'transparent',border:'none',fontSize:'21px',cursor:'pointer',color:'#7a8f86',lineHeight:1,padding:'2px 6px',borderRadius:'6px' }}>×</button>
        </div>

        <div style={{ textAlign:'center',marginBottom:'14px' }}>
          <div style={{ fontSize:'60px',fontWeight:800,color:'#5bbf7a',lineHeight:1 }}>{daysSober}</div>
          <div style={{ fontSize:'12.5px',color:'#7a8f86',marginTop:'3px' }}>Day Streak 🔥</div>
        </div>

        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'9px',marginBottom:'14px' }}>
          {[{icon:'💲',val:`$${moneySaved}`,label:'Money Saved'},{icon:'⏰',val:`${daysSober*24}h`,label:'Hours Sober'},{icon:'🌿',val:treesGrown,label:'Trees Grown'},{icon:'⭐',val:xpEarned,label:'XP Earned'}].map(s=>(
            <div key={s.label} style={{ background:'#f4f6f5',borderRadius:'11px',padding:'13px',textAlign:'center' }}>
              <div style={{ fontSize:'19px',fontWeight:700 }}>{s.icon} {s.val}</div>
              <div style={{ fontSize:'10.5px',color:'#7a8f86',marginTop:'3px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom:'14px' }}>
          <div style={{ fontSize:'12.5px',fontWeight:600,color:'#1a2e26',marginBottom:'9px' }}>How are you feeling today?</div>
          <div style={{ display:'flex',gap:'7px',justifyContent:'center' }}>
            {MOODS.map(m=>(
              <button key={m.v} onClick={()=>setSel(m.v)}
                style={{ fontSize:'25px',cursor:'pointer',padding:'7px',borderRadius:'9px',border:`2px solid ${sel===m.v?'#5bbf7a':'transparent'}`,background:sel===m.v?'#e8f7ee':'transparent',transition:'all .15s' }}>
                {m.e}
              </button>
            ))}
          </div>
        </div>

        <button onClick={submit} disabled={busy||!sel}
          style={{ width:'100%',background:'#6dcb88',color:'#fff',border:'none',borderRadius:'11px',padding:'12px',fontSize:'14px',fontWeight:700,cursor:busy||!sel?'not-allowed':'pointer',opacity:busy||!sel?.6:1,transition:'background .15s' }}
          onMouseEnter={e=>{ if(!busy&&sel) e.currentTarget.style.background='#52b56e'; }}
          onMouseLeave={e=>e.currentTarget.style.background='#6dcb88'}>
          {busy?'Checking in…':"✅ Complete Today's Check-in"}
        </button>
      </div>
    </div>
  );
}