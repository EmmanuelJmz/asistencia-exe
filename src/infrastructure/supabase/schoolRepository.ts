import { supabase } from './supabaseClient';

class SupabaseSchoolRepository {
  private async fetchAllRows(table: 'attendance_records' | 'grades') {
    const pageSize = 1_000;
    const records: unknown[] = [];

    for (let from = 0; ; from += pageSize) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('id', { ascending: true })
        .range(from, from + pageSize - 1);

      if (error || !data) return { data: null, error };
      records.push(...data);
      if (data.length < pageSize) return { data: records, error: null };
    }
  }

  fetchAllTables() {
    return Promise.all([
      supabase.from('groups').select('*'),
      supabase.from('students').select('*'),
      supabase.from('attendance_sessions').select('*'),
      this.fetchAllRows('attendance_records'),
      supabase.from('subjects').select('*'),
      supabase.from('periods').select('*'),
      supabase.from('activities').select('*'),
      this.fetchAllRows('grades'),
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
