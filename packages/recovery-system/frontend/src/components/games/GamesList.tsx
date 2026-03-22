'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Flame, Gamepad2, Layers, Users, Trophy, Star, TrendingUp,
  BookOpen, Brain, Shield, Wind, LayoutGrid, ChevronRight,
  Activity, LucideIcon,
} from 'lucide-react';
import { Game, GameProgress, LeaderboardEntry, RecentActivity } from '@/types/games.types';
import { gamesApi } from '@/lib/gamesApi';
import GameCard         from './GameCard';
import GameOverlay      from './GameOverlay';
import LeaderboardPanel from './LeaderboardPanel';
import ProgressCard     from './ProgressCard';
import PrivacyModal     from './PrivacyModal';
import CheckInModal     from './CheckInModal';

/* ── Google Fonts ── */
const FONT_LINK = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
.gl-root{
  --ink:#0a0f0d;--ink-light:#3d4f47;--ink-muted:#7a8f86;
  --green:#1a7a4a;--green-lt:#e8f7ee;
  --surface:#ffffff;--off:#f7faf8;--border:#e4ede8;
  --sh-sm:0 1px 3px rgba(10,15,13,.06),0 1px 2px rgba(10,15,13,.04);
  --sh-md:0 4px 16px rgba(10,15,13,.08),0 2px 6px rgba(10,15,13,.04);
  --sh-lg:0 12px 40px rgba(10,15,13,.12),0 4px 12px rgba(10,15,13,.06);
  font-family:'DM Sans',system-ui,sans-serif;
  color:var(--ink);background:var(--off);min-height:100vh;
}
.gl-card{background:var(--surface);border:1px solid var(--border);border-radius:18px;box-shadow:var(--sh-sm);}
.gl-sidebar{position:sticky;top:24px;}
.gl-cat-btn{display:flex;align-items:center;gap:10px;width:100%;padding:9px 12px;border-radius:10px;border:none;cursor:pointer;font-family:'DM Sans',system-ui,sans-serif;font-size:13px;text-align:left;transition:all .15s;}
.gl-act-row{display:flex;align-items:center;gap:12px;padding:10px;border-radius:12px;cursor:pointer;transition:background .15s;}
.gl-act-row:hover{background:var(--off);}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
.gl-fi{animation:fadeUp .35s both;}
.gl-fi-1{animation-delay:.05s;}.gl-fi-2{animation-delay:.1s;}.gl-fi-3{animation-delay:.15s;}
@media (max-width: 1100px){
  .gl-layout{grid-template-columns:1fr!important;gap:16px!important;padding:20px 14px!important;}
  .gl-sidebar{position:static!important;top:auto!important;}
}
`;

/* ── Per-game icon map (Lucide) ── */
const GAME_ICON: Record<string, LucideIcon> = {
  sober:    Shield,
  forest:   Activity,
  habitica: Layers,
  braver:   TrendingUp,
  mindful:  Wind,
  journal:  BookOpen,
};

const MOCK_GAMES: Game[] = [
  { _id:'mock_sober',    name:'sober',    title:'I Am Sober',           description:"Track your sobriety streak day by day with daily pledge commitments. See how much time and money you've saved.", category:'substance',  icon:'shield',  color:'#1a7a4a', features:['Streak Tracker','Savings Counter','Milestones','Community'],     activePlayers:12400, rating:4.8, difficulty:'easy',   estimatedTime:'5 min',  isHidden:false, createdAt:'', updatedAt:'' },
  { _id:'mock_forest',   name:'forest',   title:'Forest – Stay Focused', description:'Plant a virtual tree every time you want to focus. The tree dies if you leave — grow a forest by staying present.',  category:'social',     icon:'activity',color:'#92400e', features:['Virtual Forest','Phone Lock','Real Trees','Focus Timer'],      activePlayers:9800,  rating:4.9, difficulty:'medium', estimatedTime:'25 min', isHidden:false, createdAt:'', updatedAt:'' },
  { _id:'mock_habitica', name:'habitica', title:'Habitica',             description:'Turn your recovery habits into an RPG adventure. Your character levels up when you complete healthy daily tasks.',    category:'behavioral', icon:'layers',  color:'#6d28d9', features:['RPG Character','Level Up','Party Quests','Habit Tracking'],    activePlayers:7300,  rating:4.7, difficulty:'hard',   estimatedTime:'15 min', isHidden:false, createdAt:'', updatedAt:'' },
  { _id:'mock_braver',   name:'braver',   title:'Braver',               description:'Streak-based progress tracking with daily check-ins and motivational challenges. Private and anonymous.',           category:'behavioral', icon:'trending-up',color:'#c2410c', features:['Streak System','Daily Challenges','Anonymous','Badges'],    activePlayers:5100,  rating:4.6, difficulty:'medium', estimatedTime:'10 min', isHidden:false, createdAt:'', updatedAt:'' },
  { _id:'mock_mindful',  name:'mindful',  title:'Mindful Moments',      description:'Guided breathing and mindfulness practices to reduce stress. Complete daily sessions to build your practice.',       category:'mindfulness',icon:'wind',    color:'#0d7377', features:['Box Breathing','Body Scan','Loving Kindness','Mindful Walk'],  activePlayers:6200,  rating:4.8, difficulty:'easy',   estimatedTime:'10 min', isHidden:false, createdAt:'', updatedAt:'' },
  { _id:'mock_journal',  name:'journal',  title:'Recovery Journal',     description:'Daily reflection journaling with guided prompts to process your thoughts and track your emotional journey.',         category:'mindfulness',icon:'book-open',color:'#be123c', features:['Daily Prompts','Mood Tracking','Goal Setting','Insights'],    activePlayers:4800,  rating:4.7, difficulty:'easy',   estimatedTime:'10 min', isHidden:false, createdAt:'', updatedAt:'' },
];

const MOCK_LB: LeaderboardEntry[] = [
  { _id:'1', username:'User#4829', totalPoints:2940, currentStreak:14, rank:1 },
  { _id:'2', username:'User#1105', totalPoints:2680, currentStreak:9,  rank:2 },
  { _id:'3', username:'User#9921', totalPoints:2540, currentStreak:7,  rank:3 },
];

const MOCK_ACT: RecentActivity[] = [
  { game:MOCK_GAMES[0], lastPlayed:new Date().toISOString(), totalPoints:340, currentStreak:14 },
  { game:MOCK_GAMES[1], lastPlayed:new Date().toISOString(), totalPoints:120, currentStreak:4  },
  { game:MOCK_GAMES[4], lastPlayed:new Date().toISOString(), totalPoints:85,  currentStreak:7  },
];

function emptyProgress(game: Game): GameProgress {
  return { _id:'', userId:'', gameId:game._id, gameType:game.name as any, totalPoints:0, currentStreak:0, longestStreak:0, isFavorite:false, createdAt:'', updatedAt:'',
    soberData:{daysSober:0,pledgedToday:false,moneySaved:0,hoursSober:0,milestones:[]},
    forestData:{coins:0,treesPlanted:0,totalFocusTime:0},
    habiticaData:{level:1,class:'Warrior',hp:100,maxHp:100,xp:0,xpToNext:500,mp:60,maxMp:100,tasksCompleted:0,questsCompleted:0,tasksDoneToday:[]},
    braverData:{daysStrong:0,checkedInToday:false,challengesCompleted:0,challengesDoneToday:[],badges:[]},
    mindfulData:{roundsCompleted:0,exercisesDoneToday:[],totalSessions:0,currentStreak:0},
    journalData:{entriesCount:0,currentStreak:0,promptsCompleted:[],moodHistory:[],insightsUnlocked:[]},
  };
}

interface ToastState { msg:string; type:'success'|'error'|'info'; visible:boolean }

const CATS = [
  { id:'all',         label:'All Games',    Icon:LayoutGrid },
  { id:'substance',   label:'Substance',    Icon:Shield     },
  { id:'social',      label:'Social Media', Icon:Users      },
  { id:'behavioral',  label:'Behavioral',   Icon:Brain      },
  { id:'mindfulness', label:'Mindfulness',  Icon:Wind       },
];

export default function GamesList() {
  const [games,          setGames]          = useState<Game[]>(MOCK_GAMES);
  const [allProgress,    setAllProgress]    = useState<GameProgress[]>(MOCK_GAMES.map(emptyProgress));
  const [leaderboard,    setLeaderboard]    = useState<LeaderboardEntry[]>(MOCK_LB);
  const [activity,       setActivity]       = useState<RecentActivity[]>(MOCK_ACT);
  const [apiReady,       setApiReady]       = useState(false);
  const [category,       setCategory]       = useState('all');
  const [hiddenIds,      setHiddenIds]      = useState<Set<string>>(new Set());
  const [activeGame,     setActiveGame]     = useState<Game|null>(null);
  const [activeProgress, setActiveProgress] = useState<GameProgress|null>(null);
  const [privPoints,     setPrivPoints]     = useState<string|null>(null);
  const [showCheckIn,    setShowCheckIn]    = useState(false);
  const [toast,          setToast]          = useState<ToastState>({ msg:'', type:'success', visible:false });

  const showToast = useCallback((msg:string, type:'success'|'error'|'info'='success') => {
    setToast({ msg, type, visible:true });
    setTimeout(()=>setToast(t=>({...t,visible:false})), 2800);
  }, []);

  useEffect(()=>{
    async function load() {
      try {
        const [gRes,lbRes,actRes] = await Promise.allSettled([gamesApi.getGames(),gamesApi.getLeaderboard(5),gamesApi.getRecentActivity(5)]);
        if(gRes.status==='fulfilled'&&gRes.value.length>0){
          setGames(gRes.value); setApiReady(true);
          const prog=await gamesApi.getAllUserProgress().catch(()=>[] as GameProgress[]);
          if(prog.length>0) setAllProgress(prog);
        }
        if(lbRes.status==='fulfilled'&&lbRes.value.length>0)  setLeaderboard(lbRes.value);
        if(actRes.status==='fulfilled'&&actRes.value.length>0) setActivity(actRes.value);
      } catch {}
    }
    load();
  },[]);

  const getProgress = (id:string)=>allProgress.find(p=>p.gameId===id);
  const totalPoints = allProgress.reduce((s,p)=>s+(p.totalPoints??0),0);
  const streak      = allProgress.reduce((m,p)=>Math.max(m,p.currentStreak??0),0);
  const daysSober   = allProgress.find(p=>p.gameType==='sober')?.soberData?.daysSober??0;
  const treesGrown  = allProgress.find(p=>p.gameType==='forest')?.forestData?.treesPlanted??0;
  const xpEarned    = allProgress.find(p=>p.gameType==='habitica')?.habiticaData?.xp??0;
  const visible     = games.filter(g=>!hiddenIds.has(g._id)&&(category==='all'||g.category===category));

  async function handlePlay(game:Game) {
    let prog=getProgress(game._id)??emptyProgress(game);
    if(apiReady&&!game._id.startsWith('mock_')) { try{ prog=await gamesApi.getUserGameProgress(game._id); }catch{} }
    setActiveGame(game); setActiveProgress(prog);
  }

  async function handleUpdateProgress(updates:Partial<GameProgress>) {
    if(!activeGame||!activeProgress) return;
    const merged={...activeProgress,...updates};
    setActiveProgress(merged);
    setAllProgress(prev=>prev.some(p=>p.gameId===activeGame._id)?prev.map(p=>p.gameId===activeGame._id?merged:p):[...prev,merged]);
    if(apiReady&&!activeGame._id.startsWith('mock_')) {
      try{ const saved=await gamesApi.updateGameProgress(activeGame._id,updates); setActiveProgress(saved); setAllProgress(prev=>prev.map(p=>p.gameId===activeGame._id?saved:p)); }
      catch(err:any){ const msg=err?.response?.data?.message; if(msg) throw new Error(msg); }
    }
  }

  async function handleFavorite(gameId:string) {
    const wasFav=getProgress(gameId)?.isFavorite??false;
    setAllProgress(prev=>prev.map(p=>p.gameId===gameId?{...p,isFavorite:!wasFav}:p));
    showToast(!wasFav?'Added to favourites':'Removed from favourites');
    if(apiReady&&!gameId.startsWith('mock_')){
      gamesApi.toggleFavorite(gameId).catch(()=>{ setAllProgress(prev=>prev.map(p=>p.gameId===gameId?{...p,isFavorite:wasFav}:p)); showToast('Failed to save','error'); });
    }
  }

  function handleShare(name:string){ navigator.clipboard.writeText(`Check out ${name} on Recovery Portal!`).then(()=>showToast('Link copied')).catch(()=>showToast(`Share: ${name}`)); }
  function handleHide(id:string){ setHiddenIds(prev=>new Set([...prev,id])); showToast('Game hidden'); }

  async function handleCheckIn(mood:number,gamesPlayed:string[]=[]) {
    if(apiReady){ const {pointsEarned}=await gamesApi.dailyCheckIn(mood,gamesPlayed); showToast(`Check-in complete — +${pointsEarned} pts`); }
    else showToast('Check-in saved');
    setShowCheckIn(false);
  }

  if(activeGame&&activeProgress) return (
    <><style>{FONT_LINK}</style>
    <GameOverlay game={activeGame} progress={activeProgress}
      onBack={()=>{setActiveGame(null);setActiveProgress(null);}}
      onUpdateProgress={handleUpdateProgress} showToast={showToast}/></>
  );

  const toastBg = toast.type==='error'?'#dc2626':toast.type==='info'?'#3d4f47':'#0a0f0d';

  return (
    <><style>{FONT_LINK}</style>
    <div className="gl-root">

      {/* Toast */}
      <div style={{ position:'fixed',bottom:16,left:16,right:16,margin:'0 auto',maxWidth:420,transform:`translateY(${toast.visible?0:10}px)`,background:toastBg,color:'#fff',padding:'10px 20px',borderRadius:12,fontSize:13,fontWeight:500,zIndex:9999,opacity:toast.visible?1:0,pointerEvents:'none',transition:'all .25s',boxShadow:'0 8px 24px rgba(10,15,13,.2)',textAlign:'center' }}>
        {toast.msg}
      </div>

      <div className="gl-layout" style={{ maxWidth:1220,margin:'0 auto',padding:'28px 20px',display:'grid',gridTemplateColumns:'200px 1fr 260px',gap:24,alignItems:'start' }}>

        {/* ── LEFT SIDEBAR ── */}
        <aside className="gl-sidebar">
          <div className="gl-card" style={{ padding:'20px 14px' }}>
            <p style={{ fontSize:10,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'var(--ink-muted)',marginBottom:12,padding:'0 4px' }}>Categories</p>
            {CATS.map(({ id, label, Icon })=>(
              <button key={id} className="gl-cat-btn"
                style={{ background:category===id?'var(--green-lt)':'transparent', color:category===id?'var(--green)':'var(--ink-light)', fontWeight:category===id?600:400 }}
                onClick={()=>setCategory(id)}>
                <Icon size={15} strokeWidth={1.8}/>
                {label}
              </button>
            ))}
            <div style={{ margin:'16px 0',height:1,background:'var(--border)' }}/>
            <p style={{ fontSize:10,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'var(--ink-muted)',marginBottom:10,padding:'0 4px' }}>My Library</p>
            {[
              { label:'My Streaks',   onClick:()=>{ const g=games.find(x=>x.name==='sober'); if(g) handlePlay(g); } },
              { label:'Achievements', onClick:()=>showToast('Coming soon') },
              { label:'Leaderboard',  onClick:()=>document.getElementById('lb-panel')?.scrollIntoView({behavior:'smooth'}) },
            ].map(item=>(
              <button key={item.label} className="gl-cat-btn"
                style={{ background:'transparent',color:'var(--ink-muted)',fontWeight:400 }}
                onClick={item.onClick}>
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main style={{ minWidth:0 }}>
          <div className="gl-fi" style={{ marginBottom:28 }}>
            <p style={{ fontSize:12,color:'var(--ink-muted)',marginBottom:6,letterSpacing:'.02em' }}>
              Portal &rsaquo; <strong style={{ color:'var(--ink)',fontWeight:600 }}>Recovery Games</strong>
            </p>
            <div style={{ display:'flex',alignItems:'flex-end',justifyContent:'space-between',gap:16 }}>
              <div>
                <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif",fontSize:36,fontWeight:400,color:'var(--ink)',letterSpacing:'-.5px',lineHeight:1.1,marginBottom:6 }}>
                  Games &amp; Challenges
                </h1>
                <p style={{ fontSize:14,color:'var(--ink-muted)',lineHeight:1.5 }}>Turn your recovery into progress. Play daily, build streaks.</p>
              </div>
              {streak>0&&(
                <div style={{ flexShrink:0,display:'flex',alignItems:'center',gap:10,padding:'10px 16px',background:'var(--ink)',borderRadius:14,color:'#fff' }}>
                  <Flame size={18} strokeWidth={2}/>
                  <div>
                    <p style={{ fontSize:13,fontWeight:700,lineHeight:1 }}>{streak}-day streak</p>
                    <p style={{ fontSize:11,color:'rgba(255,255,255,.5)',lineHeight:1,marginTop:2 }}>Keep it going</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filter pills */}
          <div className="gl-fi gl-fi-1" style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:22 }}>
            {CATS.map(({ id, label })=>(
              <button key={id} onClick={()=>setCategory(id)}
                style={{ padding:'6px 16px',borderRadius:999,border:`1.5px solid ${category===id?'var(--ink)':'var(--border)'}`,background:category===id?'var(--ink)':'transparent',color:category===id?'#fff':'var(--ink-muted)',fontSize:12,fontWeight:500,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all .15s' }}>
                {label}
              </button>
            ))}
            {hiddenIds.size>0&&(
              <button onClick={()=>setHiddenIds(new Set())}
                style={{ padding:'6px 16px',borderRadius:999,border:'1.5px dashed var(--border)',background:'transparent',color:'var(--ink-muted)',fontSize:12,cursor:'pointer',fontFamily:"'DM Sans',sans-serif" }}>
                Restore {hiddenIds.size} hidden
              </button>
            )}
          </div>

          {/* Cards */}
          <div className="gl-fi gl-fi-2" style={{ display:'flex',flexDirection:'column',gap:14 }}>
            {visible.length===0?(
              <div className="gl-card" style={{ padding:'64px 32px',textAlign:'center' }}>
                <div style={{ width:56,height:56,borderRadius:16,background:'#f7faf8',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px' }}>
                  <Gamepad2 size={26} color="#7a8f86" strokeWidth={1.5}/>
                </div>
                <p style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:'var(--ink)',marginBottom:8 }}>Nothing here yet</p>
                <p style={{ fontSize:14,color:'var(--ink-muted)' }}>Try a different category or restore hidden games.</p>
              </div>
            ):visible.map((game,i)=>(
              <div key={game._id} className="gl-fi" style={{ animationDelay:`${i*.04}s` }}>
                <GameCard game={game} progress={getProgress(game._id)}
                  onPlay={handlePlay} onFavorite={handleFavorite}
                  onShare={handleShare} onHide={handleHide} showToast={showToast}/>
              </div>
            ))}
          </div>
        </main>

        {/* ── RIGHT SIDEBAR ── */}
        <aside style={{ minWidth:0 }}>

          {/* Recent Activity */}
          <div className="gl-card gl-fi gl-fi-1" style={{ padding:'18px 16px',marginBottom:16 }}>
            <p style={{ fontSize:11,fontWeight:700,letterSpacing:'.09em',textTransform:'uppercase',color:'var(--ink-muted)',marginBottom:14 }}>Recent Activity</p>
            {activity.length===0
              ? <p style={{ fontSize:13,color:'var(--ink-muted)',textAlign:'center',padding:'12px 0' }}>Play a game to see activity</p>
              : activity.map((a,i)=>{
                  const g=a.game as any;
                  const Ic = GAME_ICON[g?.name] ?? Gamepad2;
                  return (
                    <div key={i} className="gl-act-row"
                      onClick={()=>{ const found=games.find(x=>x._id===g?._id||x.name===g?.name); if(found) handlePlay(found); }}>
                      <div style={{ width:36,height:36,minWidth:36,borderRadius:10,background:'var(--off)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                        <Ic size={16} strokeWidth={1.8} color="#3d4f47"/>
                      </div>
                      <div style={{ minWidth:0 }}>
                        <p style={{ fontSize:13,fontWeight:600,color:'var(--ink)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{g?.title??'Game'}</p>
                        <p style={{ fontSize:11,color:'var(--ink-muted)',marginTop:1 }}>{a.currentStreak>0?`${a.currentStreak}-day streak`:'Recently played'}</p>
                      </div>
                    </div>
                  );
                })
            }
          </div>

          {/* Leaderboard */}
          <div id="lb-panel" className="gl-fi gl-fi-2">
            <LeaderboardPanel leaderboard={leaderboard} onShowPrivacy={pts=>setPrivPoints(pts)} showToast={showToast}/>
          </div>

          {/* Progress */}
          <div className="gl-fi gl-fi-3">
            <ProgressCard totalPoints={totalPoints} currentStreak={streak}
              onCheckIn={()=>setShowCheckIn(true)} showToast={showToast}/>
          </div>
        </aside>
      </div>

      {/* Modals */}
      {privPoints!==null&&<PrivacyModal points={privPoints} onClose={()=>setPrivPoints(null)}/>}
      {showCheckIn&&<CheckInModal onClose={()=>setShowCheckIn(false)} onCheckIn={handleCheckIn}
        showToast={showToast} daysSober={daysSober} moneySaved={daysSober*12}
        treesGrown={treesGrown} xpEarned={xpEarned}/>}
    </div></>
  );
}
