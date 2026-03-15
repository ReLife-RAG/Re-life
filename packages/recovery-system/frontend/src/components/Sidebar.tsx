"use client";

// =============================================================================
// Sidebar.tsx
// The persistent left navigation sidebar for the entire dashboard.
// Uses Next.js `usePathname` to automatically highlight the active route.
// Includes: logo, all nav links, a recovery streak badge, and user profile footer.
// Place this inside (dashboard)/layout.tsx so it appears on every dashboard page.
// =============================================================================

import Link from "next/link";
import { usePathname } from "next/navigation";

// ── Nav Items ────────────────────────────────────────────────────────────────
// Each entry maps a label to its route and an SVG icon path.
// Add or remove entries here to update the sidebar navigation.
const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "AI Chat",
    href: "/chat",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    label: "Counselors",
    href: "/counselors",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: "Progress",
    href: "/progress",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: "Games",
    href: "/games",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    ),
  },
  {
    label: "Library",
    href: "/resources",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    label: "Community",
    href: "/community",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  // Detects current route so we can highlight the matching nav item
  const pathname = usePathname();

  // Checks if the current path starts with the nav item's href
  // (e.g. /counselors/123 still highlights the Counselors link)
  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-[#0f1a14] border-r border-white/5 shrink-0">

      {/* ── Logo ────────────────────────────────────────────────────────── */}
      <div className="px-5 py-6 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          {/* Leaf icon in a green rounded square */}
          <div className="w-9 h-9 rounded-xl bg-[#4caf7d] flex items-center justify-center shadow-lg shadow-[#4caf7d]/20 group-hover:shadow-[#4caf7d]/40 transition-shadow">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 8C8 10 5.9 16.17 3.82 19.52a1 1 0 001.66 1.06C6.94 18.77 9.54 16 17 16v3l4-4-4-4v3z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-base leading-none tracking-wide">Re-Life</p>
            <p className="text-white/30 text-xs mt-0.5">Recovery Platform</p>
          </div>
        </Link>
      </div>

      {/* ── Streak Badge ─────────────────────────────────────────────────
          Shows the user's current recovery streak. 
          Replace the hardcoded "12" with real streak data from your API. 
      ── */}
      <div className="mx-4 mt-5 mb-2 rounded-xl bg-gradient-to-r from-[#4caf7d]/20 to-[#2d7a55]/10 border border-[#4caf7d]/20 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#4caf7d]/20 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-[#4caf7d]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
          </svg>
        </div>
        <div>
          <p className="text-[#4caf7d] font-bold text-sm leading-none">12 Day Streak</p>
          <p className="text-white/30 text-xs mt-1">Keep it going! 🔥</p>
        </div>
      </div>

      {/* ── Navigation Links ─────────────────────────────────────────────
          Renders each nav item. Active item gets a green left border,
          green icon, and a subtle green background.
      ── */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {/* Section label */}
        <p className="text-white/20 text-xs font-semibold uppercase tracking-widest px-3 pb-2 pt-1">
          Menu
        </p>

        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150 group relative
                ${active
                  ? "bg-[#4caf7d]/10 text-[#4caf7d] border border-[#4caf7d]/20"
                  : "text-white/40 hover:text-white/80 hover:bg-white/5"
                }
              `}
            >
              {/* Active indicator bar on the left edge */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#4caf7d] rounded-full" />
              )}

              {/* Icon — green when active, muted when not */}
              <span className={`shrink-0 transition-colors ${active ? "text-[#4caf7d]" : "text-white/30 group-hover:text-white/60"}`}>
                {item.icon}
              </span>

              <span>{item.label}</span>

              {/* "NEW" badge on AI Chat to draw attention */}
              {item.label === "AI Chat" && (
                <span className="ml-auto text-[10px] font-bold bg-[#4caf7d]/20 text-[#4caf7d] px-1.5 py-0.5 rounded-full border border-[#4caf7d]/30">
                  NEW
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Daily Check-in Button ────────────────────────────────────────
          Persistent CTA to encourage users to log their daily check-in.
          Wire this to your POST /api/progress/checkin endpoint.
      ── */}
      <div className="px-4 pb-4">
        <button className="w-full py-2.5 rounded-xl bg-[#4caf7d] hover:bg-[#3d9e6d] text-white text-sm font-semibold transition-all shadow-lg shadow-[#4caf7d]/20 hover:shadow-[#4caf7d]/30 flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Daily Check-in
        </button>
      </div>

      {/* ── User Profile Footer ──────────────────────────────────────────
          Shows the logged-in user's avatar, name, and a settings link.
          Replace the hardcoded name/email with data from AuthContext.
      ── */}
      <div className="border-t border-white/5 px-4 py-4 flex items-center gap-3">
        {/* Avatar circle with user initials */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4caf7d] to-[#2d7a55] flex items-center justify-center shrink-0">
          <span className="text-white text-sm font-bold">U</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white/80 text-sm font-medium truncate">User Name</p>
          <p className="text-white/30 text-xs truncate">Recovery Journey</p>
        </div>
        {/* Settings icon */}
        <Link href="/settings" className="text-white/20 hover:text-white/60 transition-colors shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
      </div>

    </aside>
  );
}
