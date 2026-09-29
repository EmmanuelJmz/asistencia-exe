import { supabase } from './supabaseClient';

class SupabaseAuthRepository {
  async login(username: string, password: string) {
    const email = `${username.toLowerCase().trim()}@admin.local`;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data;
  }

  async logout() {
    await supabase.auth.signOut();
  }

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }

  onAuthStateChange(callback: (session: any) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  }
}

export const supabaseAuth = new SupabaseAuthRepository();
