import {
  Activity, AttendanceRecord, AttendanceSession, AttendanceStatus, DatabaseStats,
  Grade, GradeCategory, Group, Period, SecurityConfig, Student, StudentStatus,
  Subject, TeacherNote, UserSettings,
} from '../../shared/types';
import { supabaseAuth } from '../supabase/authRepository';
import { supabaseSchoolRepository } from '../supabase/schoolRepository';

export abstract class SchoolDataCore {
  protected groups: Group[] = [];
  protected students: Student[] = [];
  protected sessions: AttendanceSession[] = [];
  protected attendanceRecords: AttendanceRecord[] = [];
  protected subjects: Subject[] = [];
  protected periods: Period[] = [];
  protected activities: Activity[] = [];
  protected grades: Grade[] = [];
  protected teacherNotes: TeacherNote[] = [];
  protected security: SecurityConfig = { id: 'sec-1', pin: '', failedAttempts: 0, lockedUntilTimestamp: 0 };
  protected settings: UserSettings = { teacherName: 'Profesor Titular', schoolName: 'Escuela Secundaria', theme: 'light', accentColor: '#FF441F', fontSize: 'normal', autoLockMinutes: 10 };

  protected generateId(prefix: string): string {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
  }

  public async loadFromCloud() {
    try {
      const [grp, stu, ses, att, sub, per, act, grd, set, sec, nts] = await supabaseSchoolRepository.fetchAllTables();
      const queryError = [grp, stu, ses, att, sub, per, act, grd, set, sec, nts].find(result => result.error)?.error;
      if (queryError) throw queryError;

      if (grp.data) {
        this.groups = grp.data;

        const settingsRec = grp.data.find((g: any) => g.id === 'grp-app-settings' || g.grade === 'SETTINGS');
        if (settingsRec) {
          try {
            const parsed = JSON.parse(settingsRec.name);
            if (parsed && typeof parsed === 'object') {
              this.settings = { ...this.settings, ...parsed };
            }
          } catch (e) {}
        }
      }
      if (stu.data) { this.students = stu.data; }
      if (ses.data) { this.sessions = ses.data; }
      if (att.data) {
        const attMap = new Map<string, AttendanceRecord>();
        att.data.forEach((r: AttendanceRecord) => attMap.set(`${r.sessionId}_${r.studentId}`, r));
        this.attendanceRecords = Array.from(attMap.values());
      }
      if (sub.data) { this.subjects = sub.data; }
      if (per.data) { this.periods = per.data; }
      if (act.data) { this.activities = act.data; }
      if (grd.data) {
        // Deduplicate grades
        const grdMap = new Map<string, Grade>();
        grd.data.forEach((g: Grade) => {
          const key = g.activityId ? `${g.activityId}_${g.studentId}` : `${g.studentId}_${g.groupId}_${g.subjectId}_${g.periodId}_${g.activityTitle}`;
          grdMap.set(key, g);
        });
        this.grades = Array.from(grdMap.values());
      }
      if (set.data && set.data.length > 0) {
        const s = set.data[0];
        const mappedSettings: Partial<UserSettings> = {};
        if (s.teachername || s.teacherName) mappedSettings.teacherName = s.teachername || s.teacherName;
        if (s.schoolname || s.schoolName) mappedSettings.schoolName = s.schoolname || s.schoolName;
        if (s.theme) mappedSettings.theme = s.theme;
        if (s.accentcolor || s.accentColor) mappedSettings.accentColor = s.accentcolor || s.accentColor;
        if (s.fontsize || s.fontSize) mappedSettings.fontSize = s.fontsize || s.fontSize;
        if (s.autolockminutes || s.autoLockMinutes) mappedSettings.autoLockMinutes = Number(s.autolockminutes || s.autoLockMinutes);

        this.settings = { ...this.settings, ...mappedSettings };
      }
      if (sec.data && sec.data.length > 0) {
        this.security = { ...this.security, ...sec.data[0] };
      }
      if (nts.error) {
        console.error('Error loading teacher_notes from Supabase:', nts.error);
      } else if (nts.data) {
        const cloudTeacherNotes = nts.data.map((n: any) => ({
          id: n.id,
          title: n.title,
          dueDate: n.duedate || n.dueDate,
          completed: Boolean(n.completed),
          groupId: n.groupid || n.groupId,
          createdAt: n.createdat || n.createdAt || new Date().toISOString(),
        }));

        this.teacherNotes = cloudTeacherNotes;
      }
      
      this.ensureGlobalPool();
    } catch (e) {
      console.error('Error loading data from Supabase', e);
      throw e;
    }
  }

  public getGroupNameById(id: string): string {
    const group = this.groups.find(g => g.id === id);
    return group ? group.name : 'Sin grupo';
  }

  protected ensureGlobalPool() {
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
    }
  }

  protected syncGroup(data: any) { supabaseSchoolRepository.upsert('groups', data); }
  protected syncStudent(data: any) { supabaseSchoolRepository.upsert('students', data); }
  protected syncActivity(data: any) { supabaseSchoolRepository.upsert('activities', data); }
  protected syncGrade(data: any) { supabaseSchoolRepository.upsert('grades', data); }

  protected teacherNoteToRow(note: TeacherNote) {
    return {
      id: note.id,
      title: note.title,
      duedate: note.dueDate || null,
      completed: note.completed,
      groupid: note.groupId || null,
      createdat: note.createdAt,
    };
  }


  protected upsert(table: string, data: unknown): Promise<void> {
    return supabaseSchoolRepository.upsert(table, data);
  }

  protected removeFromCloud(table: string, id: string): Promise<void> {
    return supabaseSchoolRepository.delete(table, id);
  }

}
