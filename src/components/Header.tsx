import React, { useState } from 'react';
import {
  School,
  Users,
  CheckSquare,
  CheckCircle2,
  GraduationCap,
  FileSpreadsheet,
  Settings,
  Database,
  Lock,
  FolderGit2,
  HardDrive,
  LayoutDashboard,
  Sun,
  Moon,
  Sparkles,
  Menu,
  X
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
  designMode: 'classic' | 'new';
  onToggleDesign: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onSelectScreen,
  onLockApp,
  settings,
  stats,
  onToggleTheme,
  designMode,
  onToggleDesign
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const selectScreen = (screen: ActiveScreen) => {
    onSelectScreen(screen);
    setIsMobileMenuOpen(false);
  };
  const navItems = [
    { id: 'dashboard' as ActiveScreen, label: 'Inicio', icon: LayoutDashboard },
    { id: 'global_students' as ActiveScreen, label: 'Directorio Global', icon: Users },
    { id: 'groups_students' as ActiveScreen, label: 'Mis Grupos', icon: FolderGit2 },
    { id: 'attendance' as ActiveScreen, label: 'Pase de Lista', icon: CheckSquare },
    { id: 'grades' as ActiveScreen, label: 'Calificaciones', icon: GraduationCap },
    { id: 'reports' as ActiveScreen, label: 'Reportes y Sábanas', icon: FileSpreadsheet },
    { id: 'settings' as ActiveScreen, label: 'Ajustes del Sistema', icon: Settings },
  ];

  if (designMode === 'classic') {
    return (
      <header onKeyDown={(event) => { if (event.key === 'Escape') setIsMobileMenuOpen(false); }} className="classic-header bg-slate-800 text-slate-100 border-b border-slate-700 shadow-sm select-none sticky top-0 z-40 print:hidden">
        <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-950/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded bg-blue-700 flex items-center justify-center text-white shadow-xs"><School className="w-3.5 h-3.5" /></div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 tracking-tight text-[13px]">EduGestión Escolar</span>
              <span className="text-slate-500 font-mono text-[11px] hidden sm:inline">| {settings.schoolName}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs">
              <span className="text-slate-400">Docente:</span><span className="font-semibold text-slate-100">{settings.teacherName}</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/90 border border-slate-700 text-slate-300 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-medium text-slate-200">Ciclo Escolar 2026-2027</span>
              <span className="text-slate-400 text-[11px]">({stats.totalGroups} grupos | {stats.totalStudents} alumnos)</span>
            </div>
            <button type="button" onClick={onToggleDesign} className="design-mode-toggle" title="Probar el diseño actual">
              <Sparkles className="w-3.5 h-3.5" /><span>PROBAR NUEVO SISTEMA</span>
            </button>
            {onToggleTheme && (
              <button type="button" aria-label={settings.theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'} onClick={onToggleTheme} className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors shadow-xs" title={settings.theme === 'dark' ? 'Cambiar a Tema Claro' : 'Cambiar a Tema Oscuro'}>
                {settings.theme === 'dark' ? <><Sun className="w-3.5 h-3.5 text-amber-400" /><span className="hidden sm:inline text-[11px]">Modo Claro</span></> : <><Moon className="w-3.5 h-3.5 text-slate-300" /><span className="hidden sm:inline text-[11px]">Modo Oscuro</span></>}
              </button>
            )}
            <button type="button" aria-label="Cerrar sesión" onClick={onLockApp} className="flex items-center gap-1.5 px-3 py-1 rounded bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-800 text-xs font-semibold transition-colors shadow-xs" title="Cerrar sesión">
              <Lock className="w-3.5 h-3.5 text-red-300" /><span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
          <button type="button" className="mobile-menu-toggle" aria-label={isMobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'} aria-expanded={isMobileMenuOpen} aria-controls="mobile-main-nav-classic" onClick={() => setIsMobileMenuOpen(open => !open)}>
            {isMobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
        <nav aria-label="Navegación principal" className="desktop-main-nav bg-slate-800 px-3 items-end overflow-x-auto pt-1 gap-1 border-b border-slate-300 dark:border-slate-700">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return <button key={item.id} type="button" aria-current={isActive ? 'page' : undefined} onClick={() => selectScreen(item.id)} className={`classic-nav-tab flex items-center gap-2 px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all border-t border-x rounded-t ${isActive ? 'bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-400 border-slate-300 dark:border-slate-700 shadow-xs relative -mb-[1px] font-bold z-10' : 'bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white border-transparent'}`}>
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} /><span>{item.label}</span>
            </button>;
          })}
        </nav>
        <nav id="mobile-main-nav-classic" aria-label="Navegación móvil" hidden={!isMobileMenuOpen} className="mobile-main-nav md:hidden">
            {navItems.map(item => {
              const Icon = item.icon;
              return <button key={item.id} type="button" aria-current={currentScreen === item.id ? 'page' : undefined} onClick={() => selectScreen(item.id)}>
                <Icon aria-hidden="true" /><span>{item.label}</span>
              </button>;
            })}
        </nav>
      </header>
    );
  }

  return (
    <header onKeyDown={(event) => { if (event.key === 'Escape') setIsMobileMenuOpen(false); }} className="bg-white dark:bg-[#1E1E1E] text-gray-800 dark:text-gray-100 shadow-sm sticky top-0 z-40 print:hidden transition-colors duration-200">
      <div className="max-w-7xl mx-auto w-full">
        {/* Top Header Bar */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:border-[#333333]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FF441F] flex items-center justify-center text-white shadow-sm">
              <School className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[#FF441F] tracking-tight text-lg leading-none">
                EduGestión
              </span>
              <span className="text-gray-500 dark:text-gray-400 font-medium text-[11px] leading-tight">
                {settings.schoolName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">Docente</span>
              <span className="font-bold text-gray-800 dark:text-gray-200 leading-tight">{settings.teacherName}</span>
            </div>

            <button
              type="button"
              onClick={onToggleDesign}
              className="design-mode-toggle"
              title={designMode === 'classic' ? 'Probar el diseño nuevo' : 'Volver al diseño anterior'}
            >
              <Sparkles className="w-4 h-4" />
              <span>{designMode === 'classic' ? 'PROBAR NUEVO SISTEMA' : 'DISEÑO ANTERIOR'}</span>
            </button>

            {onToggleTheme && (
              <button
                type="button"
                aria-label={settings.theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                onClick={onToggleTheme}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-[#2A2A2A] hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-600 dark:text-gray-300 transition-colors"
                title={settings.theme === 'dark' ? 'Cambiar a Tema Claro' : 'Cambiar a Tema Oscuro'}
              >
                {settings.theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-[#FF6B4A]" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            )}

            <button
              type="button"
              className="mobile-menu-toggle md:hidden"
              aria-label={isMobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-main-nav-modern"
              onClick={() => setIsMobileMenuOpen(open => !open)}
            >
              {isMobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
            <button
              type="button"
              aria-label="Cerrar sesión"
              onClick={onLockApp}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 transition-colors"
              title="Cerrar sesión"
            >
              <Lock className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Modern Scrollable) */}
        <nav aria-label="Navegación principal" className="desktop-main-nav px-4 items-center overflow-x-auto gap-6 py-2 no-scrollbar">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => selectScreen(item.id)}
                className={`group flex flex-col items-center gap-1 py-2 text-xs font-bold whitespace-nowrap transition-all border-b-2 ${
                  isActive
                    ? 'border-[#FF441F] text-[#FF441F]'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <div className={`p-2 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-[#FF441F]/10 text-[#FF441F]'
                    : 'bg-transparent text-gray-400 group-hover:bg-gray-100 dark:group-hover:bg-[#2A2A2A]'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <nav id="mobile-main-nav-modern" aria-label="Navegación móvil" hidden={!isMobileMenuOpen} className="mobile-main-nav md:hidden">
            {navItems.map(item => {
              const Icon = item.icon;
              return <button key={item.id} type="button" aria-current={currentScreen === item.id ? 'page' : undefined} onClick={() => selectScreen(item.id)}>
                <Icon aria-hidden="true" /><span>{item.label}</span>
              </button>;
            })}
        </nav>
      </div>
    </header>
  );
};
