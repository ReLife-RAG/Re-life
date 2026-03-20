'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getStreak } from '@/lib/auth-client';
import DashboardNavBar from '@/components/DashboardNavBar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dayCount, setDayCount] = useState(0);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch real streak for header
  useEffect(() => {
    if (isAuthenticated) {
      getStreak()
        .then((data) => setDayCount(data.currentStreak))
        .catch(() => setDayCount(0));
    }
  }, [isAuthenticated]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7FBFE] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#40738E] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <div className="min-h-screen bg-[#F7FBFE]">
      {/* Header */}
      <header className="bg-[#1B2A3D] shadow-lg">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center">
              <img src="/images/logo.svg" alt="ReLife" className="h-10 brightness-0 invert" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                { href: '/dashboard', label: 'Dashboard' },
                { href: '/games', label: 'Games' },
                { href: '/progress', label: 'Progress' },
                { href: '/community', label: 'Community' },
                { href: '/resources', label: 'Resources' },
                { href: '/chat', label: 'AI Chat' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    pathname === item.href
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right: notification + profile */}
            <div className="flex items-center gap-4">
              {/* Notification bell */}
              <button aria-label="Notifications" className="relative text-white/60 hover:text-white transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#8CD092] rounded-full" />
              </button>

              {/* Profile */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-white text-sm font-semibold leading-tight">{user?.name || 'User'}</p>
                  <p className="text-white/50 text-xs">Day {dayCount}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#40738E] to-[#8CD092] flex items-center justify-center text-white font-bold text-sm">
                  {firstName.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="text-white/40 hover:text-white transition"
                title="Sign Out"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>

              {/* Mobile menu button */}
              <button
                aria-label="Toggle menu"
                className="md:hidden text-white/60 hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-3 pt-3 border-t border-white/10 flex flex-col gap-1">
              {[
                { href: '/dashboard', label: 'Dashboard' },
                { href: '/games', label: 'Games' },
                { href: '/progress', label: 'Progress' },
                { href: '/community', label: 'Community' },
                { href: '/resources', label: 'Resources' },
                { href: '/chat', label: 'AI Chat' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    pathname === item.href
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleSignOut}
                className="px-3 py-2 text-left rounded-lg text-sm font-medium text-red-400 hover:bg-white/5 transition"
              >
                Sign Out
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content Container with Rounded Box */}
      <div className="bg-white rounded-[40px] shadow-xl overflow-hidden my-4 mx-2 md:mx-4">
        {/* Global Navigation Bar */}
        <div className="p-6 lg:p-10">
          <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <DashboardNavBar />
          </header>

          {/* Page Content */}
          <div className="max-w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
