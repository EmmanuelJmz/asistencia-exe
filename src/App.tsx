import React, { lazy, Suspense, useState, useEffect } from 'react';
import { ActiveScreen, Group, Student, Subject, Period, UserSettings, DatabaseStats } from './types';
import { dbService } from './db/databaseService';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { WhatsNewModal } from './components/WhatsNewModal';
import { LoadingScreen } from './components/LoadingScreen';
import { ConnectionErrorScreen } from './components/ConnectionErrorScreen';

const DashboardScreen = lazy(() => import('./components/DashboardScreen').then(module => ({ default: module.DashboardScreen })));
const GlobalStudentsScreen = lazy(() => import('./components/GlobalStudentsScreen').then(module => ({ default: module.GlobalStudentsScreen })));
const GroupsStudentsScreen = lazy(() => import('./components/GroupsStudentsScreen').then(module => ({ default: module.GroupsStudentsScreen })));
const AttendanceScreen = lazy(() => import('./components/AttendanceScreen').then(module => ({ default: module.AttendanceScreen })));
const GradesFunnelScreen = lazy(() => import('./components/GradesFunnelScreen').then(module => ({ default: module.GradesFunnelScreen })));
const ReportsScreen = lazy(() => import('./components/ReportsScreen').then(module => ({ default: module.ReportsScreen })));
const SettingsScreen = lazy(() => import('./components/SettingsScreen').then(module => ({ default: module.SettingsScreen })));

const CURRENT_VERSION = 'v1.3.0';

export function App() {
  const [session, setSession] = useState<any>(null);
  const [designMode, setDesignMode] = useState<'classic' | 'new'>(() =>
    sessionStorage.getItem('edugestion_design_mode') === 'new' ? 'new' : 'classic'
  );
  const [isInitializingAuth, setIsInitializingAuth] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>(() => {
    return (sessionStorage.getItem('currentScreen') as ActiveScreen) || 'dashboard';
  });
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(() => {
    return sessionStorage.getItem('selectedGroupId') || null;
  });
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState<boolean>(() => {
    return sessionStorage.getItem('edugestion_last_version') !== CURRENT_VERSION;
  });

  // Core data loaded from Supabase and kept in memory for this session
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
  const [dataLoadError, setDataLoadError] = useState(false);

  useEffect(() => {
    const init = async () => {
      // 1. Check current session
      const currentSession = await dbService.getSession();
      setSession(currentSession);
      setIsInitializingAuth(false);
      
      // Only load data if we have a session
      if (currentSession) {
        setIsLoading(true);
        try {
          await dbService.loadFromCloud();
          refreshData();
          setDataLoadError(false);
        } catch {
          setDataLoadError(true);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    init();

    // 2. Listen for auth changes (login/logout)
    const { data: authListener } = dbService.onAuthStateChange(async (newSession) => {
      setSession(newSession);
      if (!newSession) {
        dbService.clearInMemoryData();
        refreshData();
        setDataLoadError(false);
        setIsLoading(false);
      } else {
        setIsLoading(true);
        setDataLoadError(false);
        try {
          await dbService.loadFromCloud();
          refreshData();
        } catch {
          setDataLoadError(true);
        } finally {
          setIsLoading(false);
        }
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.designMode = designMode;
    sessionStorage.setItem('edugestion_design_mode', designMode);
  }, [designMode]);

  useEffect(() => {
    const palettes: Record<string, [string, string]> = {
      '#FF441F': ['#FF441F', '#FF6B4A'], '#7C3AED': ['#7C3AED', '#A78BFA'],
      '#2563EB': ['#2563EB', '#60A5FA'], '#DC2626': ['#DC2626', '#F87171'],
      '#059669': ['#059669', '#34D399'], '#D97706': ['#D97706', '#FBBF24'],
      '#DB2777': ['#DB2777', '#F472B6'], '#0891B2': ['#0891B2', '#22D3EE'],
    };
    const main = settings.accentColor === 'custom' ? (settings.colorHex || '#7C3AED') : settings.accentColor;
    const light = palettes[main]?.[1] || `color-mix(in srgb, ${main} 62%, white)`;
    const channels = main.match(/[a-f0-9]{2}/gi)?.map(channel => parseInt(channel, 16) / 255) || [1, 0.27, 0.12];
    const getLuminance = (rgb: number[]) => rgb.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
      .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
    const luminance = getLuminance(channels);
    const contrast = luminance > 0.179 ? '#17212B' : '#FFFFFF';
    const lightTextChannels = [...channels];
    while (getLuminance(lightTextChannels) > 0.17) lightTextChannels.forEach((channel, index) => { lightTextChannels[index] = channel * 0.92; });
    const darkTextChannels = [...channels];
    while (getLuminance(darkTextChannels) < 0.22) darkTextChannels.forEach((channel, index) => { darkTextChannels[index] += (1 - channel) * 0.08; });
    const toHex = (rgb: number[]) => `#${rgb.map(value => Math.round(value * 255).toString(16).padStart(2, '0')).join('')}`;
    document.documentElement.style.setProperty('--accent-text-light', toHex(lightTextChannels));
    document.documentElement.style.setProperty('--accent-text-dark', toHex(darkTextChannels));
    document.documentElement.style.setProperty('--accent-color', main);
    document.documentElement.style.setProperty('--accent-light', light);
    document.documentElement.style.setProperty('--accent-hover', `color-mix(in srgb, ${main} 84%, black)`);
    document.documentElement.style.setProperty('--accent-contrast', contrast);
  }, [settings.accentColor, settings.colorHex]);

  useEffect(() => {
    if (!session || settings.autoLockMinutes <= 0) return;
    let timer: ReturnType<typeof setTimeout>;
    const lockAfterInactivity = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { void dbService.logout(); }, settings.autoLockMinutes * 60_000);
    };
    const activityEvents: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach(eventName => window.addEventListener(eventName, lockAfterInactivity, { passive: true }));
    lockAfterInactivity();
    return () => {
      clearTimeout(timer);
      activityEvents.forEach(eventName => window.removeEventListener(eventName, lockAfterInactivity));
    };
  }, [session, settings.autoLockMinutes]);

  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  useEffect(() => {
    sessionStorage.setItem('currentScreen', currentScreen);
  }, [currentScreen]);

  useEffect(() => {
    if (selectedGroupId) {
      sessionStorage.setItem('selectedGroupId', selectedGroupId);
    } else {
      sessionStorage.removeItem('selectedGroupId');
    }
  }, [selectedGroupId]);

  const handleSelectScreen = (screen: ActiveScreen) => {
    if (screen === 'grades') {
      setSelectedGroupId(null);
    }
    setCurrentScreen(screen);
  };

  const handleLockApp = async () => {
    await dbService.logout();
  };

  if (isInitializingAuth) {
    return <LoadingScreen message="Conectando con el servicio de acceso" />;
  }

  if (!session) {
    return <LoginScreen />;
  }

  if (isLoading) {
    return <LoadingScreen message="Sincronizando datos escolares" />;
  }

  if (dataLoadError) {
    return <ConnectionErrorScreen onRetry={async () => {
      setIsLoading(true);
      setDataLoadError(false);
      try {
        await dbService.loadFromCloud();
        refreshData();
      } catch {
        setDataLoadError(true);
      } finally {
        setIsLoading(false);
      }
    }} />;
  }

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#FF6B4A] selection:text-white">
      <a className="skip-link" href="#main-content">Saltar al contenido principal</a>
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
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 print:max-w-none print:p-0">
        <Suspense fallback={<LoadingScreen message="Cargando sección" />}>
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
          />
        )}
        </Suspense>
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
          <button 
            onClick={() => setIsWhatsNewOpen(true)}
            className="border-l border-gray-200 dark:border-[#333333] pl-3 text-[#FF441F] font-bold hover:text-[#E03514] transition-colors cursor-pointer flex items-center gap-1"
          >
            Versión {CURRENT_VERSION}
          </button>
        </div>
      </footer>

      {/* WhatsNew Release Notes Modal */}
      <WhatsNewModal
        isOpen={isWhatsNewOpen}
        onClose={() => {
          sessionStorage.setItem('edugestion_last_version', CURRENT_VERSION);
          setIsWhatsNewOpen(false);
        }}
        version={CURRENT_VERSION}
      />
    </div>
  );
}

export default App;
