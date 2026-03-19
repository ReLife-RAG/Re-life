"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SUB_NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Counselors", href: "/counselors" },
  { label: "Games", href: "/games" },
  { label: "Library", href: "/resources" },
  { label: "Community", href: "/community" },
];

export default function SubNavBar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/dashboard/";
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-[60px] z-30">
      <div className="flex items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#4caf7d] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 8C8 10 5.9 16.17 3.82 19.52a1 1 0 001.66 1.06C6.94 18.77 9.54 16 17 16v3l4-4-4-4v3z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-sm">Re-Life</span>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center gap-1">
          {SUB_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                isActive(item.href)
                  ? "bg-[#4caf7d] text-white"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Search"
          className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
        <button className="px-4 py-2 rounded-full bg-[#4caf7d] text-white text-sm font-semibold hover:bg-[#3d9e6d] transition-colors shadow-sm">
          Daily Check-in
        </button>
      </div>
    </nav>
  );
}
