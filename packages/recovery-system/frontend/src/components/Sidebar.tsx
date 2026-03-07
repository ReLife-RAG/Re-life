'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  UserCheck,
  BookOpen,
  Gamepad2,
  MessageSquare,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard',   href: '/dashboard',  Icon: LayoutDashboard },
  { label: 'Progress',    href: '/progress',   Icon: TrendingUp },
  { label: 'Community',   href: '/community',  Icon: Users },
  { label: 'Counselors',  href: '/counselors', Icon: UserCheck },
  { label: 'Resources',   href: '/resources',  Icon: BookOpen },
  { label: 'Games',       href: '/games',      Icon: Gamepad2 },
  { label: 'AI Chat',     href: '/chat',       Icon: MessageSquare },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0">
      <nav className="bg-white rounded-2xl p-3 shadow-sm border border-[#E8F0F5] sticky top-6">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ label, href, Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    active
                      ? 'bg-[#1B2A3D] text-white'
                      : 'text-[#1B2A3D]/60 hover:bg-[#EAF4FB] hover:text-[#1B2A3D]'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
