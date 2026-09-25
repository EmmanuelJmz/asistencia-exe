import React, { useState, useEffect } from 'react';
import { ActiveScreen, Group, Student, Subject, Period, UserSettings, DatabaseStats, Activity, Grade } from './types';
import { EvaluateStudentsScreen } from './components/EvaluateStudentsScreen';
import { dbService } from './db/databaseService';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { DashboardScreen } from './components/DashboardScreen';
import { GlobalStudentsScreen } from './components/GlobalStudentsScreen';
import { GroupsStudentsScreen } from './components/GroupsStudentsScreen';
import { AttendanceScreen } from './components/AttendanceScreen';
import { GradesFunnelScreen } from './components/GradesFunnelScreen';
import { ReportsScreen } from './components/ReportsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { SqliteInspectorModal } from './components/SqliteInspectorModal';
import { WhatsNewModal } from './components/WhatsNewModal';

const CURRENT_VERSION = 'v1.3.0';

export function App() {
  const [session, setSession] = useState<any>(null);
  const [designMode, setDesignMode] = useState<'classic' | 'new'>(() =>
    localStorage.getItem('edugestion_design_mode') === 'new' ? 'new' : 'classic'
  );
  const [isInitializingAuth, setIsInitializingAuth] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>(() => {
    return (localStorage.getItem('currentScreen') as ActiveScreen) || 'dashboard';
  });
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(() => {
    return localStorage.getItem('selectedGroupId') || null;
  });
  const [isSqliteModalOpen, setIsSqliteModalOpen] = useState<boolean>(false);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState<boolean>(() => {
    return localStorage.getItem('edugestion_last_version') !== CURRENT_VERSION;
  });

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
  };

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      // 1. Check current session
      const currentSession = await dbService.getSession();
      setSession(currentSession);
      setIsInitializingAuth(false);
      
      // Only load data if we have a session
      if (currentSession) {
        setIsLoading(true);
        await dbService.loadFromCloud();
        refreshData();
        setIsLoading(false);
      }
    };
    init();

    // 2. Listen for auth changes (login/logout)
    const { data: authListener } = dbService.onAuthStateChange(async (newSession) => {
      setSession(newSession);
      if (newSession) {
        setIsLoading(true);
        await dbService.loadFromCloud();
        refreshData();
        setIsLoading(false);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.designMode = designMode;
    localStorage.setItem('edugestion_design_mode', designMode);
  }, [designMode]);

  useEffect(() => {
    const palettes: Record<string, [string, string]> = {
      '#FF441F': ['#FF441F', '#FF6B4A'], '#7C3AED': ['#7C3AED', '#A78BFA'],
      '#2563EB': ['#2563EB', '#60A5FA'], '#DC2626': ['#DC2626', '#F87171'],
      '#059669': ['#059669', '#34D399'], '#D97706': ['#D97706', '#FBBF24'],
      '#DB2777': ['#DB2777', '#F472B6'], '#0891B2': ['#0891B2', '#22D3EE'],
    };
    const [main, light] = palettes[settings.accentColor] || palettes['#FF441F'];
    document.documentElement.style.setProperty('--accent-color', main);
    document.documentElement.style.setProperty('--accent-light', light);
    document.documentElement.style.setProperty('--accent-hover', main);
  }, [settings.accentColor]);

  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  useEffect(() => {
    localStorage.setItem('currentScreen', currentScreen);
  }, [currentScreen]);

  useEffect(() => {
    if (selectedGroupId) {
      localStorage.setItem('selectedGroupId', selectedGroupId);
    } else {
      localStorage.removeItem('selectedGroupId');
    }
  }, [selectedGroupId]);

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

  const handleLockApp = async () => {
    await dbService.logout();
  };

  if (isInitializingAuth) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121212]"><div className="text-xl font-bold text-[#FF441F] animate-pulse">Conectando...</div></div>;
  }

  if (!session) {
    return <LoginScreen />;
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121212]"><div className="flex flex-col items-center gap-3"><div className="w-10 h-10 border-4 border-[#FF441F] border-t-transparent rounded-full animate-spin"></div><div className="text-lg font-bold text-gray-800 dark:text-gray-200">Sincronizando con la nube...</div></div></div>;
  }

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#FF6B4A] selection:text-white">
      {/* Top Application Header */}
      <Header
        currentScreen={currentScreen}
        onSelectScreen={handleSelectScreen}
        onLockApp={handleLockApp}
        settings={settings}
        stats={stats}
        designMode={designMode}
        onToggleDesign={() => setDesignMode(mode => mode === 'classic' ? 'new' : 'classic')}
        onToggleTheme={() => {
          const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
          const updated = dbService.updateSettings({ ...settings, theme: newTheme });
          setSettings(updated);
        }}
      />

      {/* Main Container View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 print:max-w-none print:p-0">
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

      {/* Clean Statusbar */}
      <footer className="bg-white dark:bg-[#1E1E1E] border-t border-gray-200 dark:border-[#333333] px-4 py-3 text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center justify-between select-none print:hidden shadow-sm">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            Sistema Listo
          </span>
          <span className="border-l border-gray-200 dark:border-[#333333] pl-4 font-semibold text-gray-700 dark:text-gray-200">
            {settings.schoolName}
          </span>
          <span className="hidden sm:inline border-l border-gray-200 dark:border-[#333333] pl-4">
            Grupos: <strong className="text-gray-800 dark:text-white font-bold">{groups.length}</strong> | Alumnos Inscritos: <strong className="text-gray-800 dark:text-white font-bold">{students.length}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline">
            Sesión Protegida
          </span>
          <button 
            onClick={() => setIsWhatsNewOpen(true)}
            className="border-l border-gray-200 dark:border-[#333333] pl-3 text-[#FF441F] font-bold hover:text-[#E03514] transition-colors cursor-pointer flex items-center gap-1"
          >
            Versión {CURRENT_VERSION}
          </button>
        </div>
      </footer>

      {/* SQLite Inspector Modal */}
      {isSqliteModalOpen && (
        <SqliteInspectorModal onClose={() => setIsSqliteModalOpen(false)} />
      )}

      {/* WhatsNew Release Notes Modal */}
      <WhatsNewModal
        isOpen={isWhatsNewOpen}
        onClose={() => {
          localStorage.setItem('edugestion_last_version', CURRENT_VERSION);
          setIsWhatsNewOpen(false);
        }}
        version={CURRENT_VERSION}
      />
    </div>
  );
}

export default App;
