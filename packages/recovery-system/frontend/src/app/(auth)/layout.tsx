'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If user is already logged in and NOT in the signup flow, redirect to dashboard
    // We allow /signup/* paths so the customize step works after account creation
    if (!isLoading && isAuthenticated && !pathname.startsWith('/signup')) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Show a minimal loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7FBFE] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#40738E] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FBFE] flex items-center justify-center p-4">
      <div className="w-full max-w-[960px] bg-white rounded-2xl shadow-xl overflow-hidden flex min-h-[600px]">
        {children}
      </div>
    </div>
  );
}
