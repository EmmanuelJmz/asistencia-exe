import React, { useEffect, useState, useRef } from 'react';
import { 
  Settings, 
  School, 
  KeyRound, 
  Database, 
  RefreshCw, 
  Download, 
  Upload,
  CheckCircle2, 
  ShieldAlert, 
  Terminal,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileCode,
  Layers
} from 'lucide-react';
import { UserSettings } from '../types';
import { dbService } from '../db/databaseService';

const ACCENT_COLORS = [
  { name: 'Naranja', value: '#FF441F' }, { name: 'Morado', value: '#7C3AED' },
  { name: 'Azul', value: '#2563EB' }, { name: 'Rojo', value: '#DC2626' },
  { name: 'Verde', value: '#059669' }, { name: 'Ámbar', value: '#D97706' },
  { name: 'Rosa', value: '#DB2777' }, { name: 'Turquesa', value: '#0891B2' },
];

interface SettingsScreenProps {
  settings: UserSettings;
  onSettingsChanged: (newSettings: UserSettings) => void;
  onDataReset: () => void;
  onOpenSqliteInspector?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onSettingsChanged,
  onDataReset,
  onOpenSqliteInspector,
}) => {
  const [formData, setFormData] = useState<UserSettings>({ ...settings });

  useEffect(() => setFormData({ ...settings }), [settings]);
  const [settingsFeedback, setSettingsFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = dbService.updateSettings(formData);
    onSettingsChanged(updated);
    setSettingsFeedback('Ajustes guardados correctamente. Recargando...');
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  const handleExportRawData = () => {
    const data = dbService.getRawTables();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EduGestion_Respaldo_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const success = dbService.importDatabaseBackup(json);
        if (success) {
          alert('Copia de respaldo restaurada exitosamente.');
          onDataReset();
          window.location.reload();
        } else {
          alert('El archivo no contiene un formato de respaldo válido.');
        }
      } catch {
        alert('Error al leer el archivo de respaldo JSON.');
      }
    };
    reader.readAsText(file);
  };


  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Title */}
      <div className="rappi-card p-4 flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-50 border border-orange-200 text-[#FF441F]">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">Opciones del Sistema y Configuración</h1>
            <p className="text-[11px] text-slate-500">
              Personalización institucional del docente, seguridad de acceso y respaldos del sistema.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Main Functional Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Profile & School Card */}
        <div className="rappi-card overflow-hidden">
          <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center gap-2 text-xs font-bold text-slate-800">
            <School className="w-3.5 h-3.5 text-[#FF441F]" />
            <span>Datos del Plantel y Docente Titular</span>
          </div>

          <form onSubmit={handleSaveProfile} className="p-3.5 space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nombre Completo del Docente Titular:</label>
              <input
                type="text"
                required
                value={formData.teacherName}
                onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-600 shadow-inner"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nombre Oficial de la Escuela / Plantel:</label>
              <input
                type="text"
                required
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-600 shadow-inner"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Apariencia / Tema de la Interfaz:</label>
              <select
                value={formData.theme}
                onChange={(e) => {
                  const newTheme = e.target.value as 'light' | 'dark';
                  const updatedFormData = { ...formData, theme: newTheme };
                  setFormData(updatedFormData);
                  const updated = dbService.updateSettings(updatedFormData);
                  onSettingsChanged(updated);
                }}
                className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-600 shadow-inner"
              >
                <option value="light">Tema Claro Tradicional (Estilo Aplicación Institucional)</option>
                <option value="dark">Tema Oscuro (Modo Nocturno Completo)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-2">Color de la interfaz:</label>
              <div className="flex flex-wrap gap-2">
                {ACCENT_COLORS.map((color) => (
                  <button key={color.value} type="button" aria-label={`Usar color ${color.name}`}
                    title={color.name} aria-pressed={(formData.accentColor || '#FF441F') === color.value}
                    onClick={() => {
                      const changed = { ...formData, accentColor: color.value };
                      setFormData(changed);
                      onSettingsChanged(dbService.updateSettings(changed));
                    }}
                    className="theme-swatch" style={{ backgroundColor: color.value }} />
                ))}
                <span className="self-center text-[11px] text-slate-500 ml-1">
                  {ACCENT_COLORS.find((c) => c.value === (formData.accentColor || '#FF441F'))?.name || 'Naranja'}
                </span>
              </div>
            </div>

            {settingsFeedback && (
              <div className="p-2 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold">{settingsFeedback}</span>
              </div>
            )}

            <div className="pt-1">
              <button
                type="submit"
                className="w-full py-2 rappi-btn-primary text-xs shadow-md"
              >
                Guardar Cambios del Perfil
              </button>
            </div>
          </form>
        </div>

        {/* Security & Authentication Info Card */}
        <div className="rappi-card overflow-hidden">
          <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center gap-2 text-xs font-bold text-slate-800">
            <KeyRound className="w-3.5 h-3.5 text-[#FF441F]" />
            <span>Seguridad de Cuenta y Autenticación</span>
          </div>

          <div className="p-3.5 space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-900 space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs text-orange-800">
                <ShieldAlert className="w-4 h-4 text-[#FF441F]" />
                <span>Acceso Protegido por Supabase Auth</span>
              </div>
              <p className="text-[11px] text-orange-700">
                El acceso a este sistema se realiza mediante tu usuario y contraseña de docente. La sesión está encriptada y sincronizada en tiempo real.
              </p>
            </div>
            <div className="text-[11px] text-slate-500">
              Estado de Sesión: <strong className="text-emerald-700 font-mono">Activa y Protegida</strong>
            </div>
          </div>
        </div>

        {/* Regular Data Backup & Restore */}
        <div className="rappi-card overflow-hidden md:col-span-2">
          <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center gap-2 text-xs font-bold text-slate-800">
            <Download className="w-3.5 h-3.5 text-[#FF441F]" />
            <span>Respaldo y Seguridad de la Información</span>
          </div>

          <div className="p-3.5 space-y-3 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Mantenga segura la información de sus alumnos y evaluaciones. Puede descargar una copia de respaldo en cualquier momento o restaurar una copia previa en caso de cambiar de equipo.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                onClick={handleExportRawData}
                className="flex items-center gap-1.5 px-4 py-2 rappi-btn-primary text-xs shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Copia de Respaldo (.JSON)</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportBackup}
                accept=".json"
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-4 py-2 rappi-btn-secondary text-xs shadow-sm"
              >
                <Upload className="w-3.5 h-3.5 text-slate-700" />
                <span>Restaurar Copia de Respaldo</span>
              </button>
            </div>
          </div>
        </div>

      </div>



    </div>
  );
};

