/**
 * SQLite DDL Schema definition with Cascading Foreign Keys and Indices.
 * This exact SQL script is executed when initializing the local SQLite database in Electron.
 */

export const SQLITE_INIT_DDL = `
-- Habilitar integridad referencial en SQLite
PRAGMA foreign_keys = ON;

-- 1. Tabla Groups (Grupos)
CREATE TABLE IF NOT EXISTS Groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  grade TEXT NOT NULL,
  section TEXT NOT NULL,
  shift TEXT NOT NULL CHECK(shift IN ('Matutino', 'Vespertino', 'Nocturno')),
  schoolYear TEXT NOT NULL,
  colorHex TEXT DEFAULT '#1E3A8A',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla Students (Alumnos)
CREATE TABLE IF NOT EXISTS Students (
  id TEXT PRIMARY KEY,
  groupId TEXT NOT NULL,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  rollNumber INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive')),
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (groupId) REFERENCES Groups(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_students_group ON Students(groupId);
CREATE INDEX IF NOT EXISTS idx_students_roll ON Students(groupId, rollNumber);

-- 3. Tabla Attendance_Sessions (Sesiones de Asistencia)
CREATE TABLE IF NOT EXISTS Attendance_Sessions (
  id TEXT PRIMARY KEY,
  groupId TEXT NOT NULL,
  date TEXT NOT NULL, -- Formato YYYY-MM-DD
  isLocked INTEGER NOT NULL DEFAULT 0, -- 0: Abierta, 1: Bloqueada
  completedAt DATETIME,
  FOREIGN KEY (groupId) REFERENCES Groups(id) ON DELETE CASCADE,
  UNIQUE(groupId, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_sessions_group_date ON Attendance_Sessions(groupId, date);

-- 4. Tabla Attendance_Records (Registros individuales de pase de lista)
CREATE TABLE IF NOT EXISTS Attendance_Records (
  id TEXT PRIMARY KEY,
  sessionId TEXT NOT NULL,
  studentId TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('Presente', 'Falta', 'Retardo', 'Justificada')),
  note TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sessionId) REFERENCES Attendance_Sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (studentId) REFERENCES Students(id) ON DELETE CASCADE,
  UNIQUE(sessionId, studentId)
);

CREATE INDEX IF NOT EXISTS idx_attendance_records_session ON Attendance_Records(sessionId);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON Attendance_Records(studentId);

-- 5. Tabla Subjects (Materias)
CREATE TABLE IF NOT EXISTS Subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE
);

-- 6. Tabla Periods (Bimestres / Trimestres)
CREATE TABLE IF NOT EXISTS Periods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  orderIndex INTEGER NOT NULL
);

-- 7. Tabla Activities (Actividades / Tareas / Exámenes estilo Classroom)
CREATE TABLE IF NOT EXISTS Activities (
  id TEXT PRIMARY KEY,
  groupId TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('Tarea', 'Proyecto', 'Examen', 'Participación', 'Práctica', 'Otro')),
  dueDate TEXT NOT NULL,
  maxScore REAL NOT NULL DEFAULT 10.0,
  description TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (groupId) REFERENCES Groups(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_activities_group ON Activities(groupId);

-- 8. Tabla Grades (Calificaciones)
CREATE TABLE IF NOT EXISTS Grades (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  groupId TEXT NOT NULL,
  activityId TEXT,
  category TEXT NOT NULL CHECK(category IN ('Trabajos', 'Exámenes', 'Tareas', 'Proyectos', 'Participación')),
  activityTitle TEXT NOT NULL,
  score REAL NOT NULL CHECK(score >= 0.0 AND score <= 10.0),
  observation TEXT,
  subjectId TEXT,
  periodId TEXT,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES Students(id) ON DELETE CASCADE,
  FOREIGN KEY (groupId) REFERENCES Groups(id) ON DELETE CASCADE,
  FOREIGN KEY (activityId) REFERENCES Activities(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_grades_student ON Grades(studentId);
CREATE INDEX IF NOT EXISTS idx_grades_activity ON Grades(activityId);
CREATE INDEX IF NOT EXISTS idx_grades_filter ON Grades(groupId, subjectId, periodId);

-- 9. Tabla Security_Config (Configuración de Bloqueo por PIN)
CREATE TABLE IF NOT EXISTS Security_Config (
  id TEXT PRIMARY KEY,
  pin TEXT NOT NULL DEFAULT '1234',
  failedAttempts INTEGER NOT NULL DEFAULT 0,
  lockedUntilTimestamp INTEGER NOT NULL DEFAULT 0
);
`;

export const INITIAL_SUBJECTS: any[] = [];
export const INITIAL_PERIODS: any[] = [];

export const DEMO_SUBJECTS = [
  { id: 'sub-1', name: 'Matemáticas', code: 'MAT-101' },
  { id: 'sub-2', name: 'Español / Lengua Materna', code: 'ESP-102' },
  { id: 'sub-3', name: 'Ciencias / Biología', code: 'BIO-103' },
  { id: 'sub-4', name: 'Historia Universal', code: 'HIS-104' },
];

export const DEMO_PERIODS = [
  { id: 'per-1', name: '1er Trimestre (Sep - Nov)', orderIndex: 1 },
  { id: 'per-2', name: '2do Trimestre (Dic - Mar)', orderIndex: 2 },
  { id: 'per-3', name: '3er Trimestre (Abr - Jul)', orderIndex: 3 },
];

export const INITIAL_GROUPS = [
  {
    id: 'grp-1',
    name: '3° A - Secundaria',
    grade: '3°',
    section: 'A',
    shift: 'Matutino' as const,
    schoolYear: '2026-2027',
    colorHex: '#1E3A8A',
    createdAt: '2026-08-20 08:00:00',
  },
  {
    id: 'grp-2',
    name: '2° B - Secundaria',
    grade: '2°',
    section: 'B',
    shift: 'Matutino' as const,
    schoolYear: '2026-2027',
    colorHex: '#0D9488',
    createdAt: '2026-08-20 08:30:00',
  },
  {
    id: 'grp-3',
    name: '1° C - Secundaria',
    grade: '1°',
    section: 'C',
    shift: 'Vespertino' as const,
    schoolYear: '2026-2027',
    colorHex: '#D97706',
    createdAt: '2026-08-21 14:00:00',
  }
];

export const INITIAL_STUDENTS = [
  // 3° A Students
  { id: 'stu-1', groupId: 'grp-1', firstName: 'Sofía', lastName: 'Álvarez Mendoza', rollNumber: 1, status: 'Active' as const, notes: 'Jefa de grupo', createdAt: '2026-08-22' },
  { id: 'stu-2', groupId: 'grp-1', firstName: 'Mateo', lastName: 'Benítez Cruz', rollNumber: 2, status: 'Active' as const, notes: '', createdAt: '2026-08-22' },
  { id: 'stu-3', groupId: 'grp-1', firstName: 'Camila', lastName: 'Castillo Ramos', rollNumber: 3, status: 'Active' as const, notes: 'Promedio destacado', createdAt: '2026-08-22' },
  { id: 'stu-4', groupId: 'grp-1', firstName: 'Diego', lastName: 'Flores Silva', rollNumber: 4, status: 'Active' as const, notes: '', createdAt: '2026-08-22' },
  { id: 'stu-5', groupId: 'grp-1', firstName: 'Valentina', lastName: 'Gómez Herrera', rollNumber: 5, status: 'Active' as const, notes: '', createdAt: '2026-08-22' },
  { id: 'stu-6', groupId: 'grp-1', firstName: 'Santiago', lastName: 'Hernández López', rollNumber: 6, status: 'Active' as const, notes: 'Equipo de robótica', createdAt: '2026-08-22' },
  { id: 'stu-7', groupId: 'grp-1', firstName: 'Isabella', lastName: 'Jiménez Ortiz', rollNumber: 7, status: 'Active' as const, notes: '', createdAt: '2026-08-22' },
  { id: 'stu-8', groupId: 'grp-1', firstName: 'Leonardo', lastName: 'Martínez Ruiz', rollNumber: 8, status: 'Active' as const, notes: '', createdAt: '2026-08-22' },
  { id: 'stu-9', groupId: 'grp-1', firstName: 'Lucía', lastName: 'Navarro Morales', rollNumber: 9, status: 'Active' as const, notes: '', createdAt: '2026-08-22' },
  { id: 'stu-10', groupId: 'grp-1', firstName: 'Emiliano', lastName: 'Pérez Vega', rollNumber: 10, status: 'Inactive' as const, notes: 'Baja temporal por cambio de ciudad', createdAt: '2026-08-22' },

  // 2° B Students
  { id: 'stu-11', groupId: 'grp-2', firstName: 'Alejandro', lastName: 'Quintero Domínguez', rollNumber: 1, status: 'Active' as const, notes: '', createdAt: '2026-08-22' },
  { id: 'stu-12', groupId: 'grp-2', firstName: 'Mariana', lastName: 'Reyes Vargas', rollNumber: 2, status: 'Active' as const, notes: '', createdAt: '2026-08-22' },
  { id: 'stu-13', groupId: 'grp-2', firstName: 'Gabriel', lastName: 'Salinas Fuentes', rollNumber: 3, status: 'Active' as const, notes: '', createdAt: '2026-08-22' },
  { id: 'stu-14', groupId: 'grp-2', firstName: 'Valeria', lastName: 'Torres Méndez', rollNumber: 4, status: 'Active' as const, notes: '', createdAt: '2026-08-22' },
  { id: 'stu-15', groupId: 'grp-2', firstName: 'Rodrigo', lastName: 'Zamora Peña', rollNumber: 5, status: 'Active' as const, notes: '', createdAt: '2026-08-22' },

  // 1° C Students
  { id: 'stu-16', groupId: 'grp-3', firstName: 'Andrea', lastName: 'Acosta Beltrán', rollNumber: 1, status: 'Active' as const, notes: '', createdAt: '2026-08-22' },
  { id: 'stu-17', groupId: 'grp-3', firstName: 'Bruno', lastName: 'Bravo Cárdenas', rollNumber: 2, status: 'Active' as const, notes: '', createdAt: '2026-08-22' },
  { id: 'stu-18', groupId: 'grp-3', firstName: 'Daniela', lastName: 'Carrillo Soto', rollNumber: 3, status: 'Active' as const, notes: '', createdAt: '2026-08-22' },
];
