import { createClient } from '@supabase/supabase-js';
import { config, isSupabaseConfigured } from './config.js';

export const supabase = isSupabaseConfigured()
  ? createClient(config.supabaseUrl, config.supabaseAnonKey)
  : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.');
  }

  return supabase;
}
