import React from 'react';
import { ActivityType } from '../../../shared/types';
import { useGradesFunnelController } from '../hooks/useGradesFunnelController';
import { ACTIVITY_TYPES } from '../model/activityTypes';

interface ActivityFormModalProps {
  controller: ReturnType<typeof useGradesFunnelController>;
}

export const ActivityFormModal: React.FC<ActivityFormModalProps> = ({ controller }) => {
  const {
    isModalOpen,
    setIsModalOpen,
    editingActivity,
    modalForm,
    setModalForm,
    handleSaveActivityModal,
  } = controller;

  return (
    <>
      {/* ================= MODAL: CREAR / EDITAR ACTIVIDAD ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded border border-slate-300 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-300 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {editingActivity ? 'Editar Actividad Escolar' : 'Nueva Actividad Escolar'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-800 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveActivityModal} className="p-4 space-y-3 text-xs">
              <div>
                <label htmlFor="activity-title" className="font-semibold text-slate-700 block mb-1">
                  Título de la Actividad o Tarea: *
                </label>
                <input id="activity-title"
                  type="text"
                  required
                  value={modalForm.title}
                  onChange={(e) => setModalForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej. Tarea 1: Resumen del capítulo, Examen Parcial 1..."
                  className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-slate-800 font-medium focus:outline-none focus:border-blue-600 shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="activity-type" className="font-semibold text-slate-700 block mb-1">
                    Tipo de Actividad:
                  </label>
                  <select id="activity-type"
                    value={modalForm.type}
                    onChange={(e) => setModalForm(prev => ({ ...prev, type: e.target.value as ActivityType }))}
                    className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-blue-600 shadow-inner"
                  >
                    {ACTIVITY_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="activity-due-date" className="font-semibold text-slate-700 block mb-1">
                    Fecha de Entrega / Aplicación:
                  </label>
                  <input id="activity-due-date"
                    type="date"
                    required
                    value={modalForm.dueDate}
                    onChange={(e) => setModalForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-blue-600 shadow-inner font-mono"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="activity-max-score" className="font-semibold text-slate-700 block mb-1">
                  Puntaje Máximo (Escala):
                </label>
                <input id="activity-max-score"
                  type="number"
                  min="1"
                  max="100"
                  step="0.1"
                  value={modalForm.maxScore}
                  onChange={(e) => setModalForm(prev => ({ ...prev, maxScore: parseFloat(e.target.value) || 10 }))}
                  className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-blue-600 shadow-inner font-mono"
                />
              </div>

              <div>
                <label htmlFor="activity-description" className="font-semibold text-slate-700 block mb-1">
                  Descripción o Instrucciones (Opcional):
                </label>
                <textarea id="activity-description"
                  rows={2}
                  value={modalForm.description}
                  onChange={(e) => setModalForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detalles sobre entregables, rúbrica o criterios..."
                  className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-blue-600 shadow-inner"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-xs transition-colors border border-blue-800"
                >
                  {editingActivity ? 'Actualizar Actividad' : 'Crear Actividad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
