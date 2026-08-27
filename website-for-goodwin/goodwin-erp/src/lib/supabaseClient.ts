import { createClient } from '@supabase/supabase-js';

// ── Supabase Client Singleton ─────────────────────────────────────────────────
// Values come from .env (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).
// If the env vars are missing the app runs in offline/localStorage mode.

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string | undefined;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

// Helper: returns true if supabase is live-connected
export async function checkSupabaseConnection(): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('customers').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}
