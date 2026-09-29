import {
  Activity, AttendanceRecord, AttendanceSession, AttendanceStatus, DatabaseStats,
  Grade, GradeCategory, Group, Period, SecurityConfig, Student, StudentStatus,
  Subject, TeacherNote, UserSettings,
} from '../../shared/types';
import { AttendanceOperations } from './AttendanceOperations';

export class AcademicOperations extends AttendanceOperations {
// ==================== SUBJECTS & PERIODS ====================
  public getSubjects(): Subject[] { return [...this.subjects]; }
  public getPeriods(): Period[] { return [...this.periods].sort((a, b) => a.orderIndex - b.orderIndex); }

  // ==================== GRADES ====================
  public getGrades(groupId: string, subjectId: string, periodId: string, category?: GradeCategory, activityId?: string): Grade[] {
    return this.grades.filter(g => g.groupId === groupId && g.subjectId === subjectId && g.periodId === periodId && (!category || g.category === category) && (!activityId || g.activityId === activityId));
  }
  public getAllGradesForGroup(groupId: string): Grade[] { return this.grades.filter(g => g.groupId === groupId); }
  public setStudentScore(stuId: string, grpId: string, subId: string, perId: string, cat: GradeCategory, title: string, score: number, obs?: string, activityId?: string): Grade {
    let grd = this.grades.find(g => g.studentId === stuId && g.groupId === grpId && (activityId ? g.activityId === activityId : (g.subjectId === subId && g.periodId === perId && g.activityTitle === title)));
    if (grd) {
      grd.score = score;
      if (obs !== undefined) grd.observation = obs;
      grd.updatedAt = new Date().toISOString();
    } else {
      const uniqueId = activityId ? `grd-${activityId}-${stuId}` : this.generateId('grd');
      grd = { id: uniqueId, studentId: stuId, groupId: grpId, subjectId: subId, periodId: perId, category: cat, activityTitle: title, activityId: activityId, score, observation: obs || '', updatedAt: new Date().toISOString() };
      this.grades.push(grd);
    }
    this.upsert('grades', grd);
    return grd;
  }
  public saveAllGrades(groupId: string, subjectId: string, periodId: string, category: GradeCategory, activityTitle: string, studentGrades: Array<{ studentId: string; score: number; observation?: string }>, activityId?: string): void {
    studentGrades.forEach(sg => this.setStudentScore(sg.studentId, groupId, subjectId, periodId, category, activityTitle, sg.score, sg.observation, activityId));
  }

  // ==================== ACTIVITIES ====================
  public getActivities(groupId?: string): Activity[] { return groupId ? this.activities.filter(a => a.groupId === groupId) : [...this.activities]; }
  public getActivityById(id: string): Activity | undefined { return this.activities.find(a => a.id === id); }
  public createActivity(data: Omit<Activity, 'id' | 'createdAt'>): Activity {
    const act: Activity = { ...data, id: this.generateId('act'), createdAt: new Date().toISOString() };
    this.activities.push(act);
    this.upsert('activities', act);
    return act;
  }
  public updateActivity(id: string, data: Partial<Activity>): Activity | null {
    const idx = this.activities.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.activities[idx] = { ...this.activities[idx], ...data };
    this.upsert('activities', this.activities[idx]);
    return this.activities[idx];
  }
  public deleteActivity(id: string): boolean {
    this.activities = this.activities.filter(a => a.id !== id);
    this.grades = this.grades.filter(g => g.activityId !== id);
    this.removeFromCloud('activities', id);
    return true;
  }
  public getActivityGrades(activityId: string): Grade[] { return this.grades.filter(g => g.activityId === activityId); }
  public saveActivityGrades(activityId: string, groupId: string, studentGrades: Array<{ studentId: string; score: number; observation?: string }>): void {
    const act = this.getActivityById(activityId);
    studentGrades.forEach(sg => {
      let grd = this.grades.find(g => g.activityId === activityId && g.studentId === sg.studentId);
      if (grd) {
        grd.score = sg.score;
        if(sg.observation !== undefined) grd.observation = sg.observation;
        grd.updatedAt = new Date().toISOString();
      } else {
        grd = {
          id: `grd-${activityId}-${sg.studentId}`,
          studentId: sg.studentId,
          groupId,
          activityId: activityId,
          category: (act?.type as any) || 'Trabajos',
          activityTitle: act?.title || '',
          score: sg.score,
          observation: sg.observation || '',
          subjectId: '',
          periodId: '',
          updatedAt: new Date().toISOString()
        };
        this.grades.push(grd);
      }
      this.upsert('grades', grd);
    });
  }

  }
