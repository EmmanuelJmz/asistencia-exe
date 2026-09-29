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
  const [selectedNote, setSelectedNote] = useState<TeacherNote | null>(null);

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
      <div className="relative overflow-hidden rounded-[2rem] bg-[#FF441F] text-white p-6 md:p-10 shadow-lg shadow-[#FF441F]/20">
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
            <div className="text-[#FFD1C7] text-sm flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 opacity-80" />
              <span className="capitalize">{dateString}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Grupos Activos', value: stats.totalGroups, icon: Users, color: 'bg-gray-100 text-gray-800 dark:bg-[#333333] dark:text-gray-100' },
          { label: 'Alumnos', value: stats.totalStudents, icon: GraduationCap, color: 'bg-[#FF441F]/10 text-[#FF441F] dark:bg-[#FF441F]/20' },
          { label: 'Lista de Hoy', value: `${stats.completedGroupsToday} / ${stats.totalGroups}`, icon: CalendarCheck, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
          { label: 'Actividades', value: allActivities.length, icon: Activity, color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
        ].map((kpi, idx) => (
          <div key={idx} className="rappi-card p-5 flex items-center gap-4 group hover:-translate-y-1 transition-transform duration-300">
            <div className={`p-3.5 rounded-2xl ${kpi.color} transition-colors`}>
              <kpi.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-0.5">{kpi.label}</p>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white leading-none">{kpi.value}</p>
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
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-[#FF441F]" />
                Mis Grupos Escolares
              </h2>
              <button 
                onClick={() => onNavigate('groups_students')}
                className="text-sm font-bold text-[#FF441F] hover:text-[#E03514] flex items-center gap-1 transition-colors"
              >
                Ver todos <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {groups.length === 0 ? (
              <div className="rappi-card border-dashed border-2 p-10 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 bg-gray-50 dark:bg-[#2A2A2A] rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                  <Users className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Aún no hay grupos</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mt-2">Crea tu primer grupo para comenzar a pasar lista, registrar actividades y generar reportes oficiales.</p>
                </div>
                <button
                  onClick={() => onNavigate('groups_students')}
                  className="mt-4 inline-flex items-center gap-2 px-6 py-3 rappi-btn-primary"
                >
                  <PlusCircle className="w-5 h-5" />
                  Crear Nuevo Grupo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {groups.map(group => {
                  const groupStudents = students.filter(s => s.groupId === group.id);
                  const activeCount = groupStudents.filter(s => s.status === 'Active').length;
                  
                  return (
                    <div key={group.id} className="rappi-card p-6 flex flex-col justify-between hover:shadow-md hover:border-[#FF441F]/30 transition-all">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                            {group.name}
                          </h3>
                          <span className="text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-[#2A2A2A] text-gray-500 dark:text-gray-400">
                            {group.shift}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6">
                          Grado {group.grade} • Sec "{group.section}"
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-8">
                          <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#2A2A2A] px-3 py-1.5 rounded-xl">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="font-bold">{activeCount}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#2A2A2A] px-3 py-1.5 rounded-xl">
                            <Activity className="w-4 h-4 text-gray-400" />
                            <span className="font-bold">{dbService.getActivities(group.id).length}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-auto">
                        <button
                          onClick={() => { onSelectGroupForAttendance(group.id); onNavigate('attendance'); }}
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#2A2A2A] dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300 font-bold text-xs transition-colors"
                        >
                          <CheckSquare className="w-4 h-4" />
                          Pase de Lista
                        </button>
                        <button
                          onClick={() => { onSelectGroupForGrades(group.id); onNavigate('grades'); }}
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#2A2A2A] dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300 font-bold text-xs transition-colors"
                        >
                          <GraduationCap className="w-4 h-4" />
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
          <div className="rappi-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                Alertas de Actividades
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {activityAlerts.length} Pendientes
              </span>
            </div>

            {activityAlerts.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                 ¡Todo al día! No hay actividades próximas a vencer ni calificaciones pendientes de captura.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {activityAlerts.map(item => (
                  <div 
                    key={item.activity.id}
                    className={`p-3 rounded-lg border flex items-center justify-between gap-3 text-xs transition-all ${
                      item.isPastDue 
                        ? 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/30 dark:border-red-900/60 dark:text-red-100'
                        : 'bg-amber-50/70 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/60 dark:text-amber-100'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                          item.isPastDue ? 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-200' : 'bg-amber-200 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200'
                        }`}>
                          {item.isPastDue ? '⚠️ Pendiente Calificar' : '📌 Entrega Próxima'}
                        </span>
                        <strong className="text-slate-900">{item.activity.title}</strong>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Grupo: <strong>{item.group?.name || 'Desconocido'}</strong> • Entrega: <strong>{item.activity.dueDate}</strong>
                        <span> • <strong className="text-slate-800">{item.gradedCount} de {item.totalStudents} calificados</strong> • <strong className="text-red-700">{item.pendingCount} pendientes</strong></span>
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
          <div className="rappi-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <StickyNote className="w-6 h-6 text-[#FF441F]" />
                Notas Rápidas
              </h2>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-[#333333] text-gray-500 dark:text-gray-400">
                {notes.filter(n => !n.completed).length} pendientes
              </span>
            </div>

            {/* Quick Add Note Form */}
            <form onSubmit={handleAddNote} className="space-y-3 bg-gray-50 dark:bg-[#2A2A2A] p-4 rounded-2xl">
              <input
                type="text"
                aria-label="Título de la nota del docente"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Escribe una nota..."
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#1E1E1E] text-sm text-gray-900 dark:text-white border-none shadow-sm focus:ring-2 focus:ring-[#FF441F] placeholder-gray-400"
              />
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  aria-label="Fecha límite de la nota"
                  value={newNoteDate}
                  onChange={(e) => setNewNoteDate(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-white dark:bg-[#1E1E1E] text-sm text-gray-900 dark:text-white border-none shadow-sm focus:ring-2 focus:ring-[#FF441F]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rappi-btn-primary flex items-center gap-2 shrink-0"
                >
                  <Plus className="w-4 h-4" />
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
                        <select
                          value={note.completed ? 'completed' : 'pending'}
                          onChange={() => handleToggleNote(note.id)}
                          aria-label={`Estado de la nota: ${note.title}`}
                          className={`shrink-0 px-1.5 py-1 rounded border text-[10px] font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${
                            note.completed
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          <option value="pending">Pendiente</option>
                          <option value="completed">Realizada</option>
                        </select>
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => setSelectedNote(note)}
                            title="Abrir nota completa"
                            className={`block w-full text-left font-medium leading-snug truncate hover:underline ${
                              note.completed ? 'line-through text-slate-400' : 'text-slate-800'
                            }`}
                          >
                            {note.title}
                          </button>
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

          {selectedNote && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
              role="dialog"
              aria-modal="true"
              aria-label="Detalle de nota"
              onClick={() => setSelectedNote(null)}
            >
              <div
                className="w-full max-w-md rounded-xl bg-white border border-slate-200 shadow-2xl p-5 space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-base font-bold text-slate-900">Nota del profesor</h3>
                  <button
                    type="button"
                    onClick={() => setSelectedNote(null)}
                    className="text-slate-400 hover:text-slate-700 text-xl leading-none"
                    aria-label="Cerrar nota"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">{selectedNote.title}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className={`px-2 py-1 rounded border font-semibold ${selectedNote.completed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {selectedNote.completed ? 'Realizada' : 'Pendiente'}
                  </span>
                  {selectedNote.dueDate && <span>Fecha: {selectedNote.dueDate}</span>}
                </div>
              </div>
            </div>
          )}

          {/* Quick Navigation Links */}
          <div className="rappi-card p-6 space-y-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#FF441F]" />
              Accesos Rápidos
            </h2>
            
            <div className="flex flex-col gap-2">
              <button onClick={() => onNavigate('groups_students')} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#2A2A2A] text-left transition-colors">
                <div className="bg-gray-100 dark:bg-[#333333] text-gray-600 dark:text-gray-300 p-2.5 rounded-xl"><Users className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">Alumnos y Grupos</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Directorio e inscripciones</p>
                </div>
              </button>
              <button onClick={() => onNavigate('reports')} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#2A2A2A] text-left transition-colors">
                <div className="bg-gray-100 dark:bg-[#333333] text-gray-600 dark:text-gray-300 p-2.5 rounded-xl"><FileText className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">Reportes Oficiales</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Imprimir sábanas y boletas</p>
                </div>
              </button>
            </div>
          </div>

          {/* Cloud Sync Status */}
          <div className="bg-[#121212] rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute -top-4 -right-4 opacity-5 pointer-events-none"><Cloud className="w-32 h-32" /></div>
            <div className="relative z-10">
              <h4 className="font-bold text-base flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                Sincronización en Nube
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Tus datos están respaldados de forma segura.
              </p>
              <button onClick={() => onNavigate('settings')} className="text-sm font-bold bg-white/10 hover:bg-white/20 transition-colors px-4 py-2.5 rounded-xl border border-white/5 w-full text-center active:scale-95">
                Ver Estado
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

