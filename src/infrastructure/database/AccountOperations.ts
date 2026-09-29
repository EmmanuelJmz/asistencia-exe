import {
  Activity, AttendanceRecord, AttendanceSession, AttendanceStatus, DatabaseStats,
  Grade, GradeCategory, Group, Period, SecurityConfig, Student, StudentStatus,
  Subject, TeacherNote, UserSettings,
} from '../../shared/types';
import { supabaseAuth } from '../supabase/authRepository';
import { AcademicOperations } from './AcademicOperations';

export class AccountOperations extends AcademicOperations {
// ==================== SECURITY & AUTHENTICATION ====================
  public async login(username: string, password: string) {
    return supabaseAuth.login(username, password);
  }

  public async logout() {
    await supabaseAuth.logout();
    this.clearInMemoryData();
  }


  public clearInMemoryData() {
    this.groups = [];
    this.students = [];
    this.sessions = [];
    this.attendanceRecords = [];
    this.subjects = [];
    this.periods = [];
    this.activities = [];
    this.grades = [];
    this.teacherNotes = [];
    this.security = { id: 'sec-1', pin: '', failedAttempts: 0, lockedUntilTimestamp: 0 };
    this.settings = {
      teacherName: 'Profesor Titular', schoolName: 'Escuela Secundaria',
      theme: 'light', accentColor: '#FF441F', fontSize: 'normal', autoLockMinutes: 10,
    };
  }

  public async getSession() {
    return supabaseAuth.getSession();
  }

  public onAuthStateChange(callback: (session: any) => void) {
    return supabaseAuth.onAuthStateChange(callback);
  }

  public getSecurityConfig(): SecurityConfig {
    return { ...this.security };
  }

  public updatePin(newPin: string): SecurityConfig {
    this.security = { ...this.security, pin: newPin };
    this.upsert('security_config', { id: 'sec-1', ...this.security });
    return this.security;
  }

  public getSettings(): UserSettings { return { ...this.settings }; }
  public updateSettings(newSettings: Partial<UserSettings>): UserSettings {
    this.settings = { ...this.settings, ...newSettings };

    // 1. Sync to groups table backup container
    const settingsRecord: Group = {
      id: 'grp-app-settings',
      name: JSON.stringify(this.settings),
      grade: 'SETTINGS',
      section: 'CONFIG',
      shift: 'Matutino',
      schoolYear: '2026-2027',
      colorHex: '#000000',
      createdAt: new Date().toISOString()
    };
    this.upsert('groups', settingsRecord);

    // 2. Sync directly to Supabase settings table (lowercase column names)
    const settingsTableRecord = {
      id: 'profile-1',
      teachername: this.settings.teacherName,
      schoolname: this.settings.schoolName,
      theme: this.settings.theme,
      fontsize: this.settings.fontSize,
      autolockminutes: this.settings.autoLockMinutes,
      updatedat: new Date().toISOString()
    };
    this.upsert('settings', settingsTableRecord);

    return this.settings;
  }

  }
