import {
  Activity, AttendanceRecord, AttendanceSession, AttendanceStatus, DatabaseStats,
  Grade, GradeCategory, Group, Period, SecurityConfig, Student, StudentStatus,
  Subject, TeacherNote, UserSettings,
} from '../../shared/types';
import { AccountOperations } from './AccountOperations';

export class StatisticsOperations extends AccountOperations {
// ==================== STATS ====================
  public getStats(): DatabaseStats {
    const validGroups = this.getGroups();
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    const completedGroupsToday = validGroups.filter(g => {
      const activeStudentCount = this.students.filter(student => student.groupId === g.id && student.status === 'Active').length;
      const todaySession = this.sessions.find(session => session.groupId === g.id && session.date === todayStr);
      const recordedStudentCount = todaySession
        ? new Set(this.attendanceRecords
          .filter(record => record.sessionId === todaySession.id)
          .map(record => record.studentId)).size
        : 0;

      return activeStudentCount > 0 && recordedStudentCount >= activeStudentCount;
    }).length;

    return { 
      totalGroups: validGroups.length, 
      completedGroupsToday,
      totalStudents: this.students.length, 
      activeStudents: this.students.filter(s => s.status === 'Active').length, 
      totalAttendanceRecords: this.sessions.filter(s => s.completedAt || s.isLocked).length || this.sessions.length, 
      totalGrades: this.grades.length 
    };
  }
  public getRawTables() { return { groups: this.groups, students: this.students, sessions: this.sessions, attendanceRecords: this.attendanceRecords, subjects: this.subjects, periods: this.periods, activities: this.activities, grades: this.grades, security: this.security }; }

  public importDatabaseBackup(data: any): boolean {
    if (!data || typeof data !== 'object') return false;
    try {
      if (Array.isArray(data.groups)) this.groups = data.groups;
      if (Array.isArray(data.students)) this.students = data.students;
      if (Array.isArray(data.sessions)) this.sessions = data.sessions;
      if (Array.isArray(data.attendanceRecords)) this.attendanceRecords = data.attendanceRecords;
      if (Array.isArray(data.subjects)) this.subjects = data.subjects;
      if (Array.isArray(data.periods)) this.periods = data.periods;
      if (Array.isArray(data.activities)) this.activities = data.activities;
      if (Array.isArray(data.grades)) this.grades = data.grades;
      if (data.security) this.security = data.security;
      if (data.settings) this.settings = data.settings;
      this.ensureGlobalPool();
      return true;
    } catch (e) {
      console.error('Error importing backup:', e);
      return false;
    }
  }

  }
