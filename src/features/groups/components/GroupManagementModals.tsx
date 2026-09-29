import React from 'react';
import { AlertTriangle, Search } from 'lucide-react';
import { Group, Student } from '../../../shared/types';
import { useGroupsStudentsController } from '../hooks/useGroupsStudentsController';

interface GroupManagementModalsProps {
  controller: ReturnType<typeof useGroupsStudentsController>;
  groups: Group[];
  students: Student[];
}

export const GroupManagementModals: React.FC<GroupManagementModalsProps> = ({
  controller,
  groups,
  students,
}) => {
  const {
    activeGroup,
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
    groupForm,
    setGroupForm,
    studentForm,
    setStudentForm,
    targetMoveGroupId,
    setTargetMoveGroupId,
    handleSaveNewGroup,
    handleSaveEditGroup,
    handleDeleteGroup,
    handleSaveNewStudent,
    handleSaveEditStudent,
    handleExecuteImport,
    handleConfirmMoveStudent,
  } = controller;

  return (
    <>
      {/* ================= MODAL: NUEVO GRUPO ================= */}
      {isNewGroupModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-400 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-800 text-white px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold select-none">
              <span>Nuevo Grupo Escolar</span>
              <button onClick={() => setIsNewGroupModalOpen(false)} className="text-slate-300 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveNewGroup} className="p-4 space-y-3 bg-slate-50 text-xs">
              <div>
                <label htmlFor="group-name-new" className="font-semibold text-slate-700 block mb-1">Nombre del Grupo:</label>
                <input id="group-name-new"
                  type="text"
                  required
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder="Ej. 2° C - Secundaria"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-[#FF441F] shadow-inner"
                />
              </div>
              {/* Advanced fields hidden for simplicity, defaults will be used */}

              <div className="mb-4">
                <label htmlFor="group-color-new" className="font-semibold text-slate-700 block mb-1">Color Identificador:</label>
                <input id="group-color-new"
                  type="color"
                  value={groupForm.colorHex}
                  onChange={(e) => setGroupForm({ ...groupForm, colorHex: e.target.value })}
                  className="w-full h-10 rounded-xl bg-white border border-slate-300 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewGroupModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !groupForm.name.trim()}
                  className="px-4 py-2 bg-[#FF441F] hover:bg-[#E03514] text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
                >
                  Guardar Grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDITAR GRUPO ================= */}
      {isEditGroupModalOpen && activeGroup && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-400 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-800 text-white px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold select-none">
              <span>Editar Grupo Escolar</span>
              <button onClick={() => setIsEditGroupModalOpen(false)} className="text-slate-300 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveEditGroup} className="p-4 space-y-3 bg-slate-50 text-xs">
              <div>
                <label htmlFor="group-name-edit" className="font-semibold text-slate-700 block mb-1">Nombre del Grupo:</label>
                <input id="group-name-edit"
                  type="text"
                  required
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-[#FF441F] shadow-inner"
                />
              </div>

              {/* Advanced fields hidden for simplicity */}

              <div className="mb-4">
                <label htmlFor="group-color-edit" className="font-semibold text-slate-700 block mb-1">Color Identificador:</label>
                <input id="group-color-edit"
                  type="color"
                  value={groupForm.colorHex}
                  onChange={(e) => setGroupForm({ ...groupForm, colorHex: e.target.value })}
                  className="w-full h-10 rounded-xl bg-white border border-slate-300 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditGroupModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#FF441F] hover:bg-[#E03514] text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
                >
                  Actualizar Grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIRMAR ELIMINACIÓN DE GRUPO ================= */}
      {deletingGroupId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-red-400 rounded shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-red-800 text-white px-3 py-1.5 flex items-center justify-between text-xs font-semibold select-none">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Confirmar eliminación del grupo</span>
              </div>
              <button onClick={() => setDeletingGroupId(null)} className="text-white hover:opacity-80">✕</button>
            </div>
            <div className="p-4 space-y-3 bg-slate-50 text-xs">
              <p className="text-slate-800 leading-relaxed">
                Se eliminarán de forma definitiva este grupo y sus datos asociados en la nube: alumnos, asistencias, actividades y calificaciones.
              </p>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setDeletingGroupId(null)}
                  className="px-3 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteGroup(deletingGroupId)}
                  className="px-3.5 py-1.5 rounded bg-red-700 hover:bg-red-800 text-white text-xs font-semibold shadow-xs"
                >
                  Eliminar Grupo y Registros
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: INSCRIBIR / EDITAR ALUMNO ================= */}
      {(isNewStudentModalOpen || editingStudent) && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-400 rounded shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-800 text-white px-3 py-1.5 flex items-center justify-between text-xs font-semibold select-none">
              <span>{editingStudent ? 'Editar Datos del Alumno' : 'Ficha de Inscripción de Alumno'}</span>
              <button
                onClick={() => {
                  setIsNewStudentModalOpen(false);
                  setEditingStudent(null);
                }}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={editingStudent ? handleSaveEditStudent : handleSaveNewStudent} className="p-4 space-y-3 bg-slate-50 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="student-first-name" className="font-semibold text-slate-700 block mb-1">Nombres:</label>
                  <input id="student-first-name"
                    type="text"
                    required
                    value={studentForm.firstName}
                    onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
                    placeholder="Ej. Juan Carlos"
                    className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-blue-600 shadow-inner"
                  />
                </div>
                <div>
                  <label htmlFor="student-last-name" className="font-semibold text-slate-700 block mb-1">Apellidos:</label>
                  <input id="student-last-name"
                    type="text"
                    required
                    value={studentForm.lastName}
                    onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                    placeholder="Ej. García López"
                    className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-blue-600 shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {editingStudent && (
                  <div>
                    <label htmlFor="student-roll-number" className="font-semibold text-slate-700 block mb-1">Número de Lista:</label>
                    <input id="student-roll-number"
                      type="number"
                      min={1}
                      required
                      value={studentForm.rollNumber}
                      onChange={(e) => setStudentForm({ ...studentForm, rollNumber: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-blue-600 shadow-inner"
                    />
                  </div>
                )}
                <div className={!editingStudent ? "col-span-2" : ""}>
                  <label htmlFor="student-academic-status" className="font-semibold text-slate-700 block mb-1">Estatus Académico:</label>
                  <select id="student-academic-status"
                    value={studentForm.status}
                    onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-blue-600 shadow-inner"
                  >
                    <option value="Active">Activo</option>
                    <option value="Inactive">Baja Temporal / Inactivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="student-notes" className="font-semibold text-slate-700 block mb-1">Observaciones / Tutor / Notas:</label>
                <textarea id="student-notes"
                  rows={2}
                  value={studentForm.notes}
                  onChange={(e) => setStudentForm({ ...studentForm, notes: e.target.value })}
                  placeholder="Ej. Alergias, teléfono de tutor, promedio anterior..."
                  className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-blue-600 shadow-inner"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewStudentModalOpen(false);
                    setEditingStudent(null);
                  }}
                  className="px-3 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-3.5 py-1.5 rounded bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <span>{editingStudent ? 'Guardar Cambios' : 'Registrar Alumno'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: IMPORTAR ALUMNO EXISTENTE ================= */}
      {isImportModalOpen && activeGroup && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-400 rounded shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-slate-800 text-white px-3 py-2 flex items-center justify-between text-xs font-semibold select-none">
              <span>Directorio Global: Importar Alumnos al Grupo</span>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-300 hover:text-white">✕</button>
            </div>
            <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-2">
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Busque alumnos que ya estén registrados en otros grupos del sistema para copiarlos a este grupo.
              </p>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={importSearchQuery}
                  onChange={(e) => setImportSearchQuery(e.target.value)}
                  placeholder="Buscar por apellidos o nombres en todo el sistema..."
                  className="w-full pl-8 pr-2.5 py-1.5 rounded bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-600 shadow-inner"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 bg-slate-50 space-y-1">
              {(() => {
                const otherStudents = students.filter(s => s.groupId !== activeGroup.id);
                const filtered = importSearchQuery
                  ? otherStudents.filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(importSearchQuery.toLowerCase()))
                  : otherStudents;

                if (otherStudents.length === 0) {
                  return <div className="p-4 text-center text-xs text-slate-500">No hay alumnos en otros grupos.</div>;
                }
                if (filtered.length === 0) {
                  return <div className="p-4 text-center text-xs text-slate-500">Ningún alumno coincide con la búsqueda.</div>;
                }

                // Group by source group for UI clarity
                const grouped = filtered.reduce((acc, stu) => {
                  const grp = groups.find(g => g.id === stu.groupId)?.name || 'Grupo Desconocido';
                  if (!acc[grp]) acc[grp] = [];
                  acc[grp].push(stu);
                  return acc;
                }, {} as Record<string, Student[]>);

                return (Object.entries(grouped) as Array<[string, Student[]]>).map(([groupName, stus]) => (
                  <div key={groupName} className="mb-3 border border-slate-200 rounded overflow-hidden">
                    <div className="bg-slate-200/60 px-3 py-1.5 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      Proviene de: {groupName}
                    </div>
                    <div className="divide-y divide-slate-100 bg-white">
                      {stus.map(stu => (
                        <label key={stu.id} className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50/50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedImportStudentIds.has(stu.id)}
                            onChange={(e) => {
                              const newSet = new Set(selectedImportStudentIds);
                              if (e.target.checked) newSet.add(stu.id);
                              else newSet.delete(stu.id);
                              setSelectedImportStudentIds(newSet);
                            }}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900">{stu.lastName}, {stu.firstName}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>

            <div className="bg-slate-100 px-4 py-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                {selectedImportStudentIds.size} seleccionados
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={selectedImportStudentIds.size === 0 || isSaving}
                  className="px-3.5 py-1.5 rounded bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Importando...</span>
                    </>
                  ) : (
                    <span>Importar Alumnos</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TRASLADAR / MOVER ALUMNO DE GRUPO ================= */}
      {movingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-400 rounded shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-800 text-white px-3 py-1.5 flex items-center justify-between text-xs font-semibold select-none">
              <span>Trasladar Alumno de Grupo</span>
              <button onClick={() => setMovingStudent(null)} className="text-slate-300 hover:text-white">✕</button>
            </div>
            <div className="p-4 space-y-3 bg-slate-50 text-xs">
              <p className="text-slate-700">
                Alumno a transferir: <strong className="text-slate-900">{movingStudent.lastName}, {movingStudent.firstName}</strong>
              </p>

              <div>
                <label htmlFor="student-target-group" className="font-semibold text-slate-700 block mb-1">Nuevo Grupo de Destino:</label>
                <select id="student-target-group"
                  value={targetMoveGroupId}
                  onChange={(e) => setTargetMoveGroupId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-blue-600 shadow-inner"
                >
                  {groups
                    .filter(g => g.id !== movingStudent.groupId)
                    .map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.shift})
                      </option>
                    ))}
                </select>
              </div>

              <p className="text-[11px] text-slate-500">
                Se le asignará automáticamente el número de lista consecutivo en el grupo seleccionado.
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setMovingStudent(null)}
                  className="px-3 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmMoveStudent}
                  className="px-3.5 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs"
                >
                  Confirmar Traslado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
