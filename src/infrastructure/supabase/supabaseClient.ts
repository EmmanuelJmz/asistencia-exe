import { createClient } from '@supabase/supabase-js';
import { authStorage } from './authStorage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const fetchWithoutCache: typeof fetch = (input, init) => fetch(input, { ...init, cache: 'no-store' });

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    // Attendance must be re-read after each save. Never reuse a cached REST response.
    fetch: fetchWithoutCache,
  },
  auth: {
    storage: authStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
