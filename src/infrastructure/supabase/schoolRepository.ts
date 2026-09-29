import { supabase } from './supabaseClient';

class SupabaseSchoolRepository {
  fetchAllTables() {
    return Promise.all([
      supabase.from('groups').select('*'),
      supabase.from('students').select('*'),
      supabase.from('attendance_sessions').select('*'),
      supabase.from('attendance_records').select('*'),
      supabase.from('subjects').select('*'),
      supabase.from('periods').select('*'),
      supabase.from('activities').select('*'),
      supabase.from('grades').select('*'),
      supabase.from('settings').select('*').limit(1),
      supabase.from('security_config').select('*').limit(1),
      supabase.from('teacher_notes').select('*'),
    ]);
  }

  upsert(table: string, data: unknown): void {
    if (!import.meta.env.VITE_SUPABASE_URL) return;

    supabase.from(table).upsert(data).then(({ error }) => {
      if (error) console.error(`Error syncing ${table}:`, error);
    });
  }

  delete(table: string, id: string): void {
    if (!import.meta.env.VITE_SUPABASE_URL) return;
    supabase.from(table).delete().eq('id', id).then();
  }
}

export const supabaseSchoolRepository = new SupabaseSchoolRepository();
