'use client';
import React, { useState } from 'react';
import { Sword, Heart, Zap, Droplets, Phone, BookOpen, Dumbbell, BanIcon, CheckSquare, Square, Skull } from 'lucide-react';
import { GameProgress } from '@/types/games.types';

interface Props { progress:GameProgress; onUpdateProgress:(u:Partial<GameProgress>)=>Promise<void>; showToast:(m:string,t?:'success'|'error'|'info')=>void; }

const TASKS = [
  { id:'med',  Icon:Zap,       name:'Morning meditation (10 min)',  xp:15 },
  { id:'soc',  Icon:BanIcon,   name:'No social media before noon', xp:20 },
  { id:'h2o',  Icon:Droplets,  name:'Drink 8 glasses of water',    xp:10 },
  { id:'call', Icon:Phone,     name:'Call a support buddy',        xp:25 },
  { id:'jour', Icon:BookOpen,  name:'Write in your journal',       xp:15 },
  { id:'run',  Icon:Dumbbell,  name:'20 minutes of exercise',      xp:20 },
];
const XP_LV   = 500;
const getToday = () => new Date().toISOString().slice(0,10);
const accent   = '#6d28d9';

export default function HabiticaGame({ progress, onUpdateProgress, showToast }: Props) {
  const h      = progress.habiticaData;
  const newDay = h?.lastTaskReset!==getToday();
  const [tasks, setTasks] = useState(TASKS.map(t=>({ ...t, done:newDay?false:(h?.tasksDoneToday?.includes(t.id)??false) })));
  const [hp,   setHp]   = useState(h?.hp??100);
  const [xp,   setXp]   = useState(h?.xp??0);
  const [lv,   setLv]   = useState(h?.level??1);
  const [busy, setBusy] = useState<string|null>(null);

  const done    = tasks.filter(t=>t.done).length;
  const xpInLv  = xp%XP_LV;
  const xpPct   = Math.round((xpInLv/XP_LV)*100);
  const bossPct = Math.round((done/TASKS.length)*100);

  async function toggleTask(id:string) {
    if(busy) return;
    const task=tasks.find(t=>t.id===id); if(!task) return;
    const was=task.done;
    const updated=tasks.map(t=>t.id===id?{...t,done:!t.done}:t);
    const xpD=was?-task.xp:task.xp, hpD=was?-5:+5;
    const nx=Math.max(0,xp+xpD), nh=Math.min(100,Math.max(0,hp+hpD)), nl=Math.floor(nx/XP_LV)+1;
    const ids=updated.filter(t=>t.done).map(t=>t.id);
    setTasks(updated); setXp(nx); setHp(nh); setLv(nl); setBusy(id);
    try {
      await onUpdateProgress({ habiticaData:{...h,hp:nh,maxHp:100,xp:nx,xpToNext:XP_LV,mp:h?.mp??60,maxMp:100,level:nl,class:h?.class??'Warrior',tasksCompleted:ids.length,questsCompleted:h?.questsCompleted??0,tasksDoneToday:ids,lastTaskReset:getToday()}, totalPoints:Math.max(0,(progress.totalPoints??0)+xpD), lastPlayed:new Date().toISOString() });
      showToast(was?`Task unchecked — ${Math.abs(hpD)} HP lost`:`+${task.xp} XP earned`,was?'info':'success');
    } catch { setTasks(tasks); setXp(xp); setHp(hp); setLv(lv); showToast('Save failed','error'); }
    finally { setBusy(null); }
  }

  const StatBar = ({ Icon: Ic, label, value, max, color }: { Icon:any; label:string; value:number; max:number; color:string }) => (
    <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10 }}>
      <Ic size={14} strokeWidth={2} color="rgba(255,255,255,.5)"/>
      <span style={{ fontSize:11,color:'rgba(255,255,255,.5)',width:24,flexShrink:0 }}>{label}</span>
      <div style={{ flex:1,height:7,background:'rgba(255,255,255,.15)',borderRadius:999,overflow:'hidden' }}>
        <div style={{ height:'100%',width:`${(value/max)*100}%`,background:color,borderRadius:999,transition:'width .5s' }}/>
      </div>
      <span style={{ fontSize:11,color:'rgba(255,255,255,.45)',minWidth:40,textAlign:'right' }}>{value}/{max}</span>
    </div>
  );

  return (
    <div style={{ maxWidth:580,margin:'0 auto',fontFamily:"'DM Sans',system-ui,sans-serif" }}>

      {/* Character card */}
      <div style={{ background:`linear-gradient(160deg,#4c1d95,#6d28d9)`,borderRadius:20,padding:'28px',marginBottom:14,boxShadow:'0 8px 32px rgba(109,40,217,.3)',color:'#fff' }}>
        <div style={{ display:'flex',gap:20,alignItems:'center' }}>
          <div style={{ width:72,height:72,borderRadius:18,background:'rgba(255,255,255,.12)',border:'1.5px solid rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
            <Sword size={32} strokeWidth={1.5} color="rgba(255,255,255,.9)"/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:6 }}>
              <p style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,fontWeight:400 }}>Recovery Hero</p>
              <span style={{ fontSize:11,fontWeight:600,background:'rgba(255,255,255,.15)',borderRadius:999,padding:'2px 10px' }}>LV {lv}</span>
            </div>
            <p style={{ fontSize:12,color:'rgba(255,255,255,.55)',marginBottom:14 }}>{done}/{TASKS.length} quests complete today</p>
            <StatBar Icon={Heart}   label="HP" value={hp}     max={100}  color="#f472b6"/>
            <StatBar Icon={Zap}     label="XP" value={xpInLv} max={XP_LV} color="#fbbf24"/>
            <StatBar Icon={Droplets}label="MP" value={h?.mp??60} max={100} color="#60a5fa"/>
          </div>
        </div>
      </div>

      {/* Quest list */}
      <div style={{ background:'#fff',border:'1px solid #e4ede8',borderTop:`3px solid ${accent}`,borderRadius:20,padding:'22px',marginBottom:14,boxShadow:'0 4px 16px rgba(10,15,13,.06)' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18 }}>
          <p style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,color:'#0a0f0d' }}>Daily Quests</p>
          <span style={{ fontSize:11,fontWeight:600,color:accent,background:`${accent}12`,borderRadius:999,padding:'4px 12px' }}>{done}/{TASKS.length} complete</span>
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
          {tasks.map(t=>(
            <button key={t.id} onClick={()=>toggleTask(t.id)} disabled={!!busy}
              style={{ display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderRadius:14,border:`1.5px solid ${t.done?`${accent}40`:'#e4ede8'}`,background:t.done?`${accent}08`:'#fafafa',cursor:busy?'wait':'pointer',textAlign:'left',transition:'all .2s',width:'100%' }}
              onMouseEnter={e=>{ if(!busy) e.currentTarget.style.background=t.done?`${accent}12`:'#f7faf8'; }}
              onMouseLeave={e=>{ e.currentTarget.style.background=t.done?`${accent}08`:'#fafafa'; }}>
              {/* Checkbox */}
              <div style={{ flexShrink:0 }}>
                {busy===t.id
                  ? <div style={{ width:22,height:22,border:`2px solid ${accent}`,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center' }}><span style={{ fontSize:10,color:accent }}>…</span></div>
                  : t.done
                    ? <CheckSquare size={22} strokeWidth={2} color={accent}/>
                    : <Square size={22} strokeWidth={1.8} color="#d1d5db"/>
                }
              </div>
              {/* Task icon */}
              <t.Icon size={18} strokeWidth={1.8} color={t.done?accent:'#7a8f86'}/>
              <span style={{ flex:1,fontSize:13.5,fontWeight:t.done?400:500,color:t.done?'#7a8f86':'#0a0f0d',textDecoration:t.done?'line-through':'none' }}>{t.name}</span>
              <span style={{ fontSize:12,fontWeight:600,color:t.done?accent:'#b45309',background:t.done?`${accent}10`:'#fef9e7',padding:'4px 12px',borderRadius:999,flexShrink:0 }}>
                {t.done?'Done':'+'+t.xp+' XP'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Boss battle */}
      <div style={{ background:`linear-gradient(135deg,#1e1b4b,#3b0764)`,borderRadius:18,padding:'22px 24px',color:'#fff',boxShadow:'0 4px 20px rgba(30,27,75,.3)' }}>
        <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:4 }}>
          <Skull size={18} strokeWidth={1.8} color="rgba(255,255,255,.7)"/>
          <p style={{ fontFamily:"'DM Serif Display',serif",fontSize:18 }}>Boss Battle</p>
        </div>
        <p style={{ fontSize:12,color:'rgba(255,255,255,.4)',marginBottom:16 }}>Procrastination Dragon — defeat it with your quests</p>
        <div style={{ display:'flex',justifyContent:'space-between',fontSize:12,color:'rgba(255,255,255,.55)',marginBottom:8 }}>
          <span>Dragon HP</span><span>{100-bossPct}% remaining</span>
        </div>
        <div style={{ height:10,background:'rgba(255,255,255,.1)',borderRadius:999,overflow:'hidden',marginBottom:12 }}>
          <div style={{ height:'100%',width:`${bossPct}%`,background:'linear-gradient(90deg,#f43f5e,#f97316)',borderRadius:999,transition:'width .6s' }}/>
        </div>
        <p style={{ fontSize:12.5,color:'rgba(255,255,255,.4)',textAlign:'center' }}>
          {done===0&&'Complete quests to attack the dragon'}
          {done>0&&done<TASKS.length&&`${bossPct}% damage dealt — keep going`}
          {done===TASKS.length&&'Dragon defeated — all quests complete!'}
        </p>
      </div>
    </div>
  );
}
