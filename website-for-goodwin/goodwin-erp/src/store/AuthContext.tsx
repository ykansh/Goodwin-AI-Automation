import {
  createContext, useContext, useState, useEffect, useCallback, type ReactNode
} from 'react';
import type { User, UserRole, AppMode } from '../types';
import { dummyUsers } from '../data/dummyData';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  mode: AppMode;
  isSupabaseMode: boolean;
  setMode: (mode: AppMode) => void;
  signIn: (email: string, password?: string) => Promise<boolean>;
  quickSignInAsRole: (role: UserRole) => void;
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

  // ── Boot: Supabase or localStorage ────────────────────────────────────────
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // Check existing session
      supabase.auth.getSession().then(({ data: { session } }) => {
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
    } else {
      // ── Offline/localStorage fallback ────────────────────────────────────
      const savedUser = localStorage.getItem('goodwin_user');
      setUser(savedUser ? JSON.parse(savedUser) : dummyUsers[0]);
      setIsLoading(false);
    }
  }, []);

  // Persist mode preference
  useEffect(() => {
    localStorage.setItem('goodwin_mode', mode);
  }, [mode]);

  // Persist local user (offline mode only)
  useEffect(() => {
    if (!isSupabaseConfigured && user) {
      localStorage.setItem('goodwin_user', JSON.stringify(user));
    }
  }, [user]);

  // ── Sign In ───────────────────────────────────────────────────────────────
  const signIn = useCallback(async (email: string, password?: string): Promise<boolean> => {
    setIsLoading(true);

    if (isSupabaseConfigured && supabase && password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      setIsLoading(false);
      if (error) {
        toast.error(`Sign in failed: ${error.message}`);
        return false;
      }
      if (data.user) {
        const u = mapSupabaseUser(data.user);
        toast.success(`Welcome back, ${u.full_name}!`);
        return true;
      }
      return false;
    }

    // ── Offline fallback ────────────────────────────────────────────────────
    let found = dummyUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      const lower = email.toLowerCase();
      let role: UserRole = 'admin';
      if (lower.includes('manager'))              role = 'manager';
      else if (lower.includes('account'))         role = 'accounts';
      else if (lower.includes('sales'))           role = 'sales';
      else if (lower.includes('inventory') || lower.includes('stock')) role = 'inventory';

      found = {
        id: crypto.randomUUID(),
        email,
        full_name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        role,
        created_at: new Date().toISOString(),
      };
    }
    setUser(found);
    setIsLoading(false);
    toast.success(`Signed in as ${found.full_name} (${found.role.toUpperCase()})`);
    return true;
  }, []);

  // ── Sign Up ───────────────────────────────────────────────────────────────
  const signUp = useCallback(async (
    email: string,
    password: string,
    full_name: string,
    role: UserRole
  ): Promise<boolean> => {
    setIsLoading(true);

    if (isSupabaseConfigured && supabase) {
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
    }

    // ── Offline fallback ────────────────────────────────────────────────────
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      full_name,
      role,
      created_at: new Date().toISOString(),
    };
    setUser(newUser);
    setIsLoading(false);
    toast.success(`Welcome ${full_name}! Account created as ${role.toUpperCase()}.`);
    return true;
  }, []);

  // ── Quick Role Switch (demo / RBAC testing) ───────────────────────────────
  const quickSignInAsRole = useCallback((role: UserRole) => {
    const roleUser = dummyUsers.find((u) => u.role === role) ?? {
      id: crypto.randomUUID(),
      email: `${role}@goodwin.com`,
      full_name: `Goodwin ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      role,
      created_at: new Date().toISOString(),
    };
    setUser(roleUser);
    toast.success(`Switched role to ${role.toUpperCase()} (${roleUser.full_name})`);
  }, []);

  // ── Sign Out ──────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('goodwin_user');
    toast.success('Signed out successfully');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        mode,
        isSupabaseMode: isSupabaseConfigured,
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
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
