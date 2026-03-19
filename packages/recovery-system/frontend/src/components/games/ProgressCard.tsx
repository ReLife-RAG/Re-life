'use client';
import React, { useMemo } from 'react';

interface Props {
  totalPoints: number; currentStreak: number;
  onCheckIn: () => void;
  showToast: (msg: string, type?: 'success'|'error'|'info') => void;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS  = ['rgba(255,255,255,.09)','#1a4a2c','#256b3e','#33a05e','#6dcb88'];

function buildGrid() {
  const cells: { level:number; label:string }[] = [];
  const today = new Date();
  for (let i = 111; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const r = Math.random();
    const lv = r>.65 ? (r>.85 ? (r>.93 ? 4:3):2) : (r>.38?1:0);
    cells.push({ level:lv, label:`${MONTHS[d.getMonth()]} ${d.getDate()}` });
  }
  return cells;
}

function buildMonths() {
  const out:string[] = [];
  const today = new Date();
  for (let w=0; w<16; w++) {
    const d = new Date(today); d.setDate(d.getDate() - (15-w)*7);
    out.push(d.getDate()<=7 ? MONTHS[d.getMonth()] : '');
  }
  return out;
}

export default function ProgressCard({ totalPoints, onCheckIn, showToast }: Props) {
  const grid   = useMemo(buildGrid,   []);
  const months = useMemo(buildMonths, []);
  const barPct = Math.min(Math.round((totalPoints%1000)/10), 100);

  // Split 112 cells into 7 rows of 16
  const rows: typeof grid[number][][] = [];
  for (let r=0; r<7; r++) rows.push(grid.slice(r*16, r*16+16));

  return (
    <div style={{ background:'linear-gradient(135deg,#3a5a52,#2d4a43)', borderRadius:'14px', padding:'16px 15px', color:'#fff', position:'relative', overflow:'hidden', marginBottom:'14px', boxSizing:'border-box' }}>

      <div style={{ position:'absolute',top:'-18px',right:'-18px',width:'64px',height:'64px',background:'rgba(255,255,255,.05)',borderRadius:'50%',pointerEvents:'none' }} />

      <div style={{ fontSize:'10px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.1em',color:'#a8c8b8',marginBottom:'2px' }}>Progress Level</div>
      <div style={{ fontSize:'26px',fontWeight:800,letterSpacing:'-1px',lineHeight:1.2,marginBottom:'2px' }}>
        {totalPoints.toLocaleString()}
        <span style={{ fontSize:'12px',fontWeight:500,color:'#a8c8b8',marginLeft:'3px' }}>pts</span>
      </div>
      <div style={{ height:'5px',background:'rgba(255,255,255,.15)',borderRadius:'3px',overflow:'hidden',marginBottom:'10px' }}>
        <div style={{ height:'100%',width:`${barPct}%`,background:'#6dcb88',borderRadius:'3px' }} />
      </div>
      <div style={{ height:'1px',background:'rgba(255,255,255,.1)',marginBottom:'8px' }} />

      {/* Month labels */}
      <div style={{ display:'flex',gap:'1px',marginBottom:'3px' }}>
        {months.map((m,i)=>(
          <div key={i} style={{ flex:1,fontSize:'7.5px',color:'#a8c8b8',fontWeight:600,overflow:'hidden',whiteSpace:'nowrap',lineHeight:1 }}>{m}</div>
        ))}
      </div>

      {/* Heatmap — 7 rows × 16 cols, each cell is a fixed 8px square */}
      <div style={{ display:'flex',flexDirection:'column',gap:'2px',marginBottom:'5px' }}>
        {rows.map((row,ri)=>(
          <div key={ri} style={{ display:'flex',gap:'2px' }}>
            {row.map((cell,ci)=>(
              <div key={ci} title={cell.label} onClick={()=>showToast(`Activity: ${cell.label}`)}
                style={{ flex:1,height:'8px',borderRadius:'2px',background:COLORS[cell.level],cursor:'pointer',minWidth:0 }} />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display:'flex',alignItems:'center',gap:'2px',justifyContent:'flex-end',marginBottom:'6px' }}>
        <span style={{ fontSize:'8px',color:'#a8c8b8' }}>Less</span>
        {COLORS.map((c,i)=><div key={i} style={{ width:'8px',height:'8px',borderRadius:'2px',background:c }} />)}
        <span style={{ fontSize:'8px',color:'#a8c8b8' }}>More</span>
      </div>

      <div onClick={onCheckIn} style={{ fontSize:'10.5px',color:'#a8c8b8',cursor:'pointer',display:'flex',alignItems:'center',gap:'3px' }}
        onMouseEnter={e=>(e.currentTarget.style.color='#fff')} onMouseLeave={e=>(e.currentTarget.style.color='#a8c8b8')}>
        📅 Check in to earn more pts →
      </div>
    </div>
  );
}