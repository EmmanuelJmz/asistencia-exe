// electron/database.cjs - SQLite Database Connection & Queries for Electron (better-sqlite3)
const path = require('path');
const fs = require('fs');

let dbInstance = null;

/**
 * Initializes SQLite database in the OS User Data folder (e.g., %APPDATA%/EduGestion/edugestion.db on Windows)
 */
function initSqliteDatabase(app) {
  try {
    // Dynamic require so it gracefully handles environments where better-sqlite3 is compiled
    const Database = require('better-sqlite3');
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'edugestion_local.db');

    // Ensure directory exists
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }

    dbInstance = new Database(dbPath, { verbose: console.log });
    
    // Enable Foreign Keys for cascading deletes
    dbInstance.pragma('foreign_keys = ON');
    dbInstance.pragma('journal_mode = WAL');

    // Execute SQLite Table Creation
    const createTablesSQL = `
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

      CREATE TABLE IF NOT EXISTS Attendance_Sessions (
        id TEXT PRIMARY KEY,
        groupId TEXT NOT NULL,
        date TEXT NOT NULL,
        isLocked INTEGER NOT NULL DEFAULT 0,
        completedAt DATETIME,
        FOREIGN KEY (groupId) REFERENCES Groups(id) ON DELETE CASCADE,
        UNIQUE(groupId, date)
      );

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

      CREATE TABLE IF NOT EXISTS Subjects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS Periods (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        orderIndex INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS Grades (
        id TEXT PRIMARY KEY,
        studentId TEXT NOT NULL,
        groupId TEXT NOT NULL,
        category TEXT NOT NULL CHECK(category IN ('Trabajos', 'Exámenes', 'Tareas', 'Proyectos', 'Participación')),
        activityTitle TEXT NOT NULL,
        score REAL NOT NULL CHECK(score >= 0.0 AND score <= 10.0),
        observation TEXT,
        subjectId TEXT NOT NULL,
        periodId TEXT NOT NULL,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (studentId) REFERENCES Students(id) ON DELETE CASCADE,
        FOREIGN KEY (groupId) REFERENCES Groups(id) ON DELETE CASCADE,
        FOREIGN KEY (subjectId) REFERENCES Subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (periodId) REFERENCES Periods(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS Security_Config (
        id TEXT PRIMARY KEY,
        pin TEXT NOT NULL DEFAULT '1234',
        failedAttempts INTEGER NOT NULL DEFAULT 0,
        lockedUntilTimestamp INTEGER NOT NULL DEFAULT 0
      );
    `;

    dbInstance.exec(createTablesSQL);
    console.log('[SQLite] Local database initialized successfully at:', dbPath);
    return { success: true, path: dbPath };
  } catch (err) {
    console.warn('[SQLite] Fallback or Native driver not loaded yet:', err.message);
    return { success: false, error: err.message };
  }
}

function getDatabase() {
  return dbInstance;
}

module.exports = {
  initSqliteDatabase,
  getDatabase
};
