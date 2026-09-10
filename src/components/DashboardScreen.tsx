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
  CalendarCheck,
  StickyNote,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Plus,
  Bell
} from 'lucide-react';
import { Group, Student, ActiveScreen, DatabaseStats, TeacherNote } from '../types';
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

  // Teacher notes state
  const [notes, setNotes] = useState<TeacherNote[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteDate, setNewNoteDate] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    setNotes(dbService.getTeacherNotes());
    return () => clearInterval(timer);
  }, []);

  const timeString = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateString = now.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const allActivities = dbService.getActivities();
  const settings = dbService.getSettings();
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate upcoming and pending grading activities
  const activityAlerts = allActivities.map(act => {
    const grp = groups.find(g => g.id === act.groupId);
    const grpStudents = students.filter(s => s.groupId === act.groupId && s.status === 'Active');
    const existingGrades = dbService.getActivityGrades(act.id);
    const gradedCount = existingGrades.length;
    const pendingCount = Math.max(0, grpStudents.length - gradedCount);

    const isPastDue = act.dueDate <= todayStr;
    const isUpcoming = !isPastDue && new Date(act.dueDate).getTime() - new Date(todayStr).getTime() <= 5 * 24 * 60 * 60 * 1000;

    return {
      activity: act,
      group: grp,
      totalStudents: grpStudents.length,
      gradedCount,
      pendingCount,
      isPastDue,
      isUpcoming,
    };
  }).filter(item => (item.isPastDue && item.pendingCount > 0) || item.isUpcoming);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;
    dbService.addTeacherNote({
      title: newNoteTitle.trim(),
      dueDate: newNoteDate || undefined,
      groupId: selectedGroupId || undefined,
    });
    setNewNoteTitle('');
    setNewNoteDate('');
    setSelectedGroupId('');
    setNotes(dbService.getTeacherNotes());
  };

  const handleToggleNote = (id: string) => {
    dbService.toggleTeacherNote(id);
    setNotes(dbService.getTeacherNotes());
  };

  const handleDeleteNote = (id: string) => {
    dbService.deleteTeacherNote(id);
    setNotes(dbService.getTeacherNotes());
  };

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
          { label: 'Lista de Hoy', value: `${stats.completedGroupsToday} / ${stats.totalGroups}`, icon: CalendarCheck, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
          { label: 'Actividades', value: allActivities.length, icon: Activity, color: 'bg-amber-50 text-amber-600 border-amber-200' },
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
        
        {/* Left Column: Groups List & Activity Alerts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Groups List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Mis Grupos Escolares
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

          {/* Activity Alerts Widget: Tareas por vencer y calificaciones pendientes */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" />
                Alertas de Actividades y Calificaciones
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {activityAlerts.length} Pendientes
              </span>
            </div>

            {activityAlerts.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                ✨ ¡Todo al día! No hay actividades próximas a vencer ni calificaciones pendientes de captura.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {activityAlerts.map(item => (
                  <div 
                    key={item.activity.id}
                    className={`p-3 rounded-lg border flex items-center justify-between gap-3 text-xs transition-all ${
                      item.isPastDue 
                        ? 'bg-red-50/70 border-red-200 text-red-900' 
                        : 'bg-amber-50/70 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                          item.isPastDue ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'
                        }`}>
                          {item.isPastDue ? '⚠️ Pendiente Calificar' : '📌 Entrega Próxima'}
                        </span>
                        <strong className="text-slate-900">{item.activity.title}</strong>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Grupo: <strong>{item.group?.name || 'Desconocido'}</strong> • Entrega: <strong>{item.activity.dueDate}</strong>
                        {item.pendingCount > 0 && (
                          <span> • <strong className="text-red-700">{item.pendingCount} de {item.totalStudents} sin calificar</strong></span>
                        )}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (item.group) onSelectGroupForGrades(item.group.id);
                        onNavigate('grades');
                      }}
                      className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-800 font-semibold border border-slate-300 shadow-xs shrink-0 text-xs flex items-center gap-1"
                    >
                      <span>Ir a Calificar</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Teacher Notes & Quick Actions */}
        <div className="space-y-6">
          
          {/* Teacher Notes & Reminders Widget */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-amber-500" />
                Notas del Profesor
              </h2>
              <span className="text-xs text-slate-500">
                {notes.filter(n => !n.completed).length} pendientes
              </span>
            </div>

            {/* Quick Add Note Form */}
            <form onSubmit={handleAddNote} className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <input
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Escribe una nota o pendiente..."
                className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-600 shadow-inner"
              />
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={newNoteDate}
                  onChange={(e) => setNewNoteDate(e.target.value)}
                  className="flex-1 px-2 py-1 rounded bg-white border border-slate-300 text-xs font-mono focus:outline-none focus:border-blue-600 shadow-inner"
                />
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir</span>
                </button>
              </div>
            </form>

            {/* Notes List */}
            {notes.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                No tienes notas guardadas. ¡Usa el formulario para recordar entregas, avisos o tareas!
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1 divide-y divide-slate-100">
                {notes.map(note => {
                  const isToday = note.dueDate === todayStr;
                  const isOverdue = note.dueDate && note.dueDate < todayStr && !note.completed;

                  return (
                    <div key={note.id} className="pt-2 first:pt-0 flex items-start justify-between gap-2 text-xs">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={note.completed}
                          onChange={() => handleToggleNote(note.id)}
                          className="mt-0.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                        />
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <p className={`font-medium leading-snug break-words ${
                            note.completed ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}>
                            {note.title}
                          </p>
                          {note.dueDate && (
                            <div className="flex items-center gap-1 text-[10px]">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span className={`font-semibold ${
                                note.completed ? 'text-slate-400' : isToday ? 'text-blue-600 font-bold' : isOverdue ? 'text-red-600 font-bold' : 'text-slate-500'
                              }`}>
                                {isToday ? 'Hoy' : note.dueDate}
                                {isOverdue && ' (Vencida)'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-slate-100 transition-colors"
                        title="Eliminar nota"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Navigation Links */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              Accesos Rápidos
            </h2>
            
            <div className="flex flex-col gap-1">
              <button onClick={() => onNavigate('groups_students')} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 text-left transition-colors">
                <div className="bg-blue-100 text-blue-600 p-1.5 rounded-lg"><Users className="w-4 h-4" /></div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-xs">Alumnos y Grupos</h4>
                  <p className="text-[11px] text-slate-500">Directorio e inscripciones</p>
                </div>
              </button>
              <button onClick={() => onNavigate('reports')} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 text-left transition-colors">
                <div className="bg-purple-100 text-purple-600 p-1.5 rounded-lg"><FileText className="w-4 h-4" /></div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-xs">Reportes Oficiales</h4>
                  <p className="text-[11px] text-slate-500">Imprimir sábanas y boletas</p>
                </div>
              </button>
            </div>
          </div>

          {/* Cloud Sync Status */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><Cloud className="w-20 h-20" /></div>
            <div className="relative z-10">
              <h4 className="font-bold text-sm flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                Supabase Sync
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                Datos sincronizados y respaldados en la nube de forma segura.
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

