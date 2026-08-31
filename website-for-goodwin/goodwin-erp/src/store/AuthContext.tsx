import {
  createContext, useContext, useState, useEffect, useCallback, type ReactNode
} from 'react';
import type { User, UserRole, AppMode } from '../types';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  mode: AppMode;
  isSupabaseMode: boolean; // Kept for backwards compatibility if referenced, hardcoded to true
  setMode: (mode: AppMode) => void;
  signIn: (email: string, password?: string) => Promise<boolean>;
  quickSignInAsRole: (role: UserRole) => void; // Deprecated, will show error
  signUp: (email: string, password: string, full_name: string, role: UserRole) => Promise<boolean>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Map Supabase user metadata → our User type ────────────────────────────────
function mapSupabaseUser(sbUser: import('@supabase/supabase-js').User): User {
  const meta = sbUser.user_metadata ?? {};
  return {
    id: sbUser.id,
    email: sbUser.email ?? '',
    full_name: meta.full_name ?? sbUser.email?.split('@')[0] ?? 'User',
    role: (meta.role as UserRole) ?? 'admin',
    created_at: sbUser.created_at ?? new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<AppMode>(() => {
    const savedMode = localStorage.getItem('goodwin_mode') as AppMode;
    return savedMode || 'erp';
  });

  // ── Boot: Supabase ────────────────────────────────────────
  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('[Supabase Auth] Session fetch error:', error);
      }
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Persist mode preference
  useEffect(() => {
    localStorage.setItem('goodwin_mode', mode);
  }, [mode]);

  // ── Sign In ───────────────────────────────────────────────────────────────
  const signIn = useCallback(async (email: string, password?: string): Promise<boolean> => {
    setIsLoading(true);

    const normEmail = email.trim().toLowerCase();
    const cleanPass = (password ?? '').trim();

    if (!cleanPass) {
      setIsLoading(false);
      toast.error('Password is required');
      return false;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email: normEmail, password: cleanPass });
    setIsLoading(false);
    
    if (error) {
      toast.error(`Sign in failed: ${error.message}`);
      return false;
    }
    if (data.user) {
      const u = mapSupabaseUser(data.user);
      toast.success(`Welcome, ${u.full_name}!`);
      return true;
    }
    return false;
  }, []);

  // ── Sign Up ───────────────────────────────────────────────────────────────
  const signUp = useCallback(async (
    email: string,
    password: string,
    full_name: string,
    role: UserRole
  ): Promise<boolean> => {
    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, role },
      },
    });
    
    setIsLoading(false);
    
    if (error) {
      toast.error(`Registration failed: ${error.message}`);
      return false;
    }
    if (data.user) {
      toast.success(`Welcome, ${full_name}! Check your email to verify your account.`);
      return true;
    }
    return false;
  }, []);

  // ── Quick Role Switch (demo / RBAC testing) ───────────────────────────────
  const quickSignInAsRole = useCallback((_role: UserRole) => {
    toast.error('Demo mode disabled. Quick sign in is no longer supported in production.');
  }, []);

  // ── Sign Out ──────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success('Signed out successfully');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        mode,
        isSupabaseMode: true, // Always true now
        setMode,
        signIn,
        quickSignInAsRole,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
