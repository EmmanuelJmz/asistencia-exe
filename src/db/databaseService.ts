import { Group, Student, AttendanceSession, AttendanceRecord, AttendanceStatus, StudentStatus, Subject, Period, Grade, GradeCategory, Activity, ActivityType, SecurityConfig, DatabaseStats, UserSettings } from '../types';
import { supabase } from '../supabaseClient';

const STORAGE_KEYS = {
  GROUPS: 'edugestion_prod_groups_v2',
  STUDENTS: 'edugestion_prod_students_v2',
  SESSIONS: 'edugestion_prod_sessions_v2',
  ATTENDANCE: 'edugestion_prod_attendance_v2',
  SUBJECTS: 'edugestion_prod_subjects_v2',
  PERIODS: 'edugestion_prod_periods_v2',
  GRADES: 'edugestion_prod_grades_v2',
  ACTIVITIES: 'edugestion_prod_activities_v2',
  SECURITY: 'edugestion_prod_security_v2',
  SETTINGS: 'edugestion_prod_settings_v2',
};

class SupabaseService {
  // Local cache
  private groups: Group[] = [];
  private students: Student[] = [];
  private sessions: AttendanceSession[] = [];
  private attendanceRecords: AttendanceRecord[] = [];
  private subjects: Subject[] = [];
  private periods: Period[] = [];
  private activities: Activity[] = [];
  private grades: Grade[] = [];
  private security: SecurityConfig = { id: 'sec-1', pin: '1234', failedAttempts: 0, lockedUntilTimestamp: 0 };
  private settings: UserSettings = { teacherName: 'Profesor Titular', schoolName: 'Escuela Secundaria', theme: 'light', fontSize: 'normal', autoLockMinutes: 10 };

  constructor() {
    this.loadFromLocal();
  }

  private loadFromLocal() {
    try {
      const g = localStorage.getItem(STORAGE_KEYS.GROUPS); if(g) this.groups = JSON.parse(g);
      const s = localStorage.getItem(STORAGE_KEYS.STUDENTS); if(s) this.students = JSON.parse(s);
      const se = localStorage.getItem(STORAGE_KEYS.SESSIONS); if(se) this.sessions = JSON.parse(se);
      const a = localStorage.getItem(STORAGE_KEYS.ATTENDANCE); if(a) this.attendanceRecords = JSON.parse(a);
      const su = localStorage.getItem(STORAGE_KEYS.SUBJECTS); if(su) this.subjects = JSON.parse(su);
      const p = localStorage.getItem(STORAGE_KEYS.PERIODS); if(p) this.periods = JSON.parse(p);
      const ac = localStorage.getItem(STORAGE_KEYS.ACTIVITIES); if(ac) this.activities = JSON.parse(ac);
      const gr = localStorage.getItem(STORAGE_KEYS.GRADES); if(gr) this.grades = JSON.parse(gr);
      const sec = localStorage.getItem(STORAGE_KEYS.SECURITY); if(sec) this.security = JSON.parse(sec);
      const set = localStorage.getItem(STORAGE_KEYS.SETTINGS); if(set) this.settings = JSON.parse(set);
    } catch(e) {}
  }

  private persistLocal(key: string, data: any) {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch(e) {}
  }

  public async loadFromCloud() {
    try {
      const [grp, stu, ses, att, sub, per, act, grd] = await Promise.all([
        supabase.from('groups').select('*'),
        supabase.from('students').select('*'),
        supabase.from('attendance_sessions').select('*'),
        supabase.from('attendance_records').select('*'),
        supabase.from('subjects').select('*'),
        supabase.from('periods').select('*'),
        supabase.from('activities').select('*'),
        supabase.from('grades').select('*')
      ]);
      if (grp.data && grp.data.length > 0) { this.groups = grp.data; this.persistLocal(STORAGE_KEYS.GROUPS, this.groups); }
      if (stu.data && stu.data.length > 0) { this.students = stu.data; this.persistLocal(STORAGE_KEYS.STUDENTS, this.students); }
      if (ses.data && ses.data.length > 0) { this.sessions = ses.data; this.persistLocal(STORAGE_KEYS.SESSIONS, this.sessions); }
      if (att.data && att.data.length > 0) { this.attendanceRecords = att.data; this.persistLocal(STORAGE_KEYS.ATTENDANCE, this.attendanceRecords); }
      if (sub.data && sub.data.length > 0) { this.subjects = sub.data; this.persistLocal(STORAGE_KEYS.SUBJECTS, this.subjects); }
      if (per.data && per.data.length > 0) { this.periods = per.data; this.persistLocal(STORAGE_KEYS.PERIODS, this.periods); }
      if (act.data && act.data.length > 0) { this.activities = act.data; this.persistLocal(STORAGE_KEYS.ACTIVITIES, this.activities); }
      if (grd.data && grd.data.length > 0) { this.grades = grd.data; this.persistLocal(STORAGE_KEYS.GRADES, this.grades); }
      
      this.ensureGlobalPool();
    } catch (e) {
      console.error('Error loading from cloud, using local cache', e);
      this.ensureGlobalPool();
    }
  }

  private ensureGlobalPool() {
    if (!this.groups.find(g => g.id === 'grp-global-pool')) {
      const globalGrp: Group = {
        id: 'grp-global-pool',
        name: 'Directorio Global de Alumnos',
        grade: '-',
        section: '-',
        shift: 'Matutino',
        schoolYear: '-',
        colorHex: '#94a3b8',
        createdAt: new Date().toISOString()
      };
      this.groups.push(globalGrp);
      this.persistLocal(STORAGE_KEYS.GROUPS, this.groups);
      this.bgUpsert('groups', globalGrp);
    }
  }

  private async bgUpsert(table: string, data: any) {
    if(!import.meta.env.VITE_SUPABASE_URL) return;
    supabase.from(table).upsert(data).then(res => {
        if(res.error) console.error(`Error syncing ${table}:`, res.error);
    });
  }
  private async bgDelete(table: string, id: string) {
    if(!import.meta.env.VITE_SUPABASE_URL) return;
    supabase.from(table).delete().eq('id', id).then();
  }

  // ==================== GROUPS ====================
  public getGroups(): Group[] { return this.groups.filter(g => g.id !== 'grp-global-pool'); }
  public getGroupById(id: string): Group | undefined { return this.groups.find(g => g.id === id); }
  public addGroup(data: Omit<Group, 'id' | 'createdAt'>): Group {
    const newGroup: Group = { ...data, id: 'grp-' + Date.now().toString(36), createdAt: new Date().toISOString() };
    this.groups.push(newGroup);
    this.persistLocal(STORAGE_KEYS.GROUPS, this.groups);
    this.bgUpsert('groups', newGroup);
    return newGroup;
  }
  public updateGroup(updated: Group): void {
    this.groups = this.groups.map(g => g.id === updated.id ? updated : g);
    this.persistLocal(STORAGE_KEYS.GROUPS, this.groups);
    this.bgUpsert('groups', updated);
  }
  public deleteGroup(id: string): void {
    this.groups = this.groups.filter(g => g.id !== id);
    this.students = this.students.filter(s => s.groupId !== id);
    this.sessions = this.sessions.filter(s => s.groupId !== id);
    this.grades = this.grades.filter(g => g.groupId !== id);
    this.persistLocal(STORAGE_KEYS.GROUPS, this.groups);
    this.persistLocal(STORAGE_KEYS.STUDENTS, this.students);
    this.persistLocal(STORAGE_KEYS.SESSIONS, this.sessions);
    this.persistLocal(STORAGE_KEYS.GRADES, this.grades);
    this.bgDelete('groups', id);
  }

  // ==================== STUDENTS ====================
  public getStudents(groupId?: string): Student[] {
    if (groupId) return this.students.filter(s => s.groupId === groupId).sort((a,b) => a.rollNumber - b.rollNumber);
    return [...this.students].sort((a,b) => a.rollNumber - b.rollNumber);
  }
  public getStudentById(id: string): Student | undefined { return this.students.find(s => s.id === id); }
  public addStudent(data: Omit<Student, 'id' | 'createdAt'>): Student {
    const nextRoll = data.rollNumber || (this.getStudents(data.groupId).length + 1);
    const newStudent: Student = { ...data, rollNumber: nextRoll, id: 'stu-' + Date.now().toString(36), createdAt: new Date().toISOString() };
    this.students.push(newStudent);
    this.persistLocal(STORAGE_KEYS.STUDENTS, this.students);
    this.bgUpsert('students', newStudent);
    return newStudent;
  }
  public updateStudent(updated: Student): void {
    this.students = this.students.map(s => s.id === updated.id ? updated : s);
    this.persistLocal(STORAGE_KEYS.STUDENTS, this.students);
    this.bgUpsert('students', updated);
  }
  public updateStudentStatus(id: string, status: StudentStatus): void {
    const s = this.getStudentById(id);
    if(s) { s.status = status; this.persistLocal(STORAGE_KEYS.STUDENTS, this.students); this.bgUpsert('students', s); }
  }
  public moveStudentToGroup(studentId: string, newGroupId: string): void {
    const s = this.getStudentById(studentId);
    if(s) { s.groupId = newGroupId; s.rollNumber = this.getStudents(newGroupId).length + 1; this.persistLocal(STORAGE_KEYS.STUDENTS, this.students); this.bgUpsert('students', s); }
  }
  public deleteStudent(id: string): void {
    this.students = this.students.filter(s => s.id !== id);
    this.attendanceRecords = this.attendanceRecords.filter(r => r.studentId !== id);
    this.grades = this.grades.filter(g => g.studentId !== id);
    this.persistLocal(STORAGE_KEYS.STUDENTS, this.students);
    this.persistLocal(STORAGE_KEYS.ATTENDANCE, this.attendanceRecords);
    this.persistLocal(STORAGE_KEYS.GRADES, this.grades);
    this.bgDelete('students', id);
  }

  // ==================== ATTENDANCE ====================
  public getOrCreateAttendanceSession(groupId: string, date: string) {
    let session = this.sessions.find(s => s.groupId === groupId && s.date === date);
    if (!session) {
      session = { id: 'ses-' + Date.now().toString(36), groupId, date, isLocked: false };
      this.sessions.push(session);
      this.persistLocal(STORAGE_KEYS.SESSIONS, this.sessions);
      this.bgUpsert('attendance_sessions', session);
    }
    const records = this.attendanceRecords.filter(r => r.sessionId === session!.id);
    return { session, records };
  }
  public setStudentAttendanceStatus(sessionId: string, studentId: string, status: AttendanceStatus, note?: string): AttendanceRecord {
    let rec = this.attendanceRecords.find(r => r.sessionId === sessionId && r.studentId === studentId);
    if (rec) {
      rec.status = status;
      if (note !== undefined) rec.note = note;
      rec.timestamp = new Date().toISOString();
    } else {
      rec = { id: 'att-' + Date.now().toString(36), sessionId, studentId, status, note: note || '', timestamp: new Date().toISOString() };
      this.attendanceRecords.push(rec);
    }
    this.persistLocal(STORAGE_KEYS.ATTENDANCE, this.attendanceRecords);
    this.bgUpsert('attendance_records', rec);
    return rec;
  }
  public markAllPresent(sessionId: string, studentIds: string[]): void {
    const time = new Date().toISOString();
    studentIds.forEach(stuId => {
      let rec = this.attendanceRecords.find(r => r.sessionId === sessionId && r.studentId === stuId);
      if (rec) { rec.status = 'Presente'; rec.timestamp = time; }
      else {
        rec = { id: 'att-' + Date.now().toString(36), sessionId, studentId: stuId, status: 'Presente', timestamp: time };
        this.attendanceRecords.push(rec);
      }
      this.bgUpsert('attendance_records', rec);
    });
    this.persistLocal(STORAGE_KEYS.ATTENDANCE, this.attendanceRecords);
  }
  public commitAttendanceSave(sessionId: string, isLocked: boolean): AttendanceSession {
    const s = this.sessions.find(x => x.id === sessionId)!;
    s.isLocked = isLocked;
    s.completedAt = new Date().toISOString();
    this.persistLocal(STORAGE_KEYS.SESSIONS, this.sessions);
    this.bgUpsert('attendance_sessions', s);
    return s;
  }

  // ==================== SUBJECTS & PERIODS ====================
  public getSubjects(): Subject[] { return [...this.subjects]; }
  public getPeriods(): Period[] { return [...this.periods].sort((a, b) => a.orderIndex - b.orderIndex); }

  // ==================== GRADES ====================
  public getGrades(groupId: string, subjectId: string, periodId: string, category?: GradeCategory, activityTitle?: string): Grade[] {
    return this.grades.filter(g => g.groupId === groupId && g.subjectId === subjectId && g.periodId === periodId && (!category || g.category === category) && (!activityTitle || g.activityTitle === activityTitle));
  }
  public getAllGradesForGroup(groupId: string): Grade[] { return this.grades.filter(g => g.groupId === groupId); }
  public setStudentScore(stuId: string, grpId: string, subId: string, perId: string, cat: GradeCategory, title: string, score: number, obs?: string): Grade {
    let grd = this.grades.find(g => g.studentId === stuId && g.groupId === grpId && g.subjectId === subId && g.periodId === perId && g.category === cat && g.activityTitle === title);
    if (grd) {
      grd.score = score;
      if (obs !== undefined) grd.observation = obs;
      grd.updatedAt = new Date().toISOString();
    } else {
      grd = { id: 'grd-' + Date.now().toString(36), studentId: stuId, groupId: grpId, subjectId: subId, periodId: perId, category: cat, activityTitle: title, score, observation: obs || '', updatedAt: new Date().toISOString() };
      this.grades.push(grd);
    }
    this.persistLocal(STORAGE_KEYS.GRADES, this.grades);
    this.bgUpsert('grades', grd);
    return grd;
  }
  public saveAllGrades(groupId: string, subjectId: string, periodId: string, category: GradeCategory, activityTitle: string, studentGrades: Array<{ studentId: string; score: number; observation?: string }>): void {
    studentGrades.forEach(sg => this.setStudentScore(sg.studentId, groupId, subjectId, periodId, category, activityTitle, sg.score, sg.observation));
  }

  // ==================== ACTIVITIES ====================
  public getActivities(groupId?: string): Activity[] { return groupId ? this.activities.filter(a => a.groupId === groupId) : [...this.activities]; }
  public getActivityById(id: string): Activity | undefined { return this.activities.find(a => a.id === id); }
  public createActivity(data: Omit<Activity, 'id' | 'createdAt'>): Activity {
    const act: Activity = { ...data, id: 'act-' + Date.now().toString(36), createdAt: new Date().toISOString() };
    this.activities.push(act);
    this.persistLocal(STORAGE_KEYS.ACTIVITIES, this.activities);
    this.bgUpsert('activities', act);
    return act;
  }
  public updateActivity(id: string, data: Partial<Activity>): Activity | null {
    const idx = this.activities.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.activities[idx] = { ...this.activities[idx], ...data };
    this.persistLocal(STORAGE_KEYS.ACTIVITIES, this.activities);
    this.bgUpsert('activities', this.activities[idx]);
    return this.activities[idx];
  }
  public deleteActivity(id: string): boolean {
    this.activities = this.activities.filter(a => a.id !== id);
    this.grades = this.grades.filter(g => g.activityId !== id);
    this.persistLocal(STORAGE_KEYS.ACTIVITIES, this.activities);
    this.persistLocal(STORAGE_KEYS.GRADES, this.grades);
    this.bgDelete('activities', id);
    return true;
  }
  public getActivityGrades(activityId: string): Grade[] { return this.grades.filter(g => g.activityId === activityId); }
  public saveActivityGrades(activityId: string, groupId: string, studentGrades: Array<{ studentId: string; score: number; observation?: string }>): void {
    const act = this.getActivityById(activityId);
    studentGrades.forEach(sg => {
      let grd = this.grades.find(g => g.activityId === activityId && g.studentId === sg.studentId);
      if (grd) { grd.score = sg.score; if(sg.observation !== undefined) grd.observation = sg.observation; grd.updatedAt = new Date().toISOString(); }
      else {
        grd = { id: 'grd-' + Date.now().toString(36), studentId: sg.studentId, groupId, activityId: activityId, category: act?.type as any || 'Trabajos', activityTitle: act?.title || '', score: sg.score, observation: sg.observation || '', subjectId: '', periodId: '', updatedAt: new Date().toISOString() };
        this.grades.push(grd);
      }
      this.bgUpsert('grades', grd);
    });
    this.persistLocal(STORAGE_KEYS.GRADES, this.grades);
  }

  // ==================== SECURITY & SETTINGS ====================
  public getSecurityConfig(): SecurityConfig { return { ...this.security }; }
  public verifyPin(inputPin: string): { success: boolean; message: string; remainingAttempts: number; isLocked: boolean } {
    if (inputPin === this.security.pin) return { success: true, message: 'Acceso correcto', remainingAttempts: 5, isLocked: false };
    return { success: false, message: 'PIN incorrecto.', remainingAttempts: 4, isLocked: false };
  }
  public updatePin(newPin: string): boolean { 
    this.security.pin = newPin; 
    this.persistLocal(STORAGE_KEYS.SECURITY, this.security); 
    this.bgUpsert('security_config', this.security);
    return true; 
  }
  
  public getSettings(): UserSettings { return { ...this.settings }; }
  public updateSettings(newSettings: Partial<UserSettings>): UserSettings {
    this.settings = { ...this.settings, ...newSettings };
    this.persistLocal(STORAGE_KEYS.SETTINGS, this.settings);
    return this.settings;
  }

  // ==================== STATS ====================
  public getStats(): DatabaseStats {
    return { totalGroups: this.groups.length, totalStudents: this.students.length, activeStudents: this.students.filter(s => s.status === 'Active').length, totalAttendanceRecords: this.attendanceRecords.length, totalGrades: this.grades.length };
  }
  public getRawTables() { return { groups: this.groups, students: this.students, sessions: this.sessions, attendanceRecords: this.attendanceRecords, subjects: this.subjects, periods: this.periods, activities: this.activities, grades: this.grades, security: this.security }; }
  public loadDemoData(): void {}
  public importDatabaseBackup(data: any): boolean { return false; }
}

export const dbService = new SupabaseService();
