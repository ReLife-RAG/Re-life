'use client';
import React, { useState } from 'react';

interface Props { selectedCategory:string; onCategoryChange:(cat:string)=>void; }

const CATS = [
  { id:'all',        label:'All Games',          icon:'🎮' },
  { id:'substance',  label:'Substance Recovery',  icon:'🌿' },
  { id:'social',     label:'Social Media',        icon:'📱' },
  { id:'behavioral', label:'Behavioral',          icon:'🧠' },
  { id:'pornography', label:'Pornography',         icon:'🚫' },
  { id:'mindfulness', label:'Mindfulness',         icon:'🧘' },
];

function CatBtn({ cat, active, onClick }:{ cat:typeof CATS[0]; active:boolean; onClick:()=>void }) {
  const [h,setH]=useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ display:'flex',alignItems:'center',gap:'8px',width:'100%',padding:'7px 10px',borderRadius:'8px',fontSize:'13px',fontWeight:active?600:500,cursor:'pointer',border:'none',background:active?'#e8f7ee':(h?'#f4f6f5':'transparent'),color:active?'#5bbf7a':(h?'#1a2e26':'#7a8f86'),marginBottom:'1px',textAlign:'left',transition:'all .15s' }}>
      <span style={{ fontSize:'15px',lineHeight:1 }}>{cat.icon}</span>
      {cat.label}
    </button>
  );
}

export default function CategoryFilter({ selectedCategory, onCategoryChange }: Props) {
  return (
    <>
      <div style={{ fontSize:'11px',fontWeight:700,letterSpacing:'.09em',textTransform:'uppercase',color:'#7a8f86',marginBottom:'10px' }}>
        🎯 Categories
      </div>
      {CATS.map(c=>(
        <CatBtn key={c.id} cat={c} active={selectedCategory===c.id} onClick={()=>onCategoryChange(c.id)} />
      ))}
    </>
  );
}