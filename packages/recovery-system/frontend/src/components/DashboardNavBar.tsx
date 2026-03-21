"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrainCircuit, LayoutDashboard, UserCheck, Gamepad2, BookOpen, Users } from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Counselors", icon: UserCheck, href: "/counselors" },
  { name: "Games", icon: Gamepad2, href: "/games" },
  { name: "Library", icon: BookOpen, href: "/resources" },
  { name: "Community", icon: Users, href: "/community" },
];

export default function DashboardNavBar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/dashboard/";
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="w-full">
      <div className="flex items-start gap-2 sm:items-center">
        <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-[#86D293] flex items-center justify-center text-white">
          <BrainCircuit size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-3 gap-1 rounded-2xl bg-[#F3F7F3] p-1 sm:flex sm:flex-wrap sm:rounded-full">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`whitespace-nowrap rounded-full px-2.5 py-2 text-center text-[11px] font-medium transition-all sm:px-4 sm:text-sm ${
                  isActive(item.href)
                    ? "bg-[#86D293] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
