import React from 'react';
import { 
  School, 
  Users, 
  CheckSquare, 
  GraduationCap, 
  FileSpreadsheet, 
  Settings, 
  Database, 
  Lock, 
  FolderGit2,
  HardDrive,
  LayoutDashboard,
  Sun,
  Moon
} from 'lucide-react';
import { ActiveScreen, UserSettings } from '../types';

interface HeaderProps {
  currentScreen: ActiveScreen;
  onSelectScreen: (screen: ActiveScreen) => void;
  onLockApp: () => void;
  settings: UserSettings;
  stats: {
    totalGroups: number;
    totalStudents: number;
  };
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onSelectScreen,
  onLockApp,
  settings,
  stats,
  onToggleTheme
}) => {
  const navItems = [
    { id: 'dashboard' as ActiveScreen, label: 'Inicio', icon: LayoutDashboard },
    { id: 'global_students' as ActiveScreen, label: 'Directorio Global', icon: Users },
    { id: 'groups_students' as ActiveScreen, label: 'Mis Grupos', icon: FolderGit2 },
    { id: 'attendance' as ActiveScreen, label: 'Pase de Lista', icon: CheckSquare },
    { id: 'grades' as ActiveScreen, label: 'Calificaciones', icon: GraduationCap },
    { id: 'reports' as ActiveScreen, label: 'Reportes y Sábanas', icon: FileSpreadsheet },
    { id: 'settings' as ActiveScreen, label: 'Ajustes del Sistema', icon: Settings },
  ];

  return (
    <header className="bg-slate-800 text-slate-100 border-b border-slate-700 shadow-sm select-none sticky top-0 z-40">
      {/* Top Desktop Window Titlebar */}
      <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-950/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded bg-blue-700 flex items-center justify-center text-white shadow-xs">
            <School className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100 tracking-tight text-[13px]">
              EduGestión Escolar
            </span>
            <span className="text-slate-500 font-mono text-[11px] hidden sm:inline">
              | {settings.schoolName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs">
            <span className="text-slate-400">Docente:</span>
            <span className="font-semibold text-slate-100">{settings.teacherName}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/90 border border-slate-700 text-slate-300 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-slate-200">Ciclo Escolar 2025-2026</span>
            <span className="text-slate-400 text-[11px] hidden lg:inline">({stats.totalGroups} {stats.totalGroups === 1 ? 'grupo' : 'grupos'} | {stats.totalStudents} {stats.totalStudents === 1 ? 'alumno' : 'alumnos'})</span>
          </div>

          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium transition-colors shadow-xs"
              title={settings.theme === 'dark' ? 'Cambiar a Tema Claro' : 'Cambiar a Tema Oscuro'}
            >
              {settings.theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline text-[11px]">Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-300" />
                  <span className="hidden sm:inline text-[11px]">Modo Oscuro</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={onLockApp}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-800 text-xs font-semibold transition-colors shadow-xs"
            title="Cerrar sesión"
          >
            <Lock className="w-3.5 h-3.5 text-red-300" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Classic Desktop Tab Navigation */}
      <div className="bg-slate-800 px-3 flex items-end overflow-x-auto pt-1 gap-1 border-b border-slate-300">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectScreen(item.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all border-t border-x rounded-t ${
                isActive
                  ? 'bg-white text-blue-900 border-slate-300 shadow-xs relative -mb-[1px] font-bold z-10'
                  : 'bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
