import {
  Activity, AttendanceRecord, AttendanceSession, AttendanceStatus, DatabaseStats,
  Grade, GradeCategory, Group, Period, SecurityConfig, Student, StudentStatus,
  Subject, TeacherNote, UserSettings,
} from '../../shared/types';
import { StatisticsOperations } from './StatisticsOperations';

export class TeacherNotesOperations extends StatisticsOperations {
// ==================== TEACHER NOTES ====================
  public getTeacherNotes(): TeacherNote[] {
    return [...this.teacherNotes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addTeacherNote(data: { title: string; dueDate?: string; groupId?: string }): TeacherNote {
    const note: TeacherNote = {
      id: this.generateId('note'),
      title: data.title,
      dueDate: data.dueDate,
      groupId: data.groupId,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    this.teacherNotes.unshift(note);
    // Sync to cloud using new helper
    this.syncTeacherNote(note);
    return note;
  }

  private syncTeacherNote(note: TeacherNote) {
    this.upsert('teacher_notes', this.teacherNoteToRow(note));
  }


  public toggleTeacherNote(id: string): TeacherNote | undefined {
    const note = this.teacherNotes.find(n => n.id === id);
    if (note) {
      note.completed = !note.completed;
      // Sync change
      this.syncTeacherNote(note);
    }
    return note;
  }




  public deleteTeacherNote(id: string): void {
    this.teacherNotes = this.teacherNotes.filter(n => n.id !== id);
    this.removeFromCloud('teacher_notes', id);
  }

}
