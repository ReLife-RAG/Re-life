'use client';
import React, { useState } from 'react';
import { CheckCircle2, Clock, DollarSign, Award, Lock, ChevronRight, Shield, Check } from 'lucide-react';
import { GameProgress } from '@/types/games.types';

const MILESTONES = [
  { days:1,  label:'First Day',  desc:'The hardest step taken' },
  { days:3,  label:'3 Days',     desc:'Breaking the habit loop' },
  { days:7,  label:'One Week',   desc:'A full week of strength' },
  { days:14, label:'Two Weeks',  desc:'Building real momentum' },
  { days:30, label:'One Month',  desc:'A month of commitment' },
  { days:90, label:'90 Days',    desc:'Life-changing milestone' },
];

const BADGE_TIERS = [
  { minDays:90, label:'Diamond', color:'#0d7377' },
  { minDays:30, label:'Gold',    color:'#b45309' },
  { minDays:7,  label:'Silver',  color:'#6b7280' },
  { minDays:0,  label:'Bronze',  color:'#92400e' },
];

const getToday = () => new Date().toISOString().slice(0,10);
const accent   = '#1a7a4a';

interface Props { progress:GameProgress; onUpdateProgress:(u:Partial<GameProgress>)=>Promise<void>; showToast:(m:string,t?:'success'|'error'|'info')=>void; }

export default function SoberGame({ progress, onUpdateProgress, showToast }: Props) {
  const [loading, setLoading] = useState(false);
  const s       = progress.soberData;
  const days    = s?.daysSober??0;
  const money   = s?.moneySaved??days*12;
  const hours   = s?.hoursSober??days*24;
  const pledged = !!(s?.pledgedToday||s?.lastPledgeDate===getToday());
  const nextMs  = MILESTONES.find(m=>days<m.days);
  const pct     = nextMs ? Math.round((days/nextMs.days)*100) : 100;
  const tier    = BADGE_TIERS.find(t=>days>=t.minDays)!;

  async function makePledge() {
    if(pledged||loading) return;
    setLoading(true);
    try {
      const nd=days+1;
      await onUpdateProgress({ soberData:{...s,daysSober:nd,pledgedToday:true,lastPledgeDate:getToday(),moneySaved:nd*12,hoursSober:nd*24,milestones:s?.milestones??[]}, totalPoints:(progress.totalPoints??0)+10, currentStreak:(progress.currentStreak??0)+1 });
      showToast(`Day ${nd} complete — +10 pts`,'success');
    } catch(e:any) { showToast(e?.message??'Already pledged today','error'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ maxWidth:560,margin:'0 auto',fontFamily:"'DM Sans',system-ui,sans-serif" }}>

      {/* Hero counter */}
      <div style={{ background:'#fff',border:'1px solid #e4ede8',borderTop:`3px solid ${accent}`,borderRadius:20,padding:'40px 36px 32px',marginBottom:16,textAlign:'center',boxShadow:'0 4px 16px rgba(10,15,13,.06)' }}>
        <p style={{ fontSize:11,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',color:`${accent}99`,marginBottom:12 }}>Current Streak</p>
        <div style={{ fontFamily:"'DM Serif Display',Georgia,serif",fontSize:96,lineHeight:1,color:accent,letterSpacing:-4,marginBottom:8 }}>{days}</div>
        <p style={{ fontSize:18,color:'#3d4f47',fontWeight:400,marginBottom:32 }}>{days===1?'day sober':'days sober'}</p>

        {nextMs&&(
          <div style={{ marginBottom:28 }}>
            <div style={{ display:'flex',justifyContent:'space-between',fontSize:12,color:'#7a8f86',fontWeight:500,marginBottom:8 }}>
              <span>Next: {nextMs.label}</span>
              <span>{days} / {nextMs.days} days</span>
            </div>
            <div style={{ height:6,background:'#f0f4f2',borderRadius:999,overflow:'hidden' }}>
              <div style={{ height:'100%',width:`${pct}%`,background:`linear-gradient(90deg,${accent},#2a9a62)`,borderRadius:999,transition:'width .8s' }}/>
            </div>
          </div>
        )}

        <button onClick={makePledge} disabled={pledged||loading}
          style={{ width:'100%',padding:'15px 24px',borderRadius:14,border:pledged?`1.5px solid ${accent}40`:'none',background:pledged?'#f0fbf5':'#0a0f0d',color:pledged?accent:'#fff',fontSize:15,fontWeight:600,cursor:pledged?'default':'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all .2s',boxShadow:pledged?'none':'0 4px 16px rgba(10,15,13,.2)',display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}
          onMouseEnter={e=>{ if(!pledged&&!loading){ e.currentTarget.style.background='#1a2e26'; e.currentTarget.style.transform='translateY(-1px)'; }}}
          onMouseLeave={e=>{ if(!pledged&&!loading){ e.currentTarget.style.background='#0a0f0d'; e.currentTarget.style.transform='none'; }}}>
          {pledged
            ? <><CheckCircle2 size={16} strokeWidth={2}/> Pledged today — come back tomorrow</>
            : loading ? 'Saving…'
            : <><Shield size={16} strokeWidth={2}/> Make today's pledge &nbsp;+10 pts</>
          }
        </button>
        {!pledged&&<p style={{ fontSize:12,color:'#7a8f86',marginTop:10 }}>Pledge every day to maintain your streak</p>}
      </div>

      {/* Stats */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:16 }}>
        {[
          { Icon:Clock,     value:`${hours}h`,  label:'Hours Sober', iconColor:'#3d4f47' },
          { Icon:DollarSign,value:`$${money}`,  label:'Money Saved', iconColor:'#1a7a4a' },
          { Icon:Award,     value:tier.label,   label:'Your Tier',   iconColor:tier.color },
        ].map(stat=>(
          <div key={stat.label} style={{ background:'#fff',border:'1px solid #e4ede8',borderRadius:16,padding:'18px 14px',textAlign:'center',boxShadow:'0 1px 4px rgba(10,15,13,.04)' }}>
            <div style={{ display:'flex',justifyContent:'center',marginBottom:8 }}>
              <stat.Icon size={22} strokeWidth={1.8} color={stat.iconColor}/>
            </div>
            <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:18,color:'#0a0f0d',marginBottom:4 }}>{stat.value}</div>
            <div style={{ fontSize:11,color:'#7a8f86',fontWeight:500 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Milestones */}
      <div style={{ background:'#fff',border:'1px solid #e4ede8',borderRadius:20,padding:'24px',boxShadow:'0 1px 4px rgba(10,15,13,.04)' }}>
        <p style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,color:'#0a0f0d',marginBottom:18 }}>Milestones</p>
        <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
          {MILESTONES.map(m=>{
            const done=days>=m.days, cur=nextMs?.days===m.days;
            return (
              <div key={m.days} style={{ display:'flex',alignItems:'center',gap:14,padding:'12px 16px',borderRadius:12,background:done?'#f0fbf5':cur?'#fffef0':'#fafafa',border:`1px solid ${done?'#b0dfc4':cur?'#f0d878':'#f0f4f2'}` }}>
                {/* Status icon */}
                <div style={{ width:32,height:32,borderRadius:10,background:done?accent:cur?'#fef9e7':'#f0f4f2',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  {done
                    ? <Check size={16} strokeWidth={2.5} color="#fff"/>
                    : cur
                      ? <ChevronRight size={16} strokeWidth={2} color="#b45309"/>
                      : <Lock size={14} strokeWidth={2} color="#c8d8d0"/>
                  }
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14,fontWeight:600,color:done?'#0f3d22':'#0a0f0d',marginBottom:2 }}>{m.label}</p>
                  <p style={{ fontSize:12,color:'#7a8f86' }}>{m.desc}</p>
                </div>
                <span style={{ fontSize:12,fontWeight:600,color:done?accent:cur?'#b45309':'#c8d8d0',background:done?`${accent}12`:cur?'#fef9e7':'transparent',padding:'3px 10px',borderRadius:999 }}>
                  {done?'Complete':cur?`${m.days-days}d left`:'Locked'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
