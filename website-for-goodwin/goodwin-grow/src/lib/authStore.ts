import { create } from 'zustand';
import { supabase } from './supabase';

export type Role = 'admin' | 'employee' | null;

interface AuthState {
  userEmail: string | null;
  role: Role;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (email: string | null, role: Role) => void;
  checkSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  userEmail: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (email, role) => set({ userEmail: email, role, isAuthenticated: !!email, isLoading: false }),
  
  checkSession: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        // Fetch role from app_users
        const { data } = await supabase
          .from('app_users')
          .select('role')
          .eq('email', session.user.email)
          .single();
          
        set({ 
          userEmail: session.user.email, 
          role: data?.role || 'employee', 
          isAuthenticated: true,
          isLoading: false 
        });
      } else {
        set({ userEmail: null, role: null, isAuthenticated: false, isLoading: false });
      }
    } catch (err) {
      console.error('Session check failed', err);
      set({ userEmail: null, role: null, isAuthenticated: false, isLoading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ userEmail: null, role: null, isAuthenticated: false });
  }
}));
