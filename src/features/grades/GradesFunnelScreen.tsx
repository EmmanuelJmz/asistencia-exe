import React from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Layers, 
  Calendar, 
  Save, 
  CheckCircle2, 
  TrendingUp, 
  Award, 
  AlertCircle,
  PlusCircle,
  ArrowLeft,
  Edit2,
  Trash2,
  FileSpreadsheet,
  CheckSquare,
  Clock,
  Printer,
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import { 
  Group, 
  Student, 
  Subject, 
  Period, 
  Grade, 
  Activity, 
} from '../../shared/types';
import { schoolData } from '../../application/schoolData';
import { GradesFunnelScreenProps, useGradesFunnelController } from './hooks/useGradesFunnelController';
import { ACTIVITY_TYPES } from './model/activityTypes';
import { ActivityFormModal } from './components/ActivityFormModal';


export const GradesFunnelScreen: React.FC<GradesFunnelScreenProps> = (props) => {
  const controller = useGradesFunnelController(props);
  const {
    groups, students, subjects, periods, selectedGroupId, onSelectGroup, onDataChanged,
  } = props;
  const {
    activeGroup,
    currentTab,
    setCurrentTab,
    gradingActivityId,
    setGradingActivityId,
    filterType,
    setFilterType,
    isModalOpen,
    setIsModalOpen,
    editingActivity,
    setEditingActivity,
    modalForm,
    setModalForm,
    scoresMap,
    setScoresMap,
    isSavedBanner,
    activeStudents,
    groupActivities,
    filteredActivities,
    activeActivity,
    handleOpenNewModal,
    handleOpenEditModal,
    handleSaveActivityModal,
    handleDeleteActivity,
    handleScoreChange,
    handleObservationChange,
    handleFillAllWith,
    handleSaveAllGrades,
    parsedScores,
    average,
    approvedCount,
    failingCount,
    highest,
    lowest,
    getTypeColor,
  } = controller;

  // =========================================================================
  // VIEW 1: VISTA GENERAL DE GRUPOS (Si no hay grupo seleccionado)
  // =========================================================================
  if (!activeGroup) {
    return (
      <div className="space-y-3">
        {/* Header Bar */}
        <div className="rappi-card p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-50 border border-orange-200 text-[#FF441F]">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900">
                Calificaciones y Actividades Escolares
              </h1>
              <p className="text-[11px] text-slate-500">
                Seleccione un grupo escolar para gestionar sus tareas, exámenes y sábana de calificaciones.
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-600 font-medium">
            {groups.length} {groups.length === 1 ? 'grupo registrado' : 'grupos registrados'}
          </div>
        </div>

        {/* Groups Grid */}
        {groups.length === 0 ? (
          <div className="rappi-card p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center mx-auto text-slate-500">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-sm font-bold text-slate-800">No hay grupos escolares registrados</h3>
              <p className="text-xs text-slate-500">
                Para asentar calificaciones y gestionar tareas, primero registre un grupo escolar en el sistema.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {groups.map(group => {
              const groupStudents = students.filter(s => s.groupId === group.id && s.status === 'Active');
              const activities = schoolData.getActivities(group.id);
              const groupGrades = schoolData.getAllGradesForGroup(group.id);
              const totalExpectedGrades = groupStudents.length * activities.length;
              const avgScore = totalExpectedGrades > 0
                ? (groupGrades.reduce((acc, g) => acc + g.score, 0) / totalExpectedGrades).toFixed(1)
                : 'Sin calificaciones';

              return (
                <div
                  key={group.id}
                  onClick={() => onSelectGroup(group.id)}
                  className="rappi-card p-4 cursor-pointer hover:border-[#FF441F]/40 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#FF441F] transition-colors">
                          {group.name}
                        </h3>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                        {group.schoolYear}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 pt-1 border-t border-slate-200 flex items-center justify-between">
                      <span>Alumnos: <strong className="font-mono text-slate-800">{groupStudents.length}</strong></span>
                      <span>Actividades: <strong className="font-mono text-slate-800">{activities.length}</strong></span>
                      <span>Promedio: <strong className="font-mono text-slate-900">{avgScore}</strong></span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-[#FF441F]">
                    <span>Abrir Cuaderno de Calificaciones</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#FF441F] transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: CALIFICAR UNA ACTIVIDAD ESPECÍFICA
  // =========================================================================
  if (activeActivity) {
    return (
      <div className="space-y-3">
        {/* Top Activity Header */}
        <div className="rappi-card p-4 space-y-2.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setGradingActivityId(null)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver</span>
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold text-slate-900">
                    {activeActivity.title}
                  </h1>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getTypeColor(activeActivity.type)}`}>
                    {activeActivity.type}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Grupo: <strong className="text-slate-700">{activeGroup.name}</strong> • Entrega: {activeActivity.dueDate} • Escala: 0.0 a {activeActivity.maxScore}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAllGrades}
                disabled={activeStudents.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 rappi-btn-primary text-xs disabled:opacity-50 shadow-md"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Calificaciones</span>
              </button>
            </div>
          </div>

          {/* Quick Score Fill Preset Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-medium">Asignar calificación rápida a todos:</span>
              {['10.0', '9.0', '8.0', '7.0', '5.0'].map(scorePreset => (
                <button
                  key={scorePreset}
                  type="button"
                  onClick={() => handleFillAllWith(scorePreset)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs border border-slate-300 transition-colors"
                  title={`Asignar ${scorePreset} a todos`}
                >
                  {scorePreset}
                </button>
              ))}
            </div>

            <div className="text-[11px] text-slate-500">
              Total alumnos: <strong className="text-slate-800">{activeStudents.length}</strong>
            </div>
          </div>
        </div>

        {/* Success Save Banner */}
        {isSavedBanner && (
          <div className="p-2 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center justify-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">Calificaciones guardadas exitosamente.</span>
          </div>
        )}

        {/* Compact Desktop Summary Strip (Replaces the 5 hero metric cards) */}
        <div className="bg-slate-100 border border-slate-300 rounded px-3 py-1.5 flex flex-wrap items-center justify-between gap-y-1 text-xs text-slate-700">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span>Promedio: <strong className="font-mono text-slate-900 font-bold">{average}</strong></span>
            <span className="text-slate-300">|</span>
            <span>Aprobados (≥ 6.0): <strong className="font-mono text-emerald-700 font-bold">{approvedCount}</strong></span>
            <span className="text-slate-300">|</span>
            <span>Reprobados (&lt; 6.0): <strong className="font-mono text-red-600 font-bold">{failingCount}</strong></span>
            <span className="text-slate-300">|</span>
            <span>Calificación Máx: <strong className="font-mono text-slate-800 font-bold">{highest}</strong></span>
            <span className="text-slate-300">|</span>
            <span>Calificación Mín: <strong className="font-mono text-slate-800 font-bold">{lowest}</strong></span>
          </div>
          <span className="text-[11px] text-slate-500">Escala oficial: 0.0 - {activeActivity.maxScore || 10.0}</span>
        </div>

        {/* Students Grade Table */}
        <div className="rappi-card overflow-hidden">
          <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Lista de Alumnos ({activeStudents.length})
            </h3>
            <span className="text-[11px] text-slate-500">
              Escala oficial: 0.0 - {activeActivity.maxScore || 10.0}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-300">
                  <th className="py-2 px-3 w-12 text-center border-r border-slate-200">N°</th>
                  <th className="py-2 px-3 border-r border-slate-200">Apellidos y Nombres</th>
                  <th className="py-2 px-3 w-32 text-center border-r border-slate-200">Calificación</th>
                  <th className="py-2 px-3">Observación / Retroalimentación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {activeStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      No hay alumnos activos registrados en este grupo escolar.
                    </td>
                  </tr>
                ) : (
                  activeStudents.map(student => {
                    const studentData = scoresMap[student.id] || { score: '10.0', observation: '' };
                    const scoreNum = parseFloat(studentData.score) || 0;
                    const isPassing = scoreNum >= 6.0;

                    return (
                      <tr key={student.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-2 px-3 text-center font-mono font-bold text-slate-600 border-r border-slate-200 bg-slate-50/50">
                          {student.rollNumber}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200">
                          <span className="font-bold text-slate-900 block">
                            {student.lastName}
                          </span>
                          <span className="text-slate-600 text-[11px]">
                            {student.firstName}
                          </span>
                        </td>

                        <td className="py-2 px-3 text-center border-r border-slate-200">
                          <div className="flex items-center justify-center">
                            <input
                              type="number"
                              aria-label={`Calificación de ${student.firstName} ${student.lastName}`}
                              min="0"
                              max={activeActivity.maxScore || 10}
                              step="0.1"
                              value={studentData.score}
                              onChange={(e) => handleScoreChange(student.id, e.target.value)}
                              className={`w-20 px-2 py-1 rounded border font-mono font-bold text-center text-xs shadow-inner focus:outline-none ${
                                isPassing
                                  ? 'border-emerald-400 bg-emerald-50/30 text-emerald-800 focus:border-emerald-600'
                                  : 'border-red-400 bg-red-50/30 text-red-700 focus:border-red-600'
                              }`}
                            />
                          </div>
                        </td>

                        <td className="py-2 px-3">
                          <input
                            type="text"
                            aria-label={`Observación para ${student.firstName} ${student.lastName}`}
                            value={studentData.observation}
                            onChange={(e) => handleObservationChange(student.id, e.target.value)}
                            placeholder="Comentario para el alumno o tutor (opcional)..."
                            className="w-full px-2.5 py-1 rounded bg-white border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-inner"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ESPACIO DEL GRUPO (CLASSROOM WORKSPACE)
  // =========================================================================
  return (
    <div className="space-y-4">
      {/* Group Navigation Bar */}
      <div className="rappi-card p-4 space-y-3 mb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectGroup(null)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ver Todos los Grupos</span>
            </button>

            <div className="flex items-center gap-2">
              <div
                className="w-3.5 h-3.5 rounded"
                style={{ backgroundColor: activeGroup.colorHex || '#1E3A8A' }}
              />
              <h1 className="text-sm font-bold text-slate-900">
                {activeGroup.name}
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
                {activeGroup.shift} • {activeGroup.schoolYear}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenNewModal}
              className="flex items-center gap-1.5 px-4 py-2 rappi-btn-primary text-xs shadow-md"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Nueva Actividad / Tarea</span>
            </button>
          </div>
        </div>

        {/* Workspace Tab switcher */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200 text-xs">
          <button
            onClick={() => setCurrentTab('activities')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-colors ${
              currentTab === 'activities'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-300 bg-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Actividades y Tareas ({groupActivities.length})</span>
          </button>

          <button
            onClick={() => setCurrentTab('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-colors ${
              currentTab === 'matrix'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-300 bg-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Sábana General de Calificaciones</span>
          </button>
        </div>
      </div>

      {/* ================= PESTAÑA: ACTIVIDADES (CLASSROOM STREAM) ================= */}
      {currentTab === 'activities' && (
        <div className="space-y-3">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white border border-slate-300 rounded p-2 text-xs">
            <span className="text-[11px] text-slate-500 font-medium mr-1">Filtrar:</span>
            {['Todas', ...ACTIVITY_TYPES].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded font-medium text-xs transition-colors ${
                  filterType === type
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Activities List / Empty State */}
          {groupActivities.length === 0 ? (
            <div className="bg-white border border-slate-300 rounded p-8 text-center shadow-xs space-y-3">
              <div className="w-10 h-10 rounded bg-slate-100 border border-slate-300 text-slate-500 flex items-center justify-center mx-auto">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-sm font-bold text-slate-800">
                  No hay actividades registradas en este grupo
                </h3>
                <p className="text-xs text-slate-500">
                  Cree su primera tarea, proyecto o examen para asentar las calificaciones de sus alumnos.
                </p>
              </div>
              <div>
                <button
                  onClick={handleOpenNewModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors border border-blue-800"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Crear Primera Actividad</span>
                </button>
              </div>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="bg-white border border-slate-300 rounded p-8 text-center text-xs text-slate-500">
              No hay actividades correspondientes a la categoría seleccionada ("{filterType}").
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredActivities.map(act => {
                const actGrades = schoolData.getActivityGrades(act.id);
                const gradedCount = actGrades.length;
                const actAvg = activeStudents.length > 0
                  ? (actGrades.reduce((acc, g) => acc + g.score, 0) / activeStudents.length).toFixed(1)
                  : 'Pendiente';

                return (
                  <div
                    key={act.id}
                    className="bg-white border border-slate-300 rounded p-3.5 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-400 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border inline-block ${getTypeColor(act.type)}`}>
                            {act.type}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 leading-snug">
                            {act.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(act)}
                            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                            title="Editar actividad"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteActivity(act.id, act.title)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                            title="Eliminar actividad"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {act.description && (
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {act.description}
                        </p>
                      )}

                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Entrega: <strong className="text-slate-700">{act.dueDate}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Puntaje máx: <strong className="text-slate-700">{act.maxScore}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Promedio: <strong className="text-blue-700 font-mono">{actAvg}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[11px] text-slate-600 font-medium">
                        {gradedCount > 0 ? (
                          <span className="text-emerald-700 font-semibold">
                            {gradedCount} de {activeStudents.length} calificados
                          </span>
                        ) : (
                          <span className="text-amber-700">Sin calificar aún</span>
                        )}
                      </span>

                      <button
                        onClick={() => setGradingActivityId(act.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rappi-btn-primary text-xs shadow-md"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>{gradedCount > 0 ? 'Modificar Calificaciones' : 'Calificar Alumnos'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= PESTAÑA: SÁBANA GENERAL DE CALIFICACIONES ================= */}
      {currentTab === 'matrix' && (
        <div className="rappi-card overflow-hidden space-y-0">
          <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Sábana General de Calificaciones • {activeGroup.name}
            </h3>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Sábana</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-300">
                  <th className="py-2 px-3 w-10 text-center border-r border-slate-200">N°</th>
                  <th className="py-2 px-3 min-w-44 border-r border-slate-200">Alumno</th>
                  {groupActivities.map(act => (
                    <th key={act.id} className="py-2 px-2.5 text-center border-r border-slate-200 min-w-28">
                      <span className="block truncate font-bold text-slate-800" title={act.title}>
                        {act.title}
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        {act.type}
                      </span>
                    </th>
                  ))}
                  <th className="py-2 px-3 w-28 text-center bg-blue-50/60 text-blue-900 font-bold">
                    Promedio
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {activeStudents.length === 0 ? (
                  <tr>
                    <td colSpan={groupActivities.length + 3} className="py-8 text-center text-slate-500">
                      No hay alumnos activos registrados en este grupo.
                    </td>
                  </tr>
                ) : (
                  activeStudents.map(student => {
                    const studentScores = groupActivities.map(act => {
                      const found = schoolData.getActivityGrades(act.id).find(g => g.studentId === student.id);
                      return found ? found.score : 0;
                    });

                    const finalAvg = groupActivities.length > 0
                      ? (studentScores.reduce((a, b) => a + b, 0) / groupActivities.length).toFixed(1)
                      : 'N/A';

                    return (
                      <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 text-center font-mono font-bold text-slate-600 border-r border-slate-200 bg-slate-50/50">
                          {student.rollNumber}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200">
                          <span className="font-bold text-slate-900 block">{student.lastName}</span>
                          <span className="text-slate-600 text-[11px]">{student.firstName}</span>
                        </td>

                        {groupActivities.map(act => {
                          const grade = schoolData.getActivityGrades(act.id).find(g => g.studentId === student.id);
                          const score = grade ? grade.score : null;
                          return (
                            <td key={act.id} className="py-2 px-2.5 text-center font-mono border-r border-slate-200">
                              {score !== null ? (
                                <span className={score >= 6 ? 'text-slate-800 font-bold' : 'text-red-600 font-bold'}>
                                  {score.toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                          );
                        })}

                        <td className="py-2 px-3 text-center font-mono font-bold text-sm bg-blue-50/40 text-blue-950">
                          {finalAvg}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ActivityFormModal controller={controller} />
    </div>
  );
};
