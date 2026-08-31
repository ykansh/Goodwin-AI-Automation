import {
  createContext, useContext, useState, useEffect, useCallback, type ReactNode
} from 'react';
import type { User, UserRole, AppMode } from '../types';
import { dummyUsers, AUTHORIZED_ADMINS } from '../data/dummyData';
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
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    }
  }, []);

  // Persist mode preference
  useEffect(() => {
    localStorage.setItem('goodwin_mode', mode);
  }, [mode]);

  // Persist local user (offline mode only)
  useEffect(() => {
    if (!isSupabaseConfigured) {
      if (user) {
        localStorage.setItem('goodwin_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('goodwin_user');
      }
    }
  }, [user]);

  // ── Sign In ───────────────────────────────────────────────────────────────
  const signIn = useCallback(async (email: string, password?: string): Promise<boolean> => {
    setIsLoading(true);

    const normEmail = email.trim().toLowerCase();
    const cleanPass = (password ?? '').trim();

    // Check predefined authorized admin credentials
    const matchedAdmin = AUTHORIZED_ADMINS.find(
      (a) => a.email.toLowerCase() === normEmail
    );

    if (matchedAdmin) {
      if (cleanPass === matchedAdmin.password) {
        const adminUser: User = {
          id: `admin-${normEmail.replace(/[^a-zA-Z0-9]/g, '-')}`,
          email: matchedAdmin.email,
          full_name: matchedAdmin.full_name,
          role: 'admin',
          created_at: new Date().toISOString(),
        };
        setUser(adminUser);
        localStorage.setItem('goodwin_user', JSON.stringify(adminUser));
        setIsLoading(false);
        toast.success(`Welcome back, ${matchedAdmin.full_name}! (Admin Role Assigned)`);
        return true;
      } else {
        setIsLoading(false);
        toast.error('Incorrect password. Please try again.');
        return false;
      }
    }

    // If Supabase is configured, try Supabase authentication
    if (isSupabaseConfigured && supabase && password) {
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
    }

    // Default admin fallback for admin@goodwin.com
    if (normEmail === 'admin@goodwin.com' && (cleanPass === 'password123' || cleanPass === 'admin@123' || cleanPass === 'admin')) {
      const adminUser: User = {
        id: 'u4',
        email: 'admin@goodwin.com',
        full_name: 'Goodwin Admin',
        role: 'admin',
        created_at: new Date().toISOString(),
      };
      setUser(adminUser);
      localStorage.setItem('goodwin_user', JSON.stringify(adminUser));
      setIsLoading(false);
      toast.success('Welcome back, Goodwin Admin!');
      return true;
    }

    setIsLoading(false);
    toast.error('Invalid email or password. Access restricted to authorized Goodwin personnel.');
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
