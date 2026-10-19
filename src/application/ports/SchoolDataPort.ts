import {
  Activity,
  AttendanceRecord,
  AttendanceSession,
  AttendanceStatus,
  DatabaseStats,
  Grade,
  Group,
  GradeCategory,
  Period,
  SecurityConfig,
  Student,
  StudentStatus,
  Subject,
  TeacherNote,
  UserSettings,
} from '../../shared/types';

export interface SchoolDataPort {
  loadFromCloud(): Promise<void>;
  login(username: string, password: string): Promise<unknown>;
  logout(): Promise<void>;
  getSession(): Promise<unknown>;
  onAuthStateChange(callback: (session: any) => void): {
    data: { subscription: { unsubscribe(): void } };
  };
  clearInMemoryData(): void;

  getGroups(): Group[];
  getGroupById(id: string): Group | undefined;
  getGroupNameById(id: string): string;
  addGroup(data: Omit<Group, 'id' | 'createdAt'>): Group;
  updateGroup(updated: Group): void;
  deleteGroup(id: string): void;

  getStudents(groupId?: string): Student[];
  getStudentById(id: string): Student | undefined;
  addStudent(data: Omit<Student, 'id' | 'createdAt'>): Student;
  updateStudent(updated: Student): void;
  updateStudentStatus(id: string, status: StudentStatus): void;
  moveStudentToGroup(studentId: string, newGroupId: string): void;
  deleteStudent(id: string): void;

  getOrCreateAttendanceSession(groupId: string, date: string): {
    session: AttendanceSession;
    records: AttendanceRecord[];
  };
  commitAttendanceSave(sessionId: string, isLocked: boolean): Promise<AttendanceSession>;
  saveAttendanceRecords(sessionId: string, records: AttendanceRecord[]): Promise<void>;

  getSubjects(): Subject[];
  getPeriods(): Period[];
  getAllGradesForGroup(groupId: string): Grade[];
  getActivityGrades(activityId: string): Grade[];
  saveActivityGrades(
    activityId: string,
    groupId: string,
    studentGrades: Array<{ studentId: string; score: number; observation?: string }>,
  ): void;

  getActivities(groupId?: string): Activity[];
  getActivityById(id: string): Activity | undefined;
  createActivity(data: Omit<Activity, 'id' | 'createdAt'>): Activity;
  updateActivity(id: string, data: Partial<Activity>): Activity | null;
  deleteActivity(id: string): boolean;

  getSettings(): UserSettings;
  updateSettings(newSettings: Partial<UserSettings>): UserSettings;
  getStats(): DatabaseStats;
  getRawTables(): {
    groups: Group[];
    students: Student[];
    sessions: AttendanceSession[];
    attendanceRecords: AttendanceRecord[];
    subjects: Subject[];
    periods: Period[];
    activities: Activity[];
    grades: Grade[];
    security: SecurityConfig;
  };
  importDatabaseBackup(data: any): boolean;

  getTeacherNotes(): TeacherNote[];
  addTeacherNote(data: { title: string; dueDate?: string; groupId?: string }): TeacherNote;
  toggleTeacherNote(id: string): TeacherNote | undefined;
  deleteTeacherNote(id: string): void;
}
