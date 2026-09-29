import {
  Activity, AttendanceRecord, AttendanceSession, AttendanceStatus, DatabaseStats,
  Grade, GradeCategory, Group, Period, SecurityConfig, Student, StudentStatus,
  Subject, TeacherNote, UserSettings,
} from '../../shared/types';
import { SchoolDataCore } from './SchoolDataCore';

export class GroupOperations extends SchoolDataCore {
// ==================== GROUPS ====================
  public getGroups(): Group[] { return this.groups.filter(g => g.id !== 'grp-global-pool' && g.id !== 'grp-app-settings' && g.grade !== 'SETTINGS'); }
  public getGroupById(id: string): Group | undefined { return this.groups.find(g => g.id === id); }
  public addGroup(data: Omit<Group, 'id' | 'createdAt'>): Group {
    const newGroup: Group = { ...data, id: this.generateId('grp'), createdAt: new Date().toISOString() };
    this.groups.push(newGroup);
    this.upsert('groups', newGroup);
    return newGroup;
  }
  public updateGroup(updated: Group): void {
    this.groups = this.groups.map(g => g.id === updated.id ? updated : g);
    this.upsert('groups', updated);
  }
  public deleteGroup(id: string): void {
    const deletedStudents = this.students.filter(s => s.groupId === id);
    const deletedSessions = this.sessions.filter(s => s.groupId === id);
    const deletedActivities = this.activities.filter(a => a.groupId === id);
    const sessionIds = new Set(deletedSessions.map(session => session.id));
    const activityIds = new Set(deletedActivities.map(activity => activity.id));
    const deletedAttendance = this.attendanceRecords.filter(record => sessionIds.has(record.sessionId));
    const deletedGrades = this.grades.filter(grade => grade.groupId === id || (grade.activityId && activityIds.has(grade.activityId)));

    this.groups = this.groups.filter(g => g.id !== id);
    this.students = this.students.filter(s => s.groupId !== id);
    this.sessions = this.sessions.filter(s => s.groupId !== id);
    this.attendanceRecords = this.attendanceRecords.filter(record => !sessionIds.has(record.sessionId));
    this.activities = this.activities.filter(activity => activity.groupId !== id);
    this.grades = this.grades.filter(grade => !deletedGrades.includes(grade));

    this.removeFromCloud('groups', id);
    deletedStudents.forEach(student => this.removeFromCloud('students', student.id));
    deletedSessions.forEach(session => this.removeFromCloud('attendance_sessions', session.id));
    deletedAttendance.forEach(record => this.removeFromCloud('attendance_records', record.id));
    deletedActivities.forEach(activity => this.removeFromCloud('activities', activity.id));
    deletedGrades.forEach(grade => this.removeFromCloud('grades', grade.id));
  }

  }
