import React from 'react';
import { CheckCircle2, X, ArrowRight } from 'lucide-react';

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  version?: string;
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({
  isOpen,
  onClose,
  version = 'v1.2.0'
}) => {
  if (!isOpen) return null;

  const updates = [
    {
      title: 'Impresión limpia de PDF',
      description: 'Se removió la barra de navegación de las impresiones y exportaciones de sábanas y reportes.'
    },
    {
      title: 'Resumen de asistencia por fecha en reportes',
      description: 'Al seleccionar una fecha en la sección de reportes, se muestra el estado del pase de lista del grupo.'
    },
    {
      title: 'Notas y pendientes del profesor',
      description: 'Nuevo espacio en el panel de inicio para registrar notas rápidas, fechas límite y pendientes.'
    },
    {
      title: 'Alertas de entregas y calificaciones',
      description: 'Notificaciones automáticas en el inicio sobre actividades próximas a vencer y pendientes por calificar.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl border border-slate-300 shadow-xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-800 text-white p-4 relative">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1 rounded hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Actualización del sistema • {version}
          </div>

          <h2 className="text-lg font-bold">
            Cambios recientes
          </h2>
        </div>

        {/* Updates List */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
          {updates.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2.5 p-3 rounded bg-slate-50 border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="font-bold text-slate-900 leading-snug">
                  {item.title}
                </h4>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>Entendido</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
