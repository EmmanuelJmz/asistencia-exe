import React, { useState, useEffect } from 'react';
import { ActiveScreen, Group, Student, Subject, Period, UserSettings, DatabaseStats } from './types';
import { dbService } from './db/databaseService';
import { AuthPinScreen } from './components/AuthPinScreen';
import { Header } from './components/Header';
import { DashboardScreen } from './components/DashboardScreen';
import { GlobalStudentsScreen } from './components/GlobalStudentsScreen';
import { GroupsStudentsScreen } from './components/GroupsStudentsScreen';
import { AttendanceScreen } from './components/AttendanceScreen';
import { GradesFunnelScreen } from './components/GradesFunnelScreen';
import { ReportsScreen } from './components/ReportsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { SqliteInspectorModal } from './components/SqliteInspectorModal';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('dashboard');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isSqliteModalOpen, setIsSqliteModalOpen] = useState<boolean>(false);

  // Core Data States from local SQLite database repository
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [settings, setSettings] = useState<UserSettings>(dbService.getSettings());
  const [stats, setStats] = useState<DatabaseStats>(dbService.getStats());

  const refreshData = () => {
    const grps = dbService.getGroups();
    const stus = dbService.getStudents();
    const subs = dbService.getSubjects();
    const pers = dbService.getPeriods();
    const sets = dbService.getSettings();
    const st = dbService.getStats();

    setGroups(grps);
    setStudents(stus);
    setSubjects(subs);
    setPeriods(pers);
    setSettings(sets);
    setStats(st);

    if (!selectedGroupId && grps.length > 0) {
      setSelectedGroupId(grps[0].id);
    }
  };

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await dbService.loadFromCloud();
      refreshData();
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const handleSelectScreen = (screen: ActiveScreen) => {
    if (screen === 'sqlite_explorer') {
      setIsSqliteModalOpen(true);
      return;
    }
    if (screen === 'grades') {
      setSelectedGroupId(null);
    }
    setCurrentScreen(screen);
  };

  const handleLockApp = () => {
    setIsAuthenticated(false);
  };

  // If not authenticated, show the 4-digit PIN screen
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900"><div className="text-xl font-bold text-blue-600 animate-pulse">Descargando datos desde la nube...</div></div>;
  }

  if (!isAuthenticated) {
    return <AuthPinScreen onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className={`min-h-screen ${settings.theme === 'light' ? 'bg-slate-100 text-slate-800' : 'bg-[#0F172A] text-slate-100'} flex flex-col selection:bg-blue-600 selection:text-white`}>
      {/* Top Application Header */}
      <Header
        currentScreen={currentScreen}
        onSelectScreen={handleSelectScreen}
        onLockApp={handleLockApp}
        settings={settings}
        stats={stats}
        onToggleTheme={() => {
          const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
          const updated = dbService.updateSettings({ ...settings, theme: newTheme });
          setSettings(updated);
        }}
      />

      {/* Main Container View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4">
        {currentScreen === 'dashboard' && (
          <DashboardScreen
            groups={groups}
            students={students}
            stats={stats}
            onNavigate={setCurrentScreen}
            onSelectGroupForAttendance={(gid) => {
              setSelectedGroupId(gid);
              setCurrentScreen('attendance');
            }}
            onSelectGroupForGrades={(gid) => {
              setSelectedGroupId(gid);
              setCurrentScreen('grades');
            }}
          />
        )}

        {currentScreen === 'global_students' && (
          <GlobalStudentsScreen
            students={students}
            onDataChanged={refreshData}
          />
        )}

        {currentScreen === 'groups_students' && (
          <GroupsStudentsScreen
            groups={groups}
            students={students}
            selectedGroupId={selectedGroupId}
            onSelectGroup={setSelectedGroupId}
            onDataChanged={refreshData}
          />
        )}

        {currentScreen === 'attendance' && (
          <AttendanceScreen
            groups={groups}
            students={students}
            selectedGroupId={selectedGroupId}
            onSelectGroup={setSelectedGroupId}
            onDataChanged={refreshData}
          />
        )}

        {currentScreen === 'grades' && (
          <GradesFunnelScreen
            groups={groups}
            students={students}
            subjects={subjects}
            periods={periods}
            selectedGroupId={selectedGroupId}
            onSelectGroup={setSelectedGroupId}
            onDataChanged={refreshData}
          />
        )}

        {currentScreen === 'reports' && (
          <ReportsScreen
            groups={groups}
            students={students}
            subjects={subjects}
            periods={periods}
            settings={settings}
            selectedGroupId={selectedGroupId}
            onSelectGroup={setSelectedGroupId}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            settings={settings}
            onSettingsChanged={(newSets) => {
              setSettings(newSets);
              refreshData();
            }}
            onDataReset={refreshData}
            onOpenSqliteInspector={() => setIsSqliteModalOpen(true)}
          />
        )}
      </main>

      {/* Classic Desktop Statusbar */}
      <footer className="bg-slate-200 border-t border-slate-300 px-3 py-1 text-[11px] text-slate-600 flex flex-wrap items-center justify-between select-none print:hidden">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Sistema Listo
          </span>
          <span className="border-l border-slate-300 pl-4 font-medium text-slate-700">
            {settings.schoolName}
          </span>
          <span className="hidden sm:inline border-l border-slate-300 pl-4">
            Grupos: <strong className="text-slate-800 font-mono">{groups.length}</strong> | Alumnos Inscritos: <strong className="text-slate-800 font-mono">{students.length}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-slate-500">
            Protección: PIN Activo
          </span>
          <span className="border-l border-slate-300 pl-3 text-slate-500">
            Versión 1.0.0
          </span>
        </div>
      </footer>

      {/* SQLite Inspector Modal */}
      {isSqliteModalOpen && (
        <SqliteInspectorModal onClose={() => setIsSqliteModalOpen(false)} />
      )}
    </div>
  );
}

export default App;
