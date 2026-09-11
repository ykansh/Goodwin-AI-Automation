import { createClient } from '@supabase/supabase-js';

// ── Supabase Client Singleton ─────────────────────────────────────────────────
// Values come from .env (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).
// Production and Development MUST use the same real Supabase project.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  console.error("CRITICAL: Missing Supabase environment variables (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY). The application will fail to fetch data.");
}

// Always export a valid client instance so the app doesn't crash on render,
// but network requests will naturally fail if the URL is a placeholder.
export const supabase = createClient(
  supabaseUrl || 'https://missing-env-vars.supabase.co', 
  supabaseKey || 'missing-key', 
  {
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
  }
);

// Helper: returns true if supabase is live-connected
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('customers').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}
