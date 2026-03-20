'use client';
import React, { useState } from 'react';
import { ArrowLeft, Heart, Shield, Activity, Layers, TrendingUp, Wind, BookOpen, Gamepad2 } from 'lucide-react';
import { Game, GameProgress } from '@/types/games.types';
import SoberGame    from './games/SoberGame';
import ForestGame   from './games/ForestGame';
import HabiticaGame from './games/HabiticaGame';
import BraverGame   from './games/BraverGame';
import MindfulGame  from './games/MindfulGame';
import JournalGame  from './games/JournalGame';

const CAT_LABEL: Record<string,string> = {
  substance:'Substance Recovery', social:'Social Media',
  behavioral:'Behavioral', pornography:'Pornography',
  screen:'Screen Time', mindfulness:'Mindfulness',
};
const CAT_ACCENT: Record<string,string> = {
  substance:'#1a7a4a', social:'#1e40af', behavioral:'#6d28d9',
  pornography:'#b45309', screen:'#dc2626', mindfulness:'#0d7377',
};
const GAME_ICONS: Record<string, React.FC<{size?:number;strokeWidth?:number;color?:string}>> = {
  sober:Shield, forest:Activity, habitica:Layers, braver:TrendingUp, mindful:Wind, journal:BookOpen,
};

interface Props { game:Game; progress:GameProgress; onBack:()=>void; onUpdateProgress:(u:Partial<GameProgress>)=>Promise<void>; showToast:(m:string,t?:'success'|'error'|'info')=>void; }

export default function GameOverlay({ game, progress, onBack, onUpdateProgress, showToast }: Props) {
  const [favd, setFavd] = useState(progress.isFavorite);
  const accent  = CAT_ACCENT[game.category]??'#1a7a4a';
  const GameIcon = GAME_ICONS[game.name]??Gamepad2;

  const renderGame = () => {
    const props = { progress, onUpdateProgress, showToast };
    switch(game.name) {
      case 'sober':    return <SoberGame    {...props}/>;
      case 'forest':   return <ForestGame   {...props}/>;
      case 'habitica': return <HabiticaGame {...props}/>;
      case 'braver':   return <BraverGame   {...props}/>;
      case 'mindful':  return <MindfulGame  {...props}/>;
      case 'journal':  return <JournalGame  {...props}/>;
      default: return (
        <div style={{ textAlign:'center',padding:'64px 24px',color:'#7a8f86' }}>
          <div style={{ width:64,height:64,borderRadius:18,background:'#f7faf8',border:'1px solid #e4ede8',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px' }}>
            <GameIcon size={28} strokeWidth={1.5} color="#7a8f86"/>
          </div>
          <p style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:'#0a0f0d',marginBottom:8 }}>{game.title}</p>
          <p style={{ fontSize:14 }}>Coming soon</p>
        </div>
      );
    }
  };

  return (
    <div style={{ position:'fixed',inset:0,zIndex:900,background:'#f7faf8',overflowY:'auto',fontFamily:"'DM Sans',system-ui,sans-serif" }}>

      {/* Sticky nav */}
      <nav style={{ background:'#fff',borderBottom:'1px solid #e4ede8',position:'sticky',top:0,zIndex:10,display:'flex',alignItems:'center',gap:12,padding:'0 24px',height:56 }}>

        <button onClick={onBack}
          style={{ display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:10,border:'1.5px solid #e4ede8',background:'transparent',color:'#3d4f47',fontSize:13,fontWeight:500,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all .15s' }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor='#0a0f0d'; e.currentTarget.style.color='#0a0f0d'; }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor='#e4ede8'; e.currentTarget.style.color='#3d4f47'; }}>
          <ArrowLeft size={15} strokeWidth={2}/> Back
        </button>

        <div style={{ width:1,height:20,background:'#e4ede8' }}/>

        {/* Icon */}
        <div style={{ width:32,height:32,borderRadius:8,background:`${accent}12`,border:`1px solid ${accent}22`,display:'flex',alignItems:'center',justifyContent:'center' }}>
          <GameIcon size={16} strokeWidth={2} color={accent}/>
        </div>

        <p style={{ fontSize:15,fontWeight:600,color:'#0a0f0d',fontFamily:"'DM Serif Display',Georgia,serif" }}>{game.title}</p>

        <span style={{ fontSize:11,fontWeight:600,color:accent,background:`${accent}12`,borderRadius:999,padding:'3px 12px' }}>
          {CAT_LABEL[game.category]??game.category}
        </span>

        <div style={{ flex:1 }}/>

        {progress.totalPoints>0&&(
          <span style={{ fontSize:12,fontWeight:600,color:'#7a8f86',background:'#f7faf8',border:'1px solid #e4ede8',borderRadius:999,padding:'4px 12px' }}>
            {progress.totalPoints} pts
          </span>
        )}

        <button onClick={async()=>{
            setFavd(!favd);
            await onUpdateProgress({ isFavorite:!favd }).catch(()=>{});
            showToast(!favd?'Added to favourites':'Removed from favourites');
          }}
          style={{ display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:10,border:`1.5px solid ${favd?'#f59e0b':'#e4ede8'}`,background:favd?'#fef9e7':'transparent',color:favd?'#b45309':'#7a8f86',fontSize:13,fontWeight:500,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all .15s' }}>
          <Heart size={14} strokeWidth={2} fill={favd?'#b45309':'none'} color={favd?'#b45309':'#7a8f86'}/>
          {favd?'Saved':'Save'}
        </button>
      </nav>

      <div style={{ maxWidth:820,margin:'0 auto',padding:'32px 20px 64px' }}>
        {renderGame()}
      </div>
    </div>
  );
}
