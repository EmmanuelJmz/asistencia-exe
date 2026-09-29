import React from 'react';
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  UserPlus,
  Search,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  LayoutGrid,
  List
} from 'lucide-react';
import { Student } from '../../shared/types';

import { GroupsStudentsScreenProps, useGroupsStudentsController } from './hooks/useGroupsStudentsController';
import { GroupManagementModals } from './components/GroupManagementModals';

export const GroupsStudentsScreen: React.FC<GroupsStudentsScreenProps> = (props) => {
  const controller = useGroupsStudentsController(props);
  const {
    activeGroup,
    searchQuery,
    setSearchQuery,
    isNewGroupModalOpen,
    setIsNewGroupModalOpen,
    isEditGroupModalOpen,
    setIsEditGroupModalOpen,
    isNewStudentModalOpen,
    setIsNewStudentModalOpen,
    isImportModalOpen,
    setIsImportModalOpen,
    isSaving,
    editingStudent,
    setEditingStudent,
    movingStudent,
    setMovingStudent,
    deletingGroupId,
    setDeletingGroupId,
    importSearchQuery,
    setImportSearchQuery,
    selectedImportStudentIds,
    setSelectedImportStudentIds,
    studentViewMode,
    setStudentViewMode,
    groupViewMode,
    setGroupViewMode,
    groupForm,
    setGroupForm,
    studentForm,
    setStudentForm,
    targetMoveGroupId,
    setTargetMoveGroupId,
    sortBy,
    setSortBy,
    groupStudents,
    groupRecommendations,
    handleOpenNewGroup,
    handleSaveNewGroup,
    handleOpenEditGroup,
    handleSaveEditGroup,
    handleDeleteGroup,
    handleOpenNewStudent,
    handleSaveNewStudent,
    handleOpenImportModal,
    handleExecuteImport,
    handleOpenEditStudent,
    handleSaveEditStudent,
    handleToggleStudentStatus,
    handleOpenMoveStudent,
    handleConfirmMoveStudent,
    handleDeleteStudent,
  } = controller;
  const { groups, students, selectedGroupId, onSelectGroup, onDataChanged } = props;

  return (
    <div className="space-y-4">
      {/* Title & Actions Bar */}
      <div className="rappi-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-50 border border-orange-200 text-[#FF441F] dark:bg-[#FF441F]/10 dark:border-[#FF441F]/20">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">Catálogo de Grupos y Alumnos</h1>
            <p className="text-[11px] text-slate-500">
              Gestión académica local: grupos escolares, matrícula de alumnos, números de lista y traslados.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenNewGroup}
            className="flex items-center gap-1.5 px-4 py-2 rappi-btn-primary text-sm shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear Nuevo Grupo</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Groups List (4 cols) */}
        <div className="lg:col-span-4 rappi-card overflow-hidden">
          <div className="bg-slate-100 px-3 py-2 border-b border-slate-300 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Grupos ({groups.length})
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white border border-slate-300 rounded p-0.5 shrink-0">
                <button
                  onClick={() => setGroupViewMode('list')}
                  className={`p-1 rounded ${groupViewMode === 'list' ? 'bg-slate-200 text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-600'} transition-colors`}
                  title="Vista de Lista"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setGroupViewMode('grid')}
                  className={`p-1 rounded ${groupViewMode === 'grid' ? 'bg-slate-200 text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-600'} transition-colors`}
                  title="Vista de Tarjetas"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                onClick={handleOpenNewGroup}
                className="text-[11px] text-blue-700 hover:underline font-semibold"
              >
                + Añadir
              </button>
            </div>
          </div>

          <div className={`p-2  max-h-[550px] overflow-y-auto ${groupViewMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-1'}`}>
            {groups.length === 0 ? (
              <div className="col-span-full p-4 text-center text-slate-500 text-xs leading-relaxed">
                No hay grupos escolares dados de alta. Haga clic en <strong className="text-blue-700 font-semibold">+ Añadir</strong> para registrar el primer grupo.
              </div>
            ) : (
              groups.map(group => {
              const isSelected = activeGroup && activeGroup.id === group.id;
              const count = students.filter(s => s.groupId === group.id).length;
              const activeCount = students.filter(s => s.groupId === group.id && s.status === 'Active').length;

              if (groupViewMode === 'grid') {
                return (
                  <div
                    key={group.id}
                    onClick={() => onSelectGroup(group.id)}
                    className={`p-2 rounded cursor-pointer border transition-colors flex flex-col justify-between ${
                      isSelected
                        ? 'selected-group-row bg-blue-50 border-blue-400 text-blue-950 font-semibold shadow-xs'
                        : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: group.colorHex || '#1E3A8A' }}
                      />
                      {isSelected && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenEditGroup(); }}
                            className="text-slate-600 hover:text-[#FF441F]"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeletingGroupId(group.id); }}
                            className="text-slate-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1" title={group.name}>{group.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {count} Alumnos
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={group.id}
                  onClick={() => onSelectGroup(group.id)}
                  className={`p-2.5 rounded-xl cursor-pointer border transition-colors flex items-center justify-between ${
                      isSelected
                          ? 'selected-group-row bg-[#FF441F]/10 dark:bg-[#FF441F]/20 border-[#FF441F]/40 text-slate-900 font-semibold shadow-xs'
                          : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2.5 h-7 rounded shrink-0"
                      style={{ backgroundColor: group.colorHex || '#1E3A8A' }}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{group.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        {count} alumnos totales
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditGroup();
                        }}
                        className="p-1 rounded text-slate-600 hover:text-[#FF441F] hover:bg-orange-100 transition-colors"
                        title="Editar Grupo"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingGroupId(group.id);
                        }}
                        className="p-1 rounded text-slate-600 hover:text-red-700 hover:bg-red-100 transition-colors"
                        title="Eliminar Grupo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
            )}
          </div>
        </div>

        {/* Right Column: Group Roster & Student Table (8 cols) */}
        <div className="lg:col-span-8 rappi-card overflow-hidden">
          {activeGroup ? (
            <>
              {/* Active Group Header */}
              <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: activeGroup.colorHex || '#1E3A8A' }}
                    />
                    <h2 className="text-sm font-bold text-slate-900">{activeGroup.name}</h2>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-white border border-slate-300 text-slate-600">
                      Ciclo {activeGroup.schoolYear}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Grado {activeGroup.grade} | Sección "{activeGroup.section}" | Turno {activeGroup.shift}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleOpenImportModal}
                    className="flex items-center gap-1.5 px-3 py-1.5 rappi-btn-secondary text-xs"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Importar Existente</span>
                  </button>
                  <button
                    onClick={handleOpenNewStudent}
                    className="flex items-center gap-1.5 px-3 py-1.5 rappi-btn-primary text-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Inscribir Alumno</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-900/80 border-b border-slate-700 text-slate-100 shadow-inner">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 shadow-sm">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Resumen del grupo</h3>
                      <p className="text-[11px] text-slate-300">Seguimiento escolar en tiempo real</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-slate-600 bg-slate-800 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-200 shadow-sm">
                    {groupRecommendations.length} alertas
                  </span>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
                  {groupRecommendations.map(item => (
                    <div
                      key={item.id}
                      className={`rounded-2xl border p-3 shadow-sm ${
                        item.type === 'danger'
                          ? 'border-red-500/30 bg-red-950/60 text-red-50'
                          : item.type === 'warning'
                            ? 'border-amber-500/30 bg-amber-950/60 text-amber-50'
                            : 'border-orange-500/30 bg-orange-950/60 text-orange-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className={`mt-0.5 p-1.5 rounded-lg border ${
                            item.type === 'danger'
                              ? 'bg-red-500/15 text-red-200 border-red-400/25'
                              : item.type === 'warning'
                                ? 'bg-amber-500/15 text-amber-200 border-amber-400/25'
                                : 'bg-orange-500/15 text-orange-200 border-orange-400/25'
                          }`}>
                            {item.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-200">{item.title}</p>
                            <p className="text-[11px] leading-relaxed mt-1 break-words text-slate-200">{item.message}</p>
                          </div>
                        </div>
                        {typeof item.count === 'number' && (
                          <span className="flex h-7 min-w-7 items-center justify-center rounded-full border border-slate-600 bg-slate-800/90 px-1.5 text-[10px] font-bold leading-none text-slate-100">
                            {item.count}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Search input & View Toggle */}
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      aria-label="Filtrar alumnos del grupo por apellido, nombre o número de lista"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filtrar por apellidos, nombre o N°..."
                      className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF441F] shadow-inner"
                    />
                  </div>
                  <select
                    aria-label="Ordenar alumnos del grupo"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#FF441F] shadow-inner shrink-0"
                  >
                    <option value="lastName_asc">Apellidos (A - Z)</option>
                    <option value="lastName_desc">Apellidos (Z - A)</option>
                    <option value="roll_asc">N° Lista (1 - 99)</option>
                    <option value="roll_desc">N° Lista (99 - 1)</option>
                    <option value="firstName_asc">Nombre (A - Z)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-[11px] text-slate-600 font-semibold hidden sm:block shrink-0">
                    {groupStudents.length} Alumnos
                  </div>
                  <div className="flex items-center bg-white border border-slate-300 rounded-xl p-0.5 shrink-0">
                    <button
                      onClick={() => setStudentViewMode('list')}
                      className={`p-1 rounded-lg ${studentViewMode === 'list' ? 'bg-slate-200 text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-600'} transition-colors`}
                      title="Vista de Lista (Tabla)"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setStudentViewMode('grid')}
                      className={`p-1 rounded-lg ${studentViewMode === 'grid' ? 'bg-slate-200 text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-600'} transition-colors`}
                      title="Vista de Tarjetas (Mosaico)"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Students Content Area */}
              <div className="overflow-x-auto bg-white dark:bg-[#1E1E1E]">
                {studentViewMode === 'list' ? (
                  <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-300">
                      <th className="py-2 px-3 w-12 text-center border-r border-slate-200">N°</th>
                      <th className="py-2 px-3 border-r border-slate-200">Apellidos y Nombres</th>
                      <th className="py-2 px-3 w-28 text-center border-r border-slate-200">Estatus</th>
                      <th className="py-2 px-3 hidden md:table-cell border-r border-slate-200">Observaciones</th>
                      <th className="py-2 px-3 w-24 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {groupStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          No hay alumnos registrados en este grupo o no coinciden con la búsqueda.
                        </td>
                      </tr>
                    ) : (
                      groupStudents.map(student => (
                        <tr
                          key={student.id}
                          className={`hover:bg-orange-50/40 transition-colors ${
                            student.status === 'Inactive' ? 'opacity-60 bg-slate-100/50' : ''
                          }`}
                        >
                          <td className="py-2 px-3 text-center font-mono font-bold text-slate-600 border-r border-slate-200 bg-slate-50 dark:bg-[#242424]">
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
                            <button
                              onClick={() => handleToggleStudentStatus(student)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border transition-colors ${
                                student.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                              }`}
                              title="Clic para alternar estatus (Activo / Baja)"
                            >
                              {student.status === 'Active' ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Activo</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 text-slate-500" />
                                  <span>Baja</span>
                                </>
                              )}
                            </button>
                          </td>
                          <td className="py-2 px-3 hidden md:table-cell text-slate-600 text-[11px] truncate max-w-[200px] border-r border-slate-200">
                            {student.notes || <span className="text-slate-400 italic">Sin observaciones</span>}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenMoveStudent(student)}
                                className="p-1 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                                title="Cambiar de Grupo (Mover alumno)"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenEditStudent(student)}
                                className="p-1 rounded-lg text-slate-500 hover:text-[#FF441F] hover:bg-orange-50 transition-colors"
                                title="Editar datos"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(student.id)}
                                className="p-1 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                title="Eliminar Alumno"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                ) : (
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {groupStudents.length === 0 ? (
                      <div className="col-span-full py-8 text-center text-slate-500 text-xs">
                        No hay alumnos registrados en este grupo o no coinciden con la búsqueda.
                      </div>
                    ) : (
                      groupStudents.map(student => (
                        <div key={student.id} className={`p-3 rounded-2xl border shadow-sm transition-all flex flex-col gap-3 ${student.status === 'Inactive' ? 'opacity-70 bg-slate-100 border-slate-200' : 'bg-white border-slate-300 hover:border-[#FF441F]/60 hover:shadow-md'}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0 shadow-inner text-slate-500 font-bold font-mono text-xs">
                                {student.rollNumber}
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-1">{student.lastName}</h3>
                                <p className="text-slate-500 text-xs line-clamp-1">{student.firstName}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleToggleStudentStatus(student)}
                              className={`shrink-0 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                                student.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300'
                              }`}
                            >
                              {student.status === 'Active' ? 'Activo' : 'Baja'}
                            </button>
                          </div>

                          {student.notes && (
                            <div className="px-2.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-[10px] line-clamp-2">
                              <strong>Obs:</strong> {student.notes}
                            </div>
                          )}

                          <div className="pt-2 mt-auto border-t border-slate-100 flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenMoveStudent(student)}
                              className="px-2.5 py-1 flex items-center gap-1 rounded-xl bg-slate-50 text-slate-600 hover:text-amber-700 hover:bg-amber-50 border border-slate-200 transition-colors text-[10px] font-semibold"
                            >
                              <ArrowRightLeft className="w-3 h-3" /> Mover
                            </button>
                            <button
                              onClick={() => handleOpenEditStudent(student)}
                              className="px-2.5 py-1 flex items-center gap-1 rounded-xl bg-slate-50 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition-colors text-[10px] font-semibold"
                            >
                              <Edit3 className="w-3 h-3" /> Editar
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
                              className="px-2.5 py-1 flex items-center gap-1 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors text-[10px] font-semibold ml-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-16 px-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-[#FF441F] flex items-center justify-center mx-auto">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Ningún grupo seleccionado
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                {groups.length === 0
                  ? 'Para comenzar a inscribir alumnos y pasar lista, primero cree su primer grupo escolar.'
                  : 'Seleccione un grupo de la columna izquierda para administrar su lista de alumnos.'}
              </p>
              {groups.length === 0 && (
                <button
                  onClick={handleOpenNewGroup}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF441F] hover:bg-[#E03514] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear Primer Grupo</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <GroupManagementModals controller={controller} groups={groups} students={students} />
    </div>
  );
};
