'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  Play, Star, Clock, Users, MoreHorizontal, Shield, Activity,
  Layers, TrendingUp, Wind, BookOpen, Gamepad2, Heart,
  Share2, EyeOff, Check, ChevronRight, BarChart2,
} from 'lucide-react';
import { Game, GameProgress } from '@/types/games.types';

const CAT_LABEL: Record<string,string> = {
  substance:'Substance Recovery', social:'Social Media',
  behavioral:'Behavioral', pornography:'Pornography',
  screen:'Screen Time', mindfulness:'Mindfulness',
};
const CAT_ACCENT: Record<string,string> = {
  substance:'#1a7a4a', social:'#1e40af', behavioral:'#6d28d9',
  pornography:'#b45309', screen:'#dc2626', mindfulness:'#0d7377',
};
const DIFF_STYLE: Record<string,{bg:string;color:string;label:string}> = {
  easy:  { bg:'#e8f7ee',color:'#1a7a4a',label:'Easy'   },
  medium:{ bg:'#fef9e7',color:'#b45309',label:'Medium' },
  hard:  { bg:'#fef2f2',color:'#dc2626',label:'Hard'   },
};

// Map game name → Lucide icon component
const GAME_ICONS: Record<string, React.FC<{size?:number;strokeWidth?:number;color?:string}>> = {
  sober:    Shield,
  forest:   Activity,
  habitica: Layers,
  braver:   TrendingUp,
  mindful:  Wind,
  journal:  BookOpen,
};

interface Props {
  game:Game; progress?:GameProgress;
  onPlay:(g:Game)=>void; onFavorite:(id:string)=>void;
  onShare:(name:string)=>void; onHide:(id:string)=>void;
  showToast:(msg:string,type?:'success'|'error'|'info')=>void;
}

export default function GameCard({ game, progress, onPlay, onFavorite, onShare, onHide }: Props) {
  const [hovered, setHovered] = useState(false);
  const [ddOpen,  setDdOpen]  = useState(false);
  const ddRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const h=(e:MouseEvent)=>{ if(!ddRef.current?.contains(e.target as Node)) setDdOpen(false); };
    if(ddOpen) document.addEventListener('mousedown',h);
    return ()=>document.removeEventListener('mousedown',h);
  },[ddOpen]);

  const accent = CAT_ACCENT[game.category]??'#1a7a4a';
  const diff   = DIFF_STYLE[game.difficulty]??DIFF_STYLE.medium;
  const GameIcon = GAME_ICONS[game.name] ?? Gamepad2;

  return (
    <div
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>setHovered(false)}
      style={{ position:'relative',overflow:'hidden',background:'#fff',border:'1px solid #e4ede8',borderLeft:`3px solid ${accent}`,borderRadius:18,padding:'22px 24px',boxShadow:hovered?'0 8px 32px rgba(10,15,13,.10),0 2px 8px rgba(10,15,13,.06)':'0 1px 4px rgba(10,15,13,.05)',transform:hovered?'translateY(-2px)':'none',transition:'box-shadow .2s,transform .2s' }}>

      {/* Watermark icon — large, very faint, bleeds off right */}
      <div style={{ position:'absolute',right:-16,top:'50%',transform:'translateY(-50%)',opacity:.04,pointerEvents:'none' }}>
        <GameIcon size={110} strokeWidth={1} color={accent}/>
      </div>

      {/* Row 1 */}
      <div style={{ display:'flex',alignItems:'flex-start',gap:16,marginBottom:14 }}>
        {/* Game icon button */}
        <button onClick={()=>onPlay(game)}
          style={{ flexShrink:0,width:52,height:52,borderRadius:14,background:`${accent}10`,border:`1.5px solid ${accent}22`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'transform .15s',transform:hovered?'scale(1.06)':'scale(1)' }}>
          <GameIcon size={24} strokeWidth={1.8} color={accent}/>
        </button>

        {/* Title + badges */}
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:7 }}>
            <h3 style={{ fontFamily:"'DM Serif Display',Georgia,serif",fontSize:18,fontWeight:400,color:'#0a0f0d',letterSpacing:'-.2px',margin:0 }}>{game.title}</h3>
            {progress?.isFavorite&&<Heart size={14} fill={accent} color={accent}/>}
          </div>
          <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
            <span style={{ fontSize:11,fontWeight:600,color:accent,background:`${accent}12`,borderRadius:999,padding:'2px 10px' }}>{CAT_LABEL[game.category]??game.category}</span>
            <span style={{ fontSize:11,fontWeight:600,color:diff.color,background:diff.bg,borderRadius:999,padding:'2px 10px' }}>{diff.label}</span>
            <span style={{ fontSize:11,color:'#7a8f86',background:'#f7faf8',borderRadius:999,padding:'2px 10px',border:'1px solid #e4ede8',display:'flex',alignItems:'center',gap:4 }}>
              <Clock size={11} strokeWidth={2}/> {game.estimatedTime}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display:'flex',alignItems:'center',gap:8,flexShrink:0 }}>
          <button onClick={()=>onPlay(game)}
            style={{ display:'flex',alignItems:'center',gap:7,padding:'9px 18px',borderRadius:12,border:'none',background:'#0a0f0d',color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'background .15s,transform .1s',whiteSpace:'nowrap' }}
            onMouseEnter={e=>{ e.currentTarget.style.background='#1a2e26'; e.currentTarget.style.transform='translateY(-1px)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='#0a0f0d'; e.currentTarget.style.transform='none'; }}>
            <Play size={13} fill="#fff" strokeWidth={0}/>
            Play Now
          </button>

          <div style={{ position:'relative' }} ref={ddRef}>
            <button onClick={(e)=>{ e.stopPropagation(); setDdOpen(!ddOpen); }}
              style={{ width:34,height:34,borderRadius:10,border:`1.5px solid ${ddOpen?'#0a0f0d':'#e4ede8'}`,background:ddOpen?'#f7faf8':'transparent',color:ddOpen?'#0a0f0d':'#7a8f86',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all .15s' }}>
              <MoreHorizontal size={18} strokeWidth={2}/>
            </button>
            {ddOpen&&(
              <div style={{ position:'absolute',top:40,right:0,background:'#fff',border:'1px solid #e4ede8',borderRadius:14,boxShadow:'0 12px 40px rgba(10,15,13,.14)',width:180,zIndex:500,overflow:'hidden',padding:'4px 0' }}>
                {[
                  { label:'Play Game',   Icon:Play,    onClick:()=>{ onPlay(game); setDdOpen(false); },         red:false },
                  { label:progress?.isFavorite?'Unfavourite':'Favourite', Icon:Heart, onClick:()=>{ onFavorite(game._id); setDdOpen(false); }, red:false },
                  { label:'Share',       Icon:Share2,  onClick:()=>{ onShare(game.title); setDdOpen(false); },  red:false },
                  { label:'Hide Game',   Icon:EyeOff,  onClick:()=>{ onHide(game._id); setDdOpen(false); },    red:true  },
                ].map(item=>(
                  <button key={item.label} onClick={item.onClick}
                    style={{ display:'flex',alignItems:'center',gap:10,width:'100%',padding:'9px 14px',fontSize:13,fontWeight:500,color:item.red?'#dc2626':'#0a0f0d',background:'transparent',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",textAlign:'left',transition:'background .1s' }}
                    onMouseEnter={e=>e.currentTarget.style.background=item.red?'#fef2f2':'#f7faf8'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <item.Icon size={14} strokeWidth={2}/>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize:13.5,color:'#4a6358',lineHeight:1.65,marginBottom:16,maxWidth:'80%' }}>{game.description}</p>

      {/* Feature chips */}
      <div style={{ display:'flex',gap:6,flexWrap:'wrap',marginBottom:16 }}>
        {game.features.map(f=>(
          <button key={f} onClick={()=>onPlay(game)}
            style={{ padding:'4px 12px',borderRadius:999,border:'1px solid #e4ede8',background:'#f7faf8',fontSize:12,color:'#7a8f86',fontWeight:500,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all .15s' }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=accent; e.currentTarget.style.color=accent; e.currentTarget.style.background=`${accent}08`; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor='#e4ede8'; e.currentTarget.style.color='#7a8f86'; e.currentTarget.style.background='#f7faf8'; }}>
            {f}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display:'flex',alignItems:'center',gap:16,paddingTop:14,borderTop:'1px solid #f0f4f2' }}>
        <div style={{ display:'flex',alignItems:'center',gap:6 }}>
          <Users size={13} strokeWidth={2} color={accent}/>
          <span style={{ fontSize:12,color:'#7a8f86',fontWeight:500 }}>{game.activePlayers.toLocaleString()} playing</span>
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:4 }}>
          <Star size={13} strokeWidth={2} color="#b45309"/>
          <span style={{ fontSize:12,color:'#7a8f86',fontWeight:500 }}>{game.rating}</span>
        </div>
        <div style={{ flex:1,height:4,background:'#f0f4f2',borderRadius:4,overflow:'hidden',maxWidth:80,marginLeft:'auto' }}>
          <div style={{ height:'100%',width:`${(game.rating/5)*100}%`,background:accent,borderRadius:4 }}/>
        </div>
        {(progress?.totalPoints??0)>0&&(
          <span style={{ fontSize:12,color:accent,fontWeight:600,background:`${accent}10`,padding:'3px 10px',borderRadius:999 }}>
            {progress!.totalPoints} pts
          </span>
        )}
      </div>
    </div>
  );
}
