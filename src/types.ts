export type AttendanceStatus = 'Presente' | 'Falta' | 'Retardo' | 'Justificada';

export type StudentStatus = 'Active' | 'Inactive';

export interface Group {
  id: string;
  name: string;
  grade: string;
  section: string;
  shift: 'Matutino' | 'Vespertino' | 'Nocturno';
  schoolYear: string;
  colorHex: string;
  createdAt: string;
}

export interface Student {
  id: string;
  groupId: string;
  firstName: string;
  lastName: string;
  rollNumber: number;
  status: StudentStatus;
  notes?: string;
  createdAt: string;
}

export interface AttendanceSession {
  id: string;
  groupId: string;
  date: string; // YYYY-MM-DD
  isLocked: boolean;
  completedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  note?: string;
  timestamp: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface Period {
  id: string;
  name: string;
  orderIndex: number;
}

export type ActivityType = 'Tarea' | 'Proyecto' | 'Examen' | 'Participación' | 'Práctica' | 'Otro';

export interface Activity {
  id: string;
  groupId: string;
  title: string;
  type: ActivityType;
  dueDate: string; // YYYY-MM-DD
  maxScore: number; // Por defecto 10
  description?: string;
  createdAt: string;
}

export type GradeCategory = 'Trabajos' | 'Exámenes' | 'Tareas' | 'Proyectos' | 'Participación';

export interface Grade {
  id: string;
  studentId: string;
  groupId: string;
  activityId?: string;
  category: GradeCategory;
  activityTitle: string;
  score: number; // 0.0 a 10.0
  observation?: string;
  subjectId: string;
  periodId: string;
  updatedAt: string;
}

export interface SecurityConfig {
  id: string;
  pin: string;
  failedAttempts: number;
  lockedUntilTimestamp: number;
}

export interface UserSettings {
  teacherName: string;
  schoolName: string;
  theme: 'dark' | 'light' | 'system';
  fontSize: 'small' | 'normal' | 'large';
  autoLockMinutes: number;
}

export interface DatabaseStats {
  totalGroups: number;
  totalStudents: number;
  activeStudents: number;
  totalAttendanceRecords: number;
  totalGrades: number;
}

export type ActiveScreen = 
  | 'dashboard'
  | 'groups_students'
  | 'attendance'
  | 'grades'
  | 'reports'
  | 'settings'
  | 'sqlite_explorer';
