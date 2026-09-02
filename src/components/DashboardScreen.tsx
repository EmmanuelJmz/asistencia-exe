import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckSquare, 
  GraduationCap, 
  PlusCircle, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  Printer
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
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = now.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const fullDate = now.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalActivities = dbService.getActivities().length;

  return (
    <div className="space-y-3">
      {/* Desktop Command Bar with Integrated Live System Time */}
      <div className="bg-white border border-slate-300 rounded p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        {/* Sober Desktop System Clock & Date */}
        <div className="flex items-center gap-3 text-slate-800">
          <div className="px-2.5 py-1.5 rounded bg-slate-100 border border-slate-300 text-slate-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-600" />
            <span className="font-mono text-xs font-bold tracking-wider text-slate-900">
              {timeString}
            </span>
          </div>

          <div className="text-xs">
            <span className="font-semibold text-slate-900 capitalize block">
              {fullDate}
            </span>
            <span className="text-[11px] text-slate-500">
              Panel de Control Escolar • Ciclo 2025-2026
            </span>
          </div>
        </div>

        {/* Functional Desktop Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => onNavigate('attendance')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-700 hover:bg-blue-800 text-white font-medium shadow-xs transition-colors border border-blue-800"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Pase de Lista</span>
          </button>
          <button
            onClick={() => onNavigate('grades')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium transition-colors border border-slate-300"
          >
            <GraduationCap className="w-3.5 h-3.5 text-slate-700" />
            <span>Calificaciones</span>
          </button>
          <button
            onClick={() => onNavigate('groups_students')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium transition-colors border border-slate-300"
          >
            <PlusCircle className="w-3.5 h-3.5 text-slate-700" />
            <span>Alumnos y Grupos</span>
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium transition-colors border border-slate-300"
          >
            <Printer className="w-3.5 h-3.5 text-slate-700" />
            <span>Reportes</span>
          </button>
        </div>
      </div>

      {/* Sober Institutional Status Strip (Replaces AI metric cards) */}
      <div className="bg-slate-100 border border-slate-300 rounded px-4 py-2 flex flex-wrap items-center justify-between gap-y-2 text-xs text-slate-700">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Grupos:</span>
            <span className="font-mono font-bold text-slate-900">{stats.totalGroups}</span>
          </div>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Alumnos inscritos:</span>
            <span className="font-mono font-bold text-slate-900">{stats.totalStudents}</span>
          </div>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Pases de lista:</span>
            <span className="font-mono font-bold text-slate-900">{stats.totalAttendanceRecords}</span>
          </div>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Actividades:</span>
            <span className="font-mono font-bold text-slate-900">{totalActivities}</span>
          </div>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Notas asentadas:</span>
            <span className="font-mono font-bold text-slate-900">{stats.totalGrades}</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          Base de Datos Local: Activa
        </div>
      </div>

      {/* Main Groups Section */}
      <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
        <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Grupos Escolares Asignados
            </h2>
          </div>
          {groups.length > 0 && (
            <button
              onClick={() => onNavigate('groups_students')}
              className="text-xs text-blue-700 hover:text-blue-900 flex items-center gap-1 font-semibold"
            >
              <span>Gestionar grupos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {groups.length === 0 ? (
          <div className="p-8 text-center bg-slate-50/50 space-y-3">
            <div className="w-10 h-10 rounded bg-slate-100 border border-slate-300 text-slate-600 flex items-center justify-center mx-auto">
              <Users className="w-5 h-5" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-sm font-bold text-slate-800">
                No hay grupos escolares registrados
              </h3>
              <p className="text-xs text-slate-600">
                El sistema se encuentra en estado inicial limpio. Registre sus grupos y cargue sus listas de alumnos para comenzar a pasar lista y calificar actividades.
              </p>
            </div>
            <div>
              <button
                onClick={() => onNavigate('groups_students')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors border border-blue-800"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Registrar Primer Grupo</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3.5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50/50">
            {groups.map(group => {
              const groupStudents = students.filter(s => s.groupId === group.id);
              const activeCount = groupStudents.filter(s => s.status === 'Active').length;
              const groupActs = dbService.getActivities(group.id).length;

              return (
                <div
                  key={group.id}
                  className="bg-white border border-slate-300 rounded p-3 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">
                        {group.name}
                      </h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                        {group.shift}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      Grado {group.grade} • Sección "{group.section}" • Ciclo {group.schoolYear}
                    </p>

                    <div className="text-[11px] text-slate-500 pt-0.5">
                      <strong className="text-slate-800 font-mono">{activeCount}</strong> alumnos inscritos • <strong className="text-slate-800 font-mono">{groupActs}</strong> actividades
                    </div>
                  </div>

                  {/* Direct Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                    <button
                      onClick={() => {
                        onSelectGroupForAttendance(group.id);
                        onNavigate('attendance');
                      }}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-medium transition-colors"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-slate-700" />
                      <span>Pase de lista</span>
                    </button>
                    <button
                      onClick={() => {
                        onSelectGroupForGrades(group.id);
                        onNavigate('grades');
                      }}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-medium transition-colors"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-slate-700" />
                      <span>Calificaciones</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Institutional Operational Panes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white border border-slate-300 rounded p-3.5 shadow-xs space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-slate-700" />
              <span>Resguardo Local y Privacidad</span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300">
              Almacenamiento Local
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Los datos escolares, asistencias y calificaciones se conservan en este dispositivo. Puede generar respaldos completos en formato JSON o exportar a SQLite en cualquier momento desde Ajustes.
          </p>
          <div className="pt-1">
            <button
              onClick={() => onNavigate('settings')}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-medium"
            >
              Ir a Ajustes y Respaldos
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-300 rounded p-3.5 shadow-xs space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <FileSpreadsheet className="w-4 h-4 text-slate-700" />
              <span>Informes y Sábanas Oficiales</span>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-blue-700 hover:underline font-semibold"
            >
              Abrir reportes →
            </button>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Consulte concentrados mensuales de asistencia, sábanas de notas trimestrales y exporte tablas directas a Excel (CSV) para entregas a dirección o supervisión escolar.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onNavigate('reports')}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-medium"
            >
              Exportar a Excel / CSV
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-medium"
            >
              Vista de Impresión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
