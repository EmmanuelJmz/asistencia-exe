import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckSquare, 
  GraduationCap, 
  PlusCircle, 
  Clock, 
  ArrowRight,
  Cloud,
  TrendingUp,
  Activity,
  FileText,
  CalendarCheck
} from 'lucide-react';
import { Group, Student, ActiveScreen, DatabaseStats } from '../types';
import { dbService } from '../db/databaseService';

interface DashboardScreenProps {
  groups: Group[];
  students: Student[];
  stats: DatabaseStats;
  onNavigate: (screen: ActiveScreen) => void;
  onSelectGroupForAttendance: (groupId: string) => void;
  onSelectGroupForGrades: (groupId: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  groups,
  students,
  stats,
  onNavigate,
  onSelectGroupForAttendance,
  onSelectGroupForGrades,
}) => {
  const [now, setNow] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateString = now.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const totalActivities = dbService.getActivities().length;
  const settings = dbService.getSettings();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-900 text-white p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/4 opacity-10 pointer-events-none">
          <Users className="w-64 h-64" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium border border-white/20 mb-2">
              <Cloud className="w-3.5 h-3.5" />
              <span>Sincronización en la Nube Activa</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Hola, {settings.teacherName}
            </h1>
            <p className="text-blue-100 font-medium text-sm md:text-base">
              {settings.schoolName} • Panel de Control Escolar
            </p>
          </div>
          
          <div className="flex flex-col items-start md:items-end space-y-1">
            <div className="flex items-center gap-2 text-2xl font-bold font-mono">
              <Clock className="w-5 h-5 opacity-80" />
              {timeString}
            </div>
            <div className="text-blue-200 text-sm capitalize">
              {dateString}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Grupos Activos', value: stats.totalGroups, icon: Users, color: 'bg-blue-50 text-blue-600 border-blue-200' },
          { label: 'Alumnos', value: stats.totalStudents, icon: GraduationCap, color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
          { label: 'Pases de Lista', value: stats.totalAttendanceRecords, icon: CalendarCheck, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
          { label: 'Actividades', value: totalActivities, icon: Activity, color: 'bg-amber-50 text-amber-600 border-amber-200' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-lg border ${kpi.color}`}>
              <kpi.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{kpi.label}</p>
              <p className="text-2xl font-bold text-slate-900 font-mono">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Groups List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Mis Grupos
            </h2>
            <button 
              onClick={() => onNavigate('groups_students')}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Ver todos <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {groups.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 border-dashed p-10 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Aún no hay grupos</h3>
                <p className="text-slate-500 text-sm max-w-sm mt-1">Crea tu primer grupo para comenzar a pasar lista, registrar actividades y generar reportes oficiales.</p>
              </div>
              <button
                onClick={() => onNavigate('groups_students')}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                <PlusCircle className="w-4 h-4" />
                Crear Nuevo Grupo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {groups.map(group => {
                const groupStudents = students.filter(s => s.groupId === group.id);
                const activeCount = groupStudents.filter(s => s.status === 'Active').length;
                
                return (
                  <div key={group.id} className="group bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {group.name}
                        </h3>
                        <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-600">
                          {group.shift}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-500 mb-4">
                        Grado {group.grade} • Sec "{group.section}"
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-6">
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span className="font-bold text-slate-800">{activeCount}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                          <Activity className="w-4 h-4 text-slate-400" />
                          <span className="font-bold text-slate-800">{dbService.getActivities(group.id).length}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { onSelectGroupForAttendance(group.id); onNavigate('attendance'); }}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs transition-colors border border-emerald-200"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        Pase de Lista
                      </button>
                      <button
                        onClick={() => { onSelectGroupForGrades(group.id); onNavigate('grades'); }}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors border border-indigo-200"
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        Calificar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Quick Actions & Status */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Accesos Rápidos
          </h2>
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-2">
            <div className="flex flex-col">
              <button onClick={() => onNavigate('groups_students')} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 text-left transition-colors">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><Users className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Alumnos y Grupos</h4>
                  <p className="text-xs text-slate-500">Inscripciones y transferencias</p>
                </div>
              </button>
              <div className="h-px bg-slate-100 mx-4"></div>
              <button onClick={() => onNavigate('reports')} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 text-left transition-colors">
                <div className="bg-purple-100 text-purple-600 p-2 rounded-lg"><FileText className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Reportes Oficiales</h4>
                  <p className="text-xs text-slate-500">Exportar sábanas a Excel</p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white shadow-lg relative overflow-hidden mt-6">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><Cloud className="w-24 h-24" /></div>
            <div className="relative z-10">
              <h4 className="font-bold text-lg flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                Supabase Sync
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                La base de datos está conectada. Los datos se guardan en tiempo real y están respaldados en la nube de forma segura.
              </p>
              <button onClick={() => onNavigate('settings')} className="text-xs font-semibold bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded-lg border border-white/10 w-full text-center">
                Ver estado del servidor
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
