'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Game, GameProgress } from '@/types/games.types';

const CAT_BG:  Record<string, string> = { 
  substance:'#e6f7ec', 
  social:'#e6f0fc', 
  behavioral:'#f0e8fb', 
  pornography:'#fdf4e3', 
  screen:'#fdf4e3',
  mindfulness:'#e6fffa'
};
const CAT_DOT: Record<string, string> = { 
  substance:'#5bbf7a', 
  social:'#5b9bf8', 
  behavioral:'#a67dd4', 
  pornography:'#e8a020', 
  screen:'#e05555',
  mindfulness:'#14b8a6'
};
const CAT_TAG: Record<string, string> = { 
  substance:'Drug & Substance Recovery', 
  social:'Social Media Addiction', 
  behavioral:'General Behavioral Addiction', 
  pornography:'Pornography Addiction', 
  screen:'Screen Time Addiction',
  mindfulness:'Mindfulness & Meditation'
};

interface Props {
  game: Game;
  progress?: GameProgress;
  onPlay:    (g: Game) => void;
  onFavorite:(id: string) => void;
  onShare:   (name: string) => void;
  onHide:    (id: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

function DDBtn({ label, onClick, red }: { label: string; onClick: () => void; red: boolean }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '9px',
        width: '100%', padding: '10px 13px',
        fontSize: '12.5px', fontWeight: 500,
        color: red ? '#e05555' : '#1a2e26',
        background: h ? (red ? '#fff5f5' : '#f4f6f5') : 'transparent',
        border: 'none', cursor: 'pointer', textAlign: 'left',
        transition: 'background .12s',
      }}
    >
      {label}
    </button>
  );
}

export default function GameCard({ game, progress, onPlay, onFavorite, onShare, onHide }: Props) {
  const [ddOpen, setDdOpen] = useState(false);
  const [hCard,  setHCard]  = useState(false);
  const [hPlay,  setHPlay]  = useState(false);
  const ddRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!ddRef.current?.contains(e.target as Node)) setDdOpen(false);
    };
    if (ddOpen) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [ddOpen]);

  const bg  = CAT_BG[game.category]  ?? '#e6f7ec';
  const dot = CAT_DOT[game.category] ?? '#5bbf7a';
  const tag = CAT_TAG[game.category] ?? game.category;

  return (
    <div
      onMouseEnter={() => setHCard(true)}
      onMouseLeave={() => setHCard(false)}
      style={{
        background: '#fff',
        border: '1px solid #e2ebe6',
        borderRadius: '14px',
        padding: '20px 22px',
        boxShadow: hCard ? '0 6px 20px rgba(60,100,80,.13)' : '0 2px 12px rgba(60,100,80,.07)',
        transform: hCard ? 'translateY(-1px)' : 'none',
        transition: 'box-shadow .2s, transform .15s',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Top row ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '12px' }}>

        {/* Icon button */}
        <button
          onClick={() => onPlay(game)}
          style={{
            width: '50px', height: '50px', minWidth: '50px',
            borderRadius: '13px', border: 'none', cursor: 'pointer',
            background: bg, fontSize: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {game.icon}
        </button>

        {/* Title + tag */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a2e26', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {game.title}
            {progress?.isFavorite && <span style={{ color: '#e8a020', fontSize: '13px' }}>⭐</span>}
          </div>
          <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#3a8a58', background: '#e6f5ec', borderRadius: '20px', padding: '2px 10px', display: 'inline-block' }}>
            {tag}
          </span>
        </div>

        {/* Play + dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0 }}>
          <button
            onClick={() => onPlay(game)}
            onMouseEnter={() => setHPlay(true)}
            onMouseLeave={() => setHPlay(false)}
            style={{
              background: hPlay ? '#52b56e' : '#6dcb88',
              color: '#fff', border: 'none', borderRadius: '20px',
              padding: '7px 16px', fontSize: '12.5px', fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'background .15s',
            }}
          >
            ▶ Play Now
          </button>

          <div style={{ position: 'relative' }} ref={ddRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setDdOpen(!ddOpen); }}
              style={{
                width: '30px', height: '30px', borderRadius: '50%',
                border: `1.5px solid ${ddOpen ? '#5bbf7a' : '#e2ebe6'}`,
                background: ddOpen ? '#e8f7ee' : 'transparent',
                color: ddOpen ? '#5bbf7a' : '#7a8f86',
                fontSize: '17px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              ⋯
            </button>

            {ddOpen && (
              <div style={{
                position: 'absolute', top: '36px', right: 0,
                background: '#fff', border: '1px solid #e2ebe6',
                borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,.12)',
                width: '178px', zIndex: 500, overflow: 'hidden',
              }}>
                <DDBtn label="▶ Play Game"    onClick={() => { onPlay(game); setDdOpen(false); }} red={false} />
                <DDBtn label={progress?.isFavorite ? '⭐ Favourited' : '⭐ Favourite'} onClick={() => { onFavorite(game._id); setDdOpen(false); }} red={false} />
                <DDBtn label="📨 Share"        onClick={() => { onShare(game.title); setDdOpen(false); }} red={false} />
                <div style={{ height: '1px', background: '#e2ebe6' }} />
                <DDBtn label="🚫 Hide Game"   onClick={() => { onHide(game._id); setDdOpen(false); }} red={true} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: '13px', color: '#4a6358', lineHeight: 1.65, margin: '0 0 14px' }}>
        {game.description}
      </p>

      {/* Feature chips — clicking opens the game, NO title attribute (prevents browser popup) */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
        {game.features.map(f => (
          <button
            key={f}
            onClick={() => onPlay(game)}
            style={{
              background: '#f4f6f5',
              border: '1px solid #e2ebe6',
              borderRadius: '20px',
              padding: '3px 11px',
              fontSize: '11.5px',
              color: '#7a8f86',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all .15s',
              // NO title="" here — that was causing the browser native tooltip popup
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e8f7ee'; e.currentTarget.style.color = '#5bbf7a'; e.currentTarget.style.borderColor = '#5bbf7a'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f4f6f5'; e.currentTarget.style.color = '#7a8f86'; e.currentTarget.style.borderColor = '#e2ebe6'; }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingTop: '12px', borderTop: '1px solid #e2ebe6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#7a8f86', fontWeight: 500 }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: dot, flexShrink: 0 }} />
          {game.activePlayers.toLocaleString()} active players
        </div>
        <div style={{ fontSize: '12px', color: '#7a8f86', fontWeight: 500 }}>⭐ {game.rating}</div>
        <div style={{ flex: 1, height: '5px', background: '#f4f6f5', borderRadius: '4px', overflow: 'hidden', maxWidth: '90px', marginLeft: 'auto' }}>
          <div style={{ height: '100%', width: `${Math.round((game.rating / 5) * 100)}%`, background: dot, borderRadius: '4px' }} />
        </div>
      </div>
    </div>
  );
}