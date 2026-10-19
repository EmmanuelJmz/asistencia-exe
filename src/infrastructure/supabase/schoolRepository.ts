import { supabase } from './supabaseClient';

class SupabaseSchoolRepository {
  fetchAllTables() {
    return Promise.all([
      supabase.from('groups').select('*'),
      supabase.from('students').select('*'),
      supabase.from('attendance_sessions').select('*'),
      // Attendance history is loaded as a complete set. An explicit range avoids a
      // backend/default pagination limit silently making a complete roll call appear incomplete.
      supabase.from('attendance_records').select('*').range(0, 9_999),
      supabase.from('subjects').select('*'),
      supabase.from('periods').select('*'),
      supabase.from('activities').select('*'),
      supabase.from('grades').select('*'),
      supabase.from('settings').select('*').limit(1),
      supabase.from('security_config').select('*').limit(1),
      supabase.from('teacher_notes').select('*'),
    ]);
  }

  async upsert(table: string, data: unknown): Promise<void> {
    if (!import.meta.env.VITE_SUPABASE_URL) return;

    const { error } = await supabase.from(table).upsert(data);
    if (error) throw error;
  }

  async delete(table: string, id: string): Promise<void> {
    if (!import.meta.env.VITE_SUPABASE_URL) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  }
}

export const supabaseSchoolRepository = new SupabaseSchoolRepository();
