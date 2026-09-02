import { 
  Group, 
  Student, 
  AttendanceSession, 
  AttendanceRecord, 
  AttendanceStatus, 
  StudentStatus, 
  Subject, 
  Period, 
  Grade, 
  GradeCategory, 
  Activity,
  ActivityType,
  SecurityConfig, 
  DatabaseStats,
  UserSettings
} from '../types';
import { 
  INITIAL_GROUPS, 
  INITIAL_STUDENTS, 
  DEMO_SUBJECTS, 
  DEMO_PERIODS 
} from './sqliteSchema';

const STORAGE_KEYS = {
  GROUPS: 'edugestion_prod_groups_v2',
  STUDENTS: 'edugestion_prod_students_v2',
  SESSIONS: 'edugestion_prod_sessions_v2',
  ATTENDANCE: 'edugestion_prod_attendance_v2',
  SUBJECTS: 'edugestion_prod_subjects_v2',
  PERIODS: 'edugestion_prod_periods_v2',
  GRADES: 'edugestion_prod_grades_v2',
  ACTIVITIES: 'edugestion_prod_activities_v2',
  SECURITY: 'edugestion_prod_security_v2',
  SETTINGS: 'edugestion_prod_settings_v2',
  CLEAN_V3: 'edugestion_clean_v3',
};

class DatabaseService {
  private groups: Group[] = [];
  private students: Student[] = [];
  private sessions: AttendanceSession[] = [];
  private attendanceRecords: AttendanceRecord[] = [];
  private subjects: Subject[] = [];
  private periods: Period[] = [];
  private activities: Activity[] = [];
  private grades: Grade[] = [];
  private security: SecurityConfig = {
    id: 'sec-1',
    pin: '1234',
    failedAttempts: 0,
    lockedUntilTimestamp: 0,
  };
  private settings: UserSettings = {
    teacherName: 'Profesor Titular',
    schoolName: 'Escuela Secundaria Técnica',
    theme: 'light',
    fontSize: 'normal',
    autoLockMinutes: 10,
  };

  constructor() {
    this.initDatabase();
  }

  public initDatabase() {
    try {
      // Clean up previous v1 mock keys if present
      localStorage.removeItem('edugestion_groups_v1');
      localStorage.removeItem('edugestion_students_v1');
      localStorage.removeItem('edugestion_sessions_v1');
      localStorage.removeItem('edugestion_attendance_v1');
      localStorage.removeItem('edugestion_grades_v1');

      // Force purge pre-populated mock subjects/periods if clean_v3 is not set
      if (!localStorage.getItem(STORAGE_KEYS.CLEAN_V3)) {
        localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
        localStorage.removeItem(STORAGE_KEYS.PERIODS);
        localStorage.setItem(STORAGE_KEYS.CLEAN_V3, 'true');
      }

      const storedGroups = localStorage.getItem(STORAGE_KEYS.GROUPS);
      const storedStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      const storedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      const storedAttendance = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      const storedSubjects = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      const storedPeriods = localStorage.getItem(STORAGE_KEYS.PERIODS);
      const storedActivities = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      const storedGrades = localStorage.getItem(STORAGE_KEYS.GRADES);
      const storedSecurity = localStorage.getItem(STORAGE_KEYS.SECURITY);
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

      // Clean default state for production: 0 groups, 0 students, 0 subjects, 0 periods, 0 activities
      if (storedGroups) {
        this.groups = JSON.parse(storedGroups);
      } else {
        this.groups = [];
        this.persist(STORAGE_KEYS.GROUPS, this.groups);
      }

      if (storedStudents) {
        this.students = JSON.parse(storedStudents);
      } else {
        this.students = [];
        this.persist(STORAGE_KEYS.STUDENTS, this.students);
      }

      if (storedSubjects) {
        this.subjects = JSON.parse(storedSubjects);
      } else {
        this.subjects = [];
        this.persist(STORAGE_KEYS.SUBJECTS, this.subjects);
      }

      if (storedPeriods) {
        this.periods = JSON.parse(storedPeriods);
      } else {
        this.periods = [];
        this.persist(STORAGE_KEYS.PERIODS, this.periods);
      }

      if (storedActivities) {
        this.activities = JSON.parse(storedActivities);
      } else {
        this.activities = [];
        this.persist(STORAGE_KEYS.ACTIVITIES, this.activities);
      }

      if (storedSessions) {
        this.sessions = JSON.parse(storedSessions);
      } else {
        this.sessions = [];
        this.persist(STORAGE_KEYS.SESSIONS, this.sessions);
      }

      if (storedAttendance) {
        this.attendanceRecords = JSON.parse(storedAttendance);
      } else {
        this.attendanceRecords = [];
        this.persist(STORAGE_KEYS.ATTENDANCE, this.attendanceRecords);
      }

      if (storedGrades) {
        this.grades = JSON.parse(storedGrades);
      } else {
        this.grades = [];
        this.persist(STORAGE_KEYS.GRADES, this.grades);
      }

      if (storedSecurity) {
        this.security = JSON.parse(storedSecurity);
      } else {
        this.persist(STORAGE_KEYS.SECURITY, this.security);
      }

      if (storedSettings) {
        this.settings = JSON.parse(storedSettings);
      } else {
        this.persist(STORAGE_KEYS.SETTINGS, this.settings);
      }
    } catch (err) {
      console.error('Error initializing SQLite repository:', err);
    }
  }

  private persist(key: string, data: any) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to persist key ${key}:`, e);
    }
  }

  // ==================== GROUPS (CRUD & Cascading) ====================
  public getGroups(): Group[] {
    return [...this.groups];
  }

  public getGroupById(id: string): Group | undefined {
    return this.groups.find(g => g.id === id);
  }

  public addGroup(groupData: Omit<Group, 'id' | 'createdAt'>): Group {
    const newGroup: Group = {
      ...groupData,
      id: 'grp-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    this.groups.push(newGroup);
    this.persist(STORAGE_KEYS.GROUPS, this.groups);
    return newGroup;
  }

  public updateGroup(updated: Group): void {
    this.groups = this.groups.map(g => (g.id === updated.id ? updated : g));
    this.persist(STORAGE_KEYS.GROUPS, this.groups);
  }

  /**
   * Deletes group with full SQLite FOREIGN KEY CASCADE simulation:
   * Removes Students, Attendance_Sessions, Attendance_Records and Grades.
   */
  public deleteGroup(groupId: string): void {
    // 1. Delete group
    this.groups = this.groups.filter(g => g.id !== groupId);
    this.persist(STORAGE_KEYS.GROUPS, this.groups);

    // 2. Cascade delete students
    const studentIdsToDelete = this.students.filter(s => s.groupId === groupId).map(s => s.id);
    this.students = this.students.filter(s => s.groupId !== groupId);
    this.persist(STORAGE_KEYS.STUDENTS, this.students);

    // 3. Cascade delete attendance sessions
    const sessionIdsToDelete = this.sessions.filter(ses => ses.groupId === groupId).map(ses => ses.id);
    this.sessions = this.sessions.filter(ses => ses.groupId !== groupId);
    this.persist(STORAGE_KEYS.SESSIONS, this.sessions);

    // 4. Cascade delete attendance records
    this.attendanceRecords = this.attendanceRecords.filter(
      rec => !sessionIdsToDelete.includes(rec.sessionId) && !studentIdsToDelete.includes(rec.studentId)
    );
    this.persist(STORAGE_KEYS.ATTENDANCE, this.attendanceRecords);

    // 5. Cascade delete grades
    this.grades = this.grades.filter(grd => grd.groupId !== groupId);
    this.persist(STORAGE_KEYS.GRADES, this.grades);
  }

  // ==================== STUDENTS (CRUD) ====================
  public getStudents(groupId?: string): Student[] {
    if (groupId) {
      return this.students
        .filter(s => s.groupId === groupId)
        .sort((a, b) => a.rollNumber - b.rollNumber);
    }
    return [...this.students].sort((a, b) => a.rollNumber - b.rollNumber);
  }

  public getStudentById(id: string): Student | undefined {
    return this.students.find(s => s.id === id);
  }

  public addStudent(studentData: Omit<Student, 'id' | 'createdAt'>): Student {
    const nextRoll = studentData.rollNumber || (this.getStudents(studentData.groupId).length + 1);
    const newStudent: Student = {
      ...studentData,
      rollNumber: nextRoll,
      id: 'stu-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.students.push(newStudent);
    this.persist(STORAGE_KEYS.STUDENTS, this.students);
    return newStudent;
  }

  public updateStudent(updated: Student): void {
    this.students = this.students.map(s => (s.id === updated.id ? updated : s));
    this.persist(STORAGE_KEYS.STUDENTS, this.students);
  }

  public updateStudentStatus(studentId: string, status: StudentStatus): void {
    this.students = this.students.map(s => (s.id === studentId ? { ...s, status } : s));
    this.persist(STORAGE_KEYS.STUDENTS, this.students);
  }

  public moveStudentToGroup(studentId: string, newGroupId: string): void {
    const targetStudents = this.getStudents(newGroupId);
    const nextRoll = targetStudents.length + 1;
    this.students = this.students.map(s => {
      if (s.id === studentId) {
        return { ...s, groupId: newGroupId, rollNumber: nextRoll };
      }
      return s;
    });
    this.persist(STORAGE_KEYS.STUDENTS, this.students);
  }

  public deleteStudent(studentId: string): void {
    this.students = this.students.filter(s => s.id !== studentId);
    this.persist(STORAGE_KEYS.STUDENTS, this.students);

    // Cascade delete related records
    this.attendanceRecords = this.attendanceRecords.filter(r => r.studentId !== studentId);
    this.persist(STORAGE_KEYS.ATTENDANCE, this.attendanceRecords);

    this.grades = this.grades.filter(g => g.studentId !== studentId);
    this.persist(STORAGE_KEYS.GRADES, this.grades);
  }

  // ==================== ATTENDANCE (Business Logic) ====================
  public getOrCreateAttendanceSession(groupId: string, date: string): { session: AttendanceSession; records: AttendanceRecord[] } {
    let session = this.sessions.find(s => s.groupId === groupId && s.date === date);
    if (!session) {
      session = {
        id: 'ses-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
        groupId,
        date,
        isLocked: false,
      };
      this.sessions.push(session);
      this.persist(STORAGE_KEYS.SESSIONS, this.sessions);
    }

    const records = this.attendanceRecords.filter(r => r.sessionId === session!.id);
    return { session, records };
  }

  public setStudentAttendanceStatus(sessionId: string, studentId: string, status: AttendanceStatus, note?: string): AttendanceRecord {
    const existingIndex = this.attendanceRecords.findIndex(r => r.sessionId === sessionId && r.studentId === studentId);
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    if (existingIndex >= 0) {
      this.attendanceRecords[existingIndex] = {
        ...this.attendanceRecords[existingIndex],
        status,
        note: note !== undefined ? note : this.attendanceRecords[existingIndex].note,
        timestamp,
      };
      this.persist(STORAGE_KEYS.ATTENDANCE, this.attendanceRecords);
      return this.attendanceRecords[existingIndex];
    } else {
      const newRecord: AttendanceRecord = {
        id: 'att-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
        sessionId,
        studentId,
        status,
        note: note || '',
        timestamp,
      };
      this.attendanceRecords.push(newRecord);
      this.persist(STORAGE_KEYS.ATTENDANCE, this.attendanceRecords);
      return newRecord;
    }
  }

  public markAllPresent(sessionId: string, studentIds: string[]): void {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    studentIds.forEach(stuId => {
      const existingIdx = this.attendanceRecords.findIndex(r => r.sessionId === sessionId && r.studentId === stuId);
      if (existingIdx >= 0) {
        this.attendanceRecords[existingIdx].status = 'Presente';
        this.attendanceRecords[existingIdx].timestamp = timestamp;
      } else {
        this.attendanceRecords.push({
          id: 'att-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
          sessionId,
          studentId: stuId,
          status: 'Presente',
          timestamp,
        });
      }
    });
    this.persist(STORAGE_KEYS.ATTENDANCE, this.attendanceRecords);
  }

  public commitAttendanceSave(sessionId: string, isLocked: boolean): AttendanceSession {
    const completedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    this.sessions = this.sessions.map(s => {
      if (s.id === sessionId) {
        return { ...s, isLocked, completedAt };
      }
      return s;
    });
    this.persist(STORAGE_KEYS.SESSIONS, this.sessions);
    return this.sessions.find(s => s.id === sessionId)!;
  }

  // ==================== SUBJECTS & PERIODS ====================
  public getSubjects(): Subject[] {
    return [...this.subjects];
  }

  public getPeriods(): Period[] {
    return [...this.periods].sort((a, b) => a.orderIndex - b.orderIndex);
  }

  // ==================== GRADES (Calificaciones) ====================
  public getGrades(groupId: string, subjectId: string, periodId: string, category?: GradeCategory, activityTitle?: string): Grade[] {
    return this.grades.filter(g => {
      const matchGroup = g.groupId === groupId;
      const matchSubject = g.subjectId === subjectId;
      const matchPeriod = g.periodId === periodId;
      const matchCat = category ? g.category === category : true;
      const matchTitle = activityTitle ? g.activityTitle.toLowerCase() === activityTitle.toLowerCase() : true;
      return matchGroup && matchSubject && matchPeriod && matchCat && matchTitle;
    });
  }

  public getAllGradesForGroup(groupId: string): Grade[] {
    return this.grades.filter(g => g.groupId === groupId);
  }

  public setStudentScore(
    studentId: string,
    groupId: string,
    subjectId: string,
    periodId: string,
    category: GradeCategory,
    activityTitle: string,
    score: number,
    observation?: string
  ): Grade {
    const safeScore = Math.max(0, Math.min(10, Math.round(score * 10) / 10));
    const existingIndex = this.grades.findIndex(
      g => g.studentId === studentId &&
           g.groupId === groupId &&
           g.subjectId === subjectId &&
           g.periodId === periodId &&
           g.category === category &&
           g.activityTitle.trim().toLowerCase() === activityTitle.trim().toLowerCase()
    );

    const updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

    if (existingIndex >= 0) {
      this.grades[existingIndex] = {
        ...this.grades[existingIndex],
        score: safeScore,
        observation: observation !== undefined ? observation : this.grades[existingIndex].observation,
        updatedAt,
      };
      this.persist(STORAGE_KEYS.GRADES, this.grades);
      return this.grades[existingIndex];
    } else {
      const newGrade: Grade = {
        id: 'grd-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
        studentId,
        groupId,
        subjectId,
        periodId,
        category,
        activityTitle: activityTitle.trim(),
        score: safeScore,
        observation: observation || '',
        updatedAt,
      };
      this.grades.push(newGrade);
      this.persist(STORAGE_KEYS.GRADES, this.grades);
      return newGrade;
    }
  }

  public saveAllGrades(
    groupId: string,
    subjectId: string,
    periodId: string,
    category: GradeCategory,
    activityTitle: string,
    studentGrades: Array<{ studentId: string; score: number; observation?: string }>
  ): void {
    studentGrades.forEach(sg => {
      this.setStudentScore(
        sg.studentId,
        groupId,
        subjectId,
        periodId,
        category,
        activityTitle,
        sg.score,
        sg.observation
      );
    });
  }

  // ==================== ACTIVITIES (Tareas / Exámenes / Proyectos estilo Classroom) ====================
  public getActivities(groupId?: string): Activity[] {
    if (groupId) {
      return this.activities.filter(a => a.groupId === groupId);
    }
    return [...this.activities];
  }

  public getActivityById(id: string): Activity | undefined {
    return this.activities.find(a => a.id === id);
  }

  public createActivity(data: Omit<Activity, 'id' | 'createdAt'>): Activity {
    const newActivity: Activity = {
      id: 'act-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      groupId: data.groupId,
      title: data.title.trim(),
      type: data.type,
      dueDate: data.dueDate,
      maxScore: data.maxScore || 10,
      description: data.description || '',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    this.activities.push(newActivity);
    this.persist(STORAGE_KEYS.ACTIVITIES, this.activities);
    return newActivity;
  }

  public updateActivity(id: string, data: Partial<Activity>): Activity | null {
    const idx = this.activities.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.activities[idx] = { ...this.activities[idx], ...data };
    this.persist(STORAGE_KEYS.ACTIVITIES, this.activities);
    return this.activities[idx];
  }

  public deleteActivity(id: string): boolean {
    const initialLen = this.activities.length;
    this.activities = this.activities.filter(a => a.id !== id);
    // Also remove grades associated with this activity
    this.grades = this.grades.filter(g => g.activityId !== id);
    this.persist(STORAGE_KEYS.ACTIVITIES, this.activities);
    this.persist(STORAGE_KEYS.GRADES, this.grades);
    return this.activities.length < initialLen;
  }

  public getActivityGrades(activityId: string): Grade[] {
    return this.grades.filter(g => g.activityId === activityId);
  }

  public saveActivityGrades(
    activityId: string,
    groupId: string,
    studentGrades: Array<{ studentId: string; score: number; observation?: string }>
  ): void {
    const activity = this.getActivityById(activityId);
    const categoryMapping: Record<ActivityType, GradeCategory> = {
      'Tarea': 'Tareas',
      'Proyecto': 'Proyectos',
      'Examen': 'Exámenes',
      'Participación': 'Participación',
      'Práctica': 'Trabajos',
      'Otro': 'Trabajos',
    };
    const category: GradeCategory = activity ? categoryMapping[activity.type] || 'Trabajos' : 'Trabajos';
    const title = activity ? activity.title : 'Actividad';

    studentGrades.forEach(sg => {
      const safeScore = Math.max(0, Math.min(10, Math.round(sg.score * 10) / 10));
      const existingIdx = this.grades.findIndex(
        g => g.activityId === activityId && g.studentId === sg.studentId
      );
      const updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

      if (existingIdx >= 0) {
        this.grades[existingIdx] = {
          ...this.grades[existingIdx],
          score: safeScore,
          observation: sg.observation !== undefined ? sg.observation : this.grades[existingIdx].observation,
          updatedAt,
        };
      } else {
        const newGrade: Grade = {
          id: 'grd-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
          studentId: sg.studentId,
          groupId,
          activityId,
          category,
          activityTitle: title,
          score: safeScore,
          observation: sg.observation || '',
          subjectId: '',
          periodId: '',
          updatedAt,
        };
        this.grades.push(newGrade);
      }
    });

    this.persist(STORAGE_KEYS.GRADES, this.grades);
  }

  // ==================== SECURITY & PIN ====================
  public getSecurityConfig(): SecurityConfig {
    return { ...this.security };
  }

  public verifyPin(inputPin: string): { success: boolean; message: string; remainingAttempts: number; isLocked: boolean } {
    const now = Date.now();
    if (this.security.lockedUntilTimestamp > now) {
      const secondsLeft = Math.ceil((this.security.lockedUntilTimestamp - now) / 1000);
      return {
        success: false,
        message: `Acceso bloqueado por seguridad. Intente de nuevo en ${secondsLeft} segundos.`,
        remainingAttempts: 0,
        isLocked: true,
      };
    }

    if (inputPin === this.security.pin) {
      this.security.failedAttempts = 0;
      this.security.lockedUntilTimestamp = 0;
      this.persist(STORAGE_KEYS.SECURITY, this.security);
      return {
        success: true,
        message: 'Acceso correcto',
        remainingAttempts: 5,
        isLocked: false,
      };
    } else {
      this.security.failedAttempts += 1;
      let isLocked = false;
      if (this.security.failedAttempts >= 5) {
        this.security.lockedUntilTimestamp = now + 60 * 1000; // 60s lockout
        isLocked = true;
      }
      this.persist(STORAGE_KEYS.SECURITY, this.security);
      const remaining = Math.max(0, 5 - this.security.failedAttempts);
      return {
        success: false,
        message: isLocked ? 'Demasiados intentos fallidos. Bloqueado temporalmente por 1 minuto.' : `PIN incorrecto. Quedan ${remaining} intentos.`,
        remainingAttempts: remaining,
        isLocked,
      };
    }
  }

  public updatePin(newPin: string): boolean {
    if (/^\d{4}$/.test(newPin)) {
      this.security.pin = newPin;
      this.security.failedAttempts = 0;
      this.security.lockedUntilTimestamp = 0;
      this.persist(STORAGE_KEYS.SECURITY, this.security);
      return true;
    }
    return false;
  }

  // ==================== SETTINGS ====================
  public getSettings(): UserSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<UserSettings>): UserSettings {
    this.settings = { ...this.settings, ...newSettings };
    this.persist(STORAGE_KEYS.SETTINGS, this.settings);
    return this.settings;
  }

  // ==================== STATS & RAW DUMP ====================
  public getStats(): DatabaseStats {
    return {
      totalGroups: this.groups.length,
      totalStudents: this.students.length,
      activeStudents: this.students.filter(s => s.status === 'Active').length,
      totalAttendanceRecords: this.attendanceRecords.length,
      totalGrades: this.grades.length,
    };
  }

  public getRawTables(): {
    groups: Group[];
    students: Student[];
    sessions: AttendanceSession[];
    attendanceRecords: AttendanceRecord[];
    subjects: Subject[];
    periods: Period[];
    activities: Activity[];
    grades: Grade[];
    security: SecurityConfig;
  } {
    return {
      groups: this.groups,
      students: this.students,
      sessions: this.sessions,
      attendanceRecords: this.attendanceRecords,
      subjects: this.subjects,
      periods: this.periods,
      activities: this.activities,
      grades: this.grades,
      security: this.security,
    };
  }

  public resetToDefaults(): void {
    this.resetToEmptyProduction();
  }

  /**
   * Resets database to a 100% clean production state with 0 groups, 0 students, 0 subjects, 0 periods, 0 activities.
   */
  public resetToEmptyProduction(): void {
    this.groups = [];
    this.students = [];
    this.sessions = [];
    this.attendanceRecords = [];
    this.activities = [];
    this.grades = [];
    this.subjects = [];
    this.periods = [];
    this.persist(STORAGE_KEYS.GROUPS, this.groups);
    this.persist(STORAGE_KEYS.STUDENTS, this.students);
    this.persist(STORAGE_KEYS.SESSIONS, this.sessions);
    this.persist(STORAGE_KEYS.ATTENDANCE, this.attendanceRecords);
    this.persist(STORAGE_KEYS.ACTIVITIES, this.activities);
    this.persist(STORAGE_KEYS.GRADES, this.grades);
    this.persist(STORAGE_KEYS.SUBJECTS, this.subjects);
    this.persist(STORAGE_KEYS.PERIODS, this.periods);
  }

  /**
   * Loads sample demonstration data for testing if requested in settings.
   */
  public loadDemoData(): void {
    this.groups = [...INITIAL_GROUPS];
    this.students = [...INITIAL_STUDENTS];
    this.subjects = [...DEMO_SUBJECTS];
    this.periods = [...DEMO_PERIODS];
    
    const today = new Date().toISOString().split('T')[0];
    this.sessions = [
      {
        id: 'ses-demo-1',
        groupId: 'grp-1',
        date: today,
        isLocked: false,
      }
    ];

    this.attendanceRecords = [
      { id: 'att-d-1', sessionId: 'ses-demo-1', studentId: 'stu-1', status: 'Presente', timestamp: `${today} 08:02:00` },
      { id: 'att-d-2', sessionId: 'ses-demo-1', studentId: 'stu-2', status: 'Presente', timestamp: `${today} 08:03:00` },
      { id: 'att-d-3', sessionId: 'ses-demo-1', studentId: 'stu-3', status: 'Presente', timestamp: `${today} 08:04:00` },
      { id: 'att-d-4', sessionId: 'ses-demo-1', studentId: 'stu-4', status: 'Retardo', note: 'Retardo justificado', timestamp: `${today} 08:15:00` },
      { id: 'att-d-5', sessionId: 'ses-demo-1', studentId: 'stu-5', status: 'Falta', timestamp: `${today} 08:05:00` },
    ];

    this.activities = [
      {
        id: 'act-demo-1',
        groupId: 'grp-1',
        title: 'Examen Diagnóstico Inicial',
        type: 'Examen',
        dueDate: today,
        maxScore: 10,
        description: 'Evaluación de conocimientos previos al ciclo escolar.',
        createdAt: today,
      },
      {
        id: 'act-demo-2',
        groupId: 'grp-1',
        title: 'Tarea 1: Resumen de Biología Celular',
        type: 'Tarea',
        dueDate: today,
        maxScore: 10,
        description: 'Elaborar mapa conceptual y resumen en el cuaderno.',
        createdAt: today,
      },
      {
        id: 'act-demo-3',
        groupId: 'grp-1',
        title: 'Proyecto 1: Maqueta Científica',
        type: 'Proyecto',
        dueDate: today,
        maxScore: 10,
        description: 'Presentación en equipo con materiales reciclados.',
        createdAt: today,
      }
    ];

    this.grades = [
      { id: 'grd-d-1', studentId: 'stu-1', groupId: 'grp-1', activityId: 'act-demo-1', category: 'Exámenes', activityTitle: 'Examen Diagnóstico Inicial', score: 9.5, observation: 'Excelente desempeño', subjectId: 'sub-1', periodId: 'per-1', updatedAt: today },
      { id: 'grd-d-2', studentId: 'stu-2', groupId: 'grp-1', activityId: 'act-demo-1', category: 'Exámenes', activityTitle: 'Examen Diagnóstico Inicial', score: 8.0, observation: '', subjectId: 'sub-1', periodId: 'per-1', updatedAt: today },
      { id: 'grd-d-3', studentId: 'stu-3', groupId: 'grp-1', activityId: 'act-demo-1', category: 'Exámenes', activityTitle: 'Examen Diagnóstico Inicial', score: 10.0, observation: 'Sobresaliente', subjectId: 'sub-1', periodId: 'per-1', updatedAt: today },
      { id: 'grd-d-4', studentId: 'stu-1', groupId: 'grp-1', activityId: 'act-demo-2', category: 'Tareas', activityTitle: 'Tarea 1: Resumen de Biología Celular', score: 10.0, observation: 'Completa y a tiempo', subjectId: 'sub-2', periodId: 'per-1', updatedAt: today },
      { id: 'grd-d-5', studentId: 'stu-2', groupId: 'grp-1', activityId: 'act-demo-2', category: 'Tareas', activityTitle: 'Tarea 1: Resumen de Biología Celular', score: 9.0, observation: '', subjectId: 'sub-2', periodId: 'per-1', updatedAt: today },
    ];

    this.persist(STORAGE_KEYS.GROUPS, this.groups);
    this.persist(STORAGE_KEYS.STUDENTS, this.students);
    this.persist(STORAGE_KEYS.SESSIONS, this.sessions);
    this.persist(STORAGE_KEYS.ATTENDANCE, this.attendanceRecords);
    this.persist(STORAGE_KEYS.ACTIVITIES, this.activities);
    this.persist(STORAGE_KEYS.GRADES, this.grades);
    this.persist(STORAGE_KEYS.SUBJECTS, this.subjects);
    this.persist(STORAGE_KEYS.PERIODS, this.periods);
  }

  public importDatabaseBackup(data: any): boolean {
    try {
      if (Array.isArray(data.groups)) {
        this.groups = data.groups;
        this.persist(STORAGE_KEYS.GROUPS, this.groups);
      }
      if (Array.isArray(data.students)) {
        this.students = data.students;
        this.persist(STORAGE_KEYS.STUDENTS, this.students);
      }
      if (Array.isArray(data.sessions)) {
        this.sessions = data.sessions;
        this.persist(STORAGE_KEYS.SESSIONS, this.sessions);
      }
      if (Array.isArray(data.attendanceRecords)) {
        this.attendanceRecords = data.attendanceRecords;
        this.persist(STORAGE_KEYS.ATTENDANCE, this.attendanceRecords);
      }
      if (Array.isArray(data.activities)) {
        this.activities = data.activities;
        this.persist(STORAGE_KEYS.ACTIVITIES, this.activities);
      }
      if (Array.isArray(data.grades)) {
        this.grades = data.grades;
        this.persist(STORAGE_KEYS.GRADES, this.grades);
      }
      if (Array.isArray(data.subjects)) {
        this.subjects = data.subjects;
        this.persist(STORAGE_KEYS.SUBJECTS, this.subjects);
      }
      if (Array.isArray(data.periods)) {
        this.periods = data.periods;
        this.persist(STORAGE_KEYS.PERIODS, this.periods);
      }
      if (data.settings) {
        this.settings = { ...this.settings, ...data.settings };
        this.persist(STORAGE_KEYS.SETTINGS, this.settings);
      }
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }
}

export const dbService = new DatabaseService();
