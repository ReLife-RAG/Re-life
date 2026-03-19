'use client';
import React, { useEffect } from 'react';

interface Props { points:string; onClose:()=>void; }

export default function PrivacyModal({ points, onClose }: Props) {
  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{ if(e.key==='Escape') onClose(); };
    document.addEventListener('keydown',h);
    return ()=>document.removeEventListener('keydown',h);
  },[onClose]);

  return (
    <div onClick={(e)=>{ if(e.target===e.currentTarget) onClose(); }}
      style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.35)',zIndex:600,display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div style={{ background:'#fff',borderRadius:'18px',padding:'26px',width:'400px',maxWidth:'92vw',boxShadow:'0 20px 60px rgba(0,0,0,.18)' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px' }}>
          <h2 style={{ fontSize:'17px',fontWeight:700,color:'#1a2e26',margin:0 }}>🔒 Private Profile</h2>
          <button onClick={onClose} style={{ background:'transparent',border:'none',fontSize:'21px',cursor:'pointer',color:'#7a8f86',lineHeight:1,padding:'2px 6px',borderRadius:'6px' }}>×</button>
        </div>
        <div style={{ textAlign:'center',padding:'8px 0 2px' }}>
          <div style={{ fontSize:'48px',marginBottom:'12px' }}>🧗</div>
          <h3 style={{ fontSize:'16px',fontWeight:700,color:'#1a2e26',marginBottom:'7px',margin:'0 0 7px' }}>This profile is anonymous</h3>
          <p style={{ fontSize:'13px',color:'#7a8f86',lineHeight:1.65,marginBottom:'14px' }}>
            To protect the privacy and safety of our community members, individual profiles are kept anonymous. Recovery is a personal journey — we respect everyone's right to privacy.
          </p>
          <div style={{ display:'inline-flex',alignItems:'center',gap:'5px',background:'#f4f6f5',border:'1px solid #e2ebe6',borderRadius:'20px',padding:'5px 13px',fontSize:'11.5px',fontWeight:600,color:'#7a8f86',marginBottom:'16px' }}>
            🔒 Anonymous user — {points} pts
          </div>
          <button onClick={onClose} style={{ display:'block',width:'100%',background:'#6dcb88',color:'#fff',border:'none',borderRadius:'11px',padding:'11px',fontSize:'13.5px',fontWeight:700,cursor:'pointer',transition:'background .15s' }}
            onMouseEnter={e=>(e.currentTarget.style.background='#52b56e')} onMouseLeave={e=>(e.currentTarget.style.background='#6dcb88')}>
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}