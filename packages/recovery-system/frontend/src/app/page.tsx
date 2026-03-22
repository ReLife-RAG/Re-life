// src/app/page.tsx

import React from 'react';
import Link from 'next/link';

const SplashScreen = () => {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-black text-white px-6">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        :root {
          --green: #8CD092;
          --teal: #40738E;
        }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes fadeIn  { from{opacity:0;} to{opacity:1;} }
        @keyframes slowPan {
          0%   { transform:scale(1.08) translate(0,0);      }
          50%  { transform:scale(1.12) translate(-8px,-4px);}
          100% { transform:scale(1.08) translate(0,0);      }
        }
        @keyframes pulseRing {
          0%  { transform:scale(.96); opacity:.5; }
          70% { transform:scale(1.08); opacity:0; }
          100%{ transform:scale(.96); opacity:0;  }
        }
        @keyframes shimmer {
          0%  { background-position:-200% center; }
          100%{ background-position: 200% center; }
        }

        .r1{ animation:fadeUp .8s cubic-bezier(.22,.68,0,1.2) .15s both; }
        .r2{ animation:fadeUp .8s cubic-bezier(.22,.68,0,1.2) .35s both; }
        .r3{ animation:fadeUp .8s cubic-bezier(.22,.68,0,1.2) .55s both; }
        .r4{ animation:fadeUp .8s cubic-bezier(.22,.68,0,1.2) .75s both; }
        .r5{ animation:fadeUp .8s cubic-bezier(.22,.68,0,1.2) .95s both; }
        .r6{ animation:fadeIn  .9s ease 1.1s both; }

        .bg-pan { animation:slowPan 20s ease-in-out infinite; }

        /* ── CTA button ── */
        .btn-cta {
          position:relative; overflow:hidden;
          background:var(--green); color:#081408;
          font-family:'DM Sans',sans-serif;
          font-weight:500; font-size:15px; letter-spacing:.03em;
          padding:15px 0; border:none; border-radius:4px;
          cursor:pointer; width:100%; max-width:300px;
          box-shadow:0 4px 28px rgba(140,208,146,.32);
          transition:background .25s, transform .2s, box-shadow .25s;
        }
        .btn-cta::before{
          content:''; position:absolute; inset:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent);
          background-size:200% 100%; opacity:0; transition:opacity .3s;
        }
        .btn-cta:hover{
          background:#a3e4a0; transform:translateY(-2px);
          box-shadow:0 10px 38px rgba(140,208,146,.44);
        }
        .btn-cta:hover::before{ opacity:1; animation:shimmer 1.2s linear infinite; }
        .btn-cta:active{ transform:translateY(0); }

        /* ── Sign-in ghost link ── */
        .link-ghost{
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:400;
          letter-spacing:.03em; color:rgba(255,255,255,.5); text-decoration:none;
          border-bottom:1px solid transparent;
          transition:color .2s, border-color .2s; padding-bottom:2px;
        }
        .link-ghost:hover{ color:rgba(255,255,255,.88); border-color:rgba(255,255,255,.35); }

        /* ── Feature pills ── */
        .pill{
          display:flex; align-items:center; gap:10px;
          font-family:'DM Sans',sans-serif;
          font-size:11px; font-weight:500; letter-spacing:.1em; text-transform:uppercase;
          color:rgba(255,255,255,.82);
          padding:13px 22px; border-radius:6px;
          background:rgba(255,255,255,.09);
          border:1px solid rgba(255,255,255,.2);
          backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
          transition:background .2s, border-color .2s, color .2s, transform .18s;
          flex:1; justify-content:center; text-align:center;
        }
        .pill:hover{
          background:rgba(140,208,146,.16);
          border-color:rgba(140,208,146,.5);
          color:#fff; transform:translateY(-2px);
        }
        .pill-dot{
          width:7px; height:7px; border-radius:50%;
          background:var(--green); flex-shrink:0;
          box-shadow:0 0 8px rgba(140,208,146,.75);
        }

        /* ── Footer ── */
        .footer-wrap{
          position:absolute; bottom:0; left:0; right:0; z-index:10;
          padding:0 20px 28px;
        }
        .footer-card{
          max-width:860px; margin:0 auto;
          background:rgba(10,20,12,.55);
          border:1px solid rgba(255,255,255,.16);
          border-radius:12px; padding:18px 20px;
          backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px);
          box-shadow:0 -8px 40px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.08);
        }
        .pills-row{
          display:flex; gap:10px; flex-direction:row;
        }

        /* ── Responsive ── */
        @media(max-width:580px){
          .pills-row{ flex-direction:column; gap:8px; }
          .pill{ justify-content:flex-start; }
          .footer-wrap{ padding:0 14px 20px; }
          .footer-card{ padding:14px 14px; }
          .main-pad{ padding-bottom:230px !important; }
          .hide-mobile{ display:none !important; }
        }
        @media(min-width:581px) and (max-width:860px){
          .pills-row{ flex-wrap:wrap; }
          .pill{ flex:0 0 calc(50% - 5px); }
          .main-pad{ padding-bottom:170px !important; }
        }
        @media(min-width:861px){
          .main-pad{ padding-bottom:148px !important; }
        }

        /* side decorative text — only on wide screens */
        .side-deco{
          position:absolute; top:50%; z-index:10; transform:translateY(-50%);
          writing-mode:vertical-rl; font-family:'DM Sans',sans-serif;
          font-size:10px; letter-spacing:.2em; text-transform:uppercase;
          color:rgba(255,255,255,.18);
        }
      `}</style>

      {/* ── BACKGROUND ── */}
      <div className="absolute inset-0 z-0" />

      {/* ── SIDE DECO (wide screens only) ── */}
      <div className="side-deco r6 hide-mobile" style={{ left:22 }}>
        Recovery · Resilience · Renewal
      </div>
      <div className="side-deco r6 hide-mobile" style={{ right:22, transform:'translateY(-50%) rotate(180deg)' }}>
        Re-Life Platform — 2025
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="relative z-10 flex flex-col items-center text-center main-pad" style={{ maxWidth:700, width:'100%' }}>

        {/* Logo + pulse ring */}
        <div className="r1" style={{ position:'relative', marginBottom:32 }}>
          <div style={{
            position:'absolute', inset:-18, borderRadius:'50%',
            border:'1px solid rgba(140,208,146,.22)',
            animation:'pulseRing 3s ease-out infinite',
          }} />
          <img
            src="/images/logo.svg"
            alt="ReLife - Chaos to Crown"
            className="brightness-0 invert"
            style={{ height:50, position:'relative' }}
          />
        </div>

        {/* Eyebrow */}
        <div className="r2" style={{ display:'flex', alignItems:'center', gap:14, marginBottom:22, justifyContent:'center' }}>
          <div style={{ height:1, width:36, background:'linear-gradient(to right, transparent, rgba(140,208,146,.6))', flexShrink:0 }} />
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:500, letterSpacing:'.22em', textTransform:'uppercase', color:'var(--green)', whiteSpace:'nowrap' }}>
            AI-Powered Recovery Companion
          </span>
          <div style={{ height:1, width:36, background:'linear-gradient(to left, transparent, rgba(140,208,146,.6))', flexShrink:0 }} />
        </div>

        {/* Headline */}
        <h1 className="r3" style={{
          fontFamily:"'Cormorant Garamond',Georgia,serif",
          fontSize:'clamp(38px, 7.5vw, 76px)',
          fontWeight:300, lineHeight:1.1,
          letterSpacing:'-.02em', color:'#fff', margin:'0 0 6px',
        }}>
          Your Journey<br />
          <em style={{ fontStyle:'italic', color:'rgba(255,255,255,.7)' }}>Back to Yourself</em>
        </h1>

        {/* Thin divider rule */}
        <div className="r3" style={{ width:1, height:32, background:'linear-gradient(to bottom,rgba(140,208,146,.55),transparent)', margin:'16px auto' }} />

        {/* Subhead */}
        <p className="r4" style={{
          fontFamily:"'DM Sans',sans-serif",
          fontSize:'clamp(13px, 2.2vw, 15.5px)',
          fontWeight:300, lineHeight:1.8,
          color:'rgba(255,255,255,.50)',
          margin:'0 0 40px', maxWidth:440, letterSpacing:'.01em',
        }}>
          24/7 personalized support using advanced RAG technology
          and evidence-based therapy
        </p>

        {/* CTA — identical Link/href logic */}
        <div className="r5" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:18, width:'100%' }}>
          <Link href="/signup" style={{ width:'100%', display:'flex', justifyContent:'center' }}>
            <button className="btn-cta">
              Start Recovery Journey
            </button>
          </Link>

          <Link href="/login" className="link-ghost">
            Already have an account? Sign in
          </Link>
        </div>
      </div>

      {/* ── FOOTER FEATURES ── */}
      <div className="footer-wrap r6">
        {/* separator line */}
        <div style={{
          height:1, maxWidth:860, margin:'0 auto 14px',
          background:'linear-gradient(to right,transparent,rgba(255,255,255,.22),transparent)',
        }} />

        <div className="footer-card">
          <div className="pills-row">
            <div className="pill">
              <span className="pill-dot" />
              Available 24/7
            </div>
            <div className="pill">
              <span className="pill-dot" />
              3 Addiction types supported
            </div>
            <div className="pill">
              <span className="pill-dot" />
              Evidence based Approach
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SplashScreen;