import {
  Activity, AttendanceRecord, AttendanceSession, AttendanceStatus, DatabaseStats,
  Grade, GradeCategory, Group, Period, SecurityConfig, Student, StudentStatus,
  Subject, TeacherNote, UserSettings,
} from '../../shared/types';
import { GroupOperations } from './GroupOperations';

export class StudentOperations extends GroupOperations {
// ==================== STUDENTS ====================
  public sortStudentsAlphabetically(students: Student[]): Student[] {
    return [...students].sort((a, b) => {
      const cmpLast = (a.lastName || '').localeCompare(b.lastName || '', 'es', { sensitivity: 'base' });
      if (cmpLast !== 0) return cmpLast;
      const cmpFirst = (a.firstName || '').localeCompare(b.firstName || '', 'es', { sensitivity: 'base' });
      if (cmpFirst !== 0) return cmpFirst;
      return a.rollNumber - b.rollNumber;
    });
  }

  public reorderStudentsAlphabetically(groupId: string): void {
    const sorted = this.sortStudentsAlphabetically(this.students.filter(s => s.groupId === groupId));
    sorted.forEach((s, idx) => {
      s.rollNumber = idx + 1;
      this.upsert('students', s);
    });
  }

  public getStudents(groupId?: string): Student[] {
    if (groupId) return this.sortStudentsAlphabetically(this.students.filter(s => s.groupId === groupId));
    return this.sortStudentsAlphabetically(this.students);
  }
  public getStudentById(id: string): Student | undefined { return this.students.find(s => s.id === id); }
  public addStudent(data: Omit<Student, 'id' | 'createdAt'>): Student {
    const nextRoll = data.rollNumber || (this.getStudents(data.groupId).length + 1);
    const newStudent: Student = { ...data, rollNumber: nextRoll, id: this.generateId('stu'), createdAt: new Date().toISOString() };
    this.students.push(newStudent);
    this.reorderStudentsAlphabetically(data.groupId);
    return newStudent;
  }
  public updateStudent(updated: Student): void {
    this.students = this.students.map(s => s.id === updated.id ? updated : s);
    this.reorderStudentsAlphabetically(updated.groupId);
  }
  public updateStudentStatus(id: string, status: StudentStatus): void {
    const s = this.getStudentById(id);
    if(s) { 
      s.status = status; 
      this.upsert('students', s); 
    }
  }
  public moveStudentToGroup(studentId: string, newGroupId: string): void {
    const s = this.getStudentById(studentId);
    if(s) { 
      const oldGroupId = s.groupId;
      s.groupId = newGroupId; 
      this.reorderStudentsAlphabetically(oldGroupId);
      this.reorderStudentsAlphabetically(newGroupId);
    }
  }
  public deleteStudent(id: string): void {
    const target = this.getStudentById(id);
    const groupId = target?.groupId;
    this.students = this.students.filter(s => s.id !== id);
    this.attendanceRecords = this.attendanceRecords.filter(r => r.studentId !== id);
    this.grades = this.grades.filter(g => g.studentId !== id);
    if (groupId) this.reorderStudentsAlphabetically(groupId);
    this.removeFromCloud('students', id);
  }

  }
