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

  const activeItem = NAV_ITEMS.find((item) => isActive(item.href));

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-[#86D293] rounded-xl flex items-center justify-center text-white">
          <BrainCircuit size={24} />
        </div>
        <div className="flex bg-[#F3F7F3] rounded-full p-1 gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
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
  );
}
