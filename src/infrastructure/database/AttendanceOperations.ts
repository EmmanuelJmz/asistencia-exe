import {
  Activity, AttendanceRecord, AttendanceSession, AttendanceStatus, DatabaseStats,
  Grade, GradeCategory, Group, Period, SecurityConfig, Student, StudentStatus,
  Subject, TeacherNote, UserSettings,
} from '../../shared/types';
import { StudentOperations } from './StudentOperations';

export class AttendanceOperations extends StudentOperations {
// ==================== ATTENDANCE ====================
  public getOrCreateAttendanceSession(groupId: string, date: string) {
    let session = this.sessions.find(s => s.groupId === groupId && s.date === date);
    if (!session) {
      session = { id: `ses-${groupId}-${date}`, groupId, date, isLocked: false };
      this.sessions.push(session);
      this.upsert('attendance_sessions', session);
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
      rec = { id: `att-${sessionId}-${studentId}`, sessionId, studentId, status, note: note || '', timestamp: new Date().toISOString() };
      this.attendanceRecords.push(rec);
    }
    this.upsert('attendance_records', rec);
    return rec;
  }
  public markAllPresent(sessionId: string, studentIds: string[]): void {
    const time = new Date().toISOString();
    studentIds.forEach(stuId => {
      let rec = this.attendanceRecords.find(r => r.sessionId === sessionId && r.studentId === stuId);
      if (rec) {
        rec.status = 'Presente';
        rec.timestamp = time;
      } else {
        rec = { id: `att-${sessionId}-${stuId}`, sessionId, studentId: stuId, status: 'Presente', timestamp: time };
        this.attendanceRecords.push(rec);
      }
      this.upsert('attendance_records', rec);
    });
  }
  public saveAttendanceRecords(sessionId: string, records: AttendanceRecord[]): void {
    const savedRecords = this.attendanceRecords.filter(record => record.sessionId === sessionId);
    const retainedIds = new Set(records.map(record => record.id));
    savedRecords.filter(record => !retainedIds.has(record.id)).forEach(record => {
      this.removeFromCloud('attendance_records', record.id);
    });
    this.attendanceRecords = this.attendanceRecords.filter(record => record.sessionId !== sessionId || retainedIds.has(record.id));
    records.forEach(record => {
      const existing = this.attendanceRecords.find(r => r.id === record.id);
      if (existing) {
        Object.assign(existing, record);
      } else {
        this.attendanceRecords.push(record);
      }
      this.upsert('attendance_records', record);
    });
  }
  public commitAttendanceSave(sessionId: string, isLocked: boolean): AttendanceSession {
    const s = this.sessions.find(x => x.id === sessionId)!;
    if (s) {
      s.isLocked = isLocked;
      s.completedAt = new Date().toISOString();
      this.upsert('attendance_sessions', s);
    }
    return s;
  }

  }
