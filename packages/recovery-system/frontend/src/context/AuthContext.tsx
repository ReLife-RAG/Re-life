'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  AuthUser,
  getSession,
  signIn as apiSignIn,
  signUp as apiSignUp,
  signOut as apiSignOut,
  updateProfile as apiUpdateProfile,
} from '@/lib/auth-client';

// ─── Context Types ───────────────────────────────────────────────

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Parameters<typeof apiUpdateProfile>[0]) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const session = await getSession();
      setUser(session?.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const handleSignIn = async (email: string, password: string) => {
    const result = await apiSignIn({ email, password });
    if (result.user) {
      setUser(result.user);
    }
  };

  const handleSignUp = async (name: string, email: string, password: string) => {
    const result = await apiSignUp({ name, email, password });
    if (result.user) {
      setUser(result.user);
    }
  };

  const handleSignOut = async () => {
    await apiSignOut();
    setUser(null);
  };

  const handleUpdateProfile = async (data: Parameters<typeof apiUpdateProfile>[0]) => {
    const result = await apiUpdateProfile(data);
    if (result.user) {
      setUser(result.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        updateProfile: handleUpdateProfile,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
