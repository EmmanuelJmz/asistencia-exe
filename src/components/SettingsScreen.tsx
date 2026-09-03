import React, { useState, useRef } from 'react';
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
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinFeedback, setPinFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [settingsFeedback, setSettingsFeedback] = useState<string | null>(null);

  // Danger zone toggle
  const [isDangerZoneOpen, setIsDangerZoneOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = dbService.updateSettings(formData);
    onSettingsChanged(updated);
    setSettingsFeedback('Ajustes guardados correctamente.');
    setTimeout(() => setSettingsFeedback(null), 3000);
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    const security = dbService.getSecurityConfig();

    if (currentPin !== security.pin) {
      setPinFeedback({ type: 'error', text: 'El PIN actual es incorrecto.' });
      return;
    }

    if (!/^\d{4}$/.test(newPin)) {
      setPinFeedback({ type: 'error', text: 'El nuevo PIN debe ser exactamente de 4 dígitos numéricos.' });
      return;
    }

    if (newPin !== confirmPin) {
      setPinFeedback({ type: 'error', text: 'El nuevo PIN y su confirmación no coinciden.' });
      return;
    }

    dbService.updatePin(newPin);
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setPinFeedback({ type: 'success', text: '¡PIN actualizado exitosamente a ' + newPin + '!' });
    setTimeout(() => setPinFeedback(null), 4000);
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

  const handleCleanToEmpty = () => {
    alert('Esta función de borrado masivo ha sido desactivada por seguridad en el entorno de la nube (Supabase). Para vaciar la base de datos, por favor contacte al administrador o elimine los grupos uno por uno.');
  };

  const handleLoadDemo = () => {
    alert('La carga de datos de demostración ha sido desactivada para evitar corromper tu base de datos real en la nube.');
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Title */}
      <div className="bg-white border border-slate-300 rounded shadow-xs p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-blue-50 border border-blue-200 text-blue-800">
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
        <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
          <div className="bg-slate-100 px-3 py-2 border-b border-slate-300 flex items-center gap-2 text-xs font-bold text-slate-800">
            <School className="w-3.5 h-3.5 text-blue-700" />
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

            {settingsFeedback && (
              <div className="p-2 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold">{settingsFeedback}</span>
              </div>
            )}

            <div className="pt-1">
              <button
                type="submit"
                className="w-full py-1.5 rounded bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs transition-colors border border-blue-800 shadow-xs"
              >
                Guardar Cambios del Perfil
              </button>
            </div>
          </form>
        </div>

        {/* Security & PIN Card */}
        <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
          <div className="bg-slate-100 px-3 py-2 border-b border-slate-300 flex items-center gap-2 text-xs font-bold text-slate-800">
            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
            <span>Seguridad y Clave de Acceso (PIN)</span>
          </div>

          <form onSubmit={handleChangePin} className="p-3.5 space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">PIN Actual (4 dígitos):</label>
              <input
                type="password"
                maxLength={4}
                required
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                placeholder="••••"
                className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-xs text-center font-mono tracking-widest text-slate-800 focus:outline-none focus:border-blue-600 shadow-inner"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nuevo PIN:</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-xs text-center font-mono tracking-widest text-slate-800 focus:outline-none focus:border-blue-600 shadow-inner"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Confirmar Nuevo:</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-xs text-center font-mono tracking-widest text-slate-800 focus:outline-none focus:border-blue-600 shadow-inner"
                />
              </div>
            </div>

            {pinFeedback && (
              <div className={`p-2 rounded border text-xs text-center flex items-center justify-center gap-1.5 ${
                pinFeedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-red-50 border-red-300 text-red-700'
              }`}>
                {pinFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
                )}
                <span className="font-semibold">{pinFeedback.text}</span>
              </div>
            )}

            <div className="pt-1">
              <button
                type="submit"
                className="w-full py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors border border-amber-700 shadow-xs"
              >
                Actualizar PIN de Seguridad
              </button>
            </div>
          </form>
        </div>

        {/* Regular Data Backup & Restore */}
        <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden md:col-span-2">
          <div className="bg-slate-100 px-3 py-2 border-b border-slate-300 flex items-center gap-2 text-xs font-bold text-slate-800">
            <Download className="w-3.5 h-3.5 text-blue-700" />
            <span>Respaldo y Seguridad de la Información</span>
          </div>

          <div className="p-3.5 space-y-3 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Mantenga segura la información de sus alumnos y evaluaciones. Puede descargar una copia de respaldo en cualquier momento o restaurar una copia previa en caso de cambiar de equipo.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                onClick={handleExportRawData}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-700 hover:bg-blue-800 text-white border border-blue-800 font-semibold text-xs transition-colors shadow-xs"
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold text-xs transition-colors shadow-xs"
              >
                <Upload className="w-3.5 h-3.5 text-slate-700" />
                <span>Restaurar Copia de Respaldo</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ================= ZONA DE PELIGRO / HERRAMIENTAS TÉCNICAS ================= */}
      <div className="border border-red-300 rounded overflow-hidden shadow-xs bg-white">
        <div 
          onClick={() => setIsDangerZoneOpen(!isDangerZoneOpen)}
          className="bg-red-50/70 px-4 py-2.5 border-b border-red-200 flex items-center justify-between cursor-pointer select-none hover:bg-red-100/70 transition-colors"
        >
          <div className="flex items-center gap-2 text-red-900 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Zona de Peligro y Herramientas Avanzadas</span>
            <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-red-200 text-red-900 border border-red-300">
              Opciones Críticas
            </span>
          </div>
          <div className="flex items-center gap-1 text-red-800 text-xs font-semibold">
            <span>{isDangerZoneOpen ? 'Ocultar Opciones' : 'Mostrar Opciones'}</span>
            {isDangerZoneOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {isDangerZoneOpen && (
          <div className="p-4 space-y-4 bg-red-50/20 text-xs">
            <div className="p-3 rounded bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Advertencia de Seguridad:</p>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Las funciones contenidas en esta sección son para administración avanzada, soporte técnico y mantenimiento de bajo nivel. Utilícelas con precaución.
                </p>
              </div>
            </div>

            {/* Danger Row 1: Reset System to Clean State */}
            <div className="p-3 rounded bg-white border border-red-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5 max-w-xl">
                <h4 className="font-bold text-red-900">Vaciar y Limpiar Sistema a Cero</h4>
                <p className="text-[11px] text-slate-600">
                  Elimina de manera permanente todos los grupos, alumnos, asistencias y calificaciones existentes para dejar el sistema totalmente limpio para el inicio del ciclo escolar.
                </p>
              </div>
              <button
                onClick={handleCleanToEmpty}
                className="shrink-0 px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white font-semibold text-xs border border-red-700 shadow-xs transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Vaciar Base de Datos a Cero</span>
              </button>
            </div>

            {/* Danger Row 2: Load Demo Data */}
            <div className="p-3 rounded bg-white border border-slate-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5 max-w-xl">
                <h4 className="font-bold text-slate-900">Cargar Datos de Demostración</h4>
                <p className="text-[11px] text-slate-600">
                  Carga un conjunto de grupos escolares, alumnos y calificaciones simuladas para evaluar las funciones del sistema.
                </p>
              </div>
              <button
                onClick={handleLoadDemo}
                className="shrink-0 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-300 shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-blue-700" />
                <span>Cargar Datos Demo</span>
              </button>
            </div>

            {/* Danger Row 3: SQL Inspector & DDL Schemas */}
            {onOpenSqliteInspector && (
              <div className="p-3 rounded bg-white border border-slate-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5 max-w-xl">
                  <h4 className="font-bold text-slate-900">Auditoría Técnica: Inspector SQLite y Esquemas DDL</h4>
                  <p className="text-[11px] text-slate-600">
                    Abre el explorador de bajo nivel para consultar tablas internas, verificar integridad referencial y auditar esquemas relacionales.
                  </p>
                </div>
                <button
                  onClick={onOpenSqliteInspector}
                  className="shrink-0 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs border border-slate-900 shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <FileCode className="w-3.5 h-3.5 text-teal-400" />
                  <span>Abrir Inspector SQLite</span>
                </button>
              </div>
            )}

            {/* Danger Row 4: Packaging and EXE instructions */}
            <div className="p-3 rounded bg-white border border-slate-300 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Terminal className="w-4 h-4 text-blue-700" />
                <span>Generación del Instalador .EXE para Computadora (Electron)</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Comandos de terminal para compilar el instalador ejecutable de Windows en su equipo local:
              </p>
              <div className="p-2.5 rounded bg-slate-900 text-slate-200 font-mono text-[11px] space-y-1.5 border border-slate-700">
                <div className="text-slate-400 text-[10px] pb-1 border-b border-slate-800 flex justify-between">
                  <span>Terminal / Símbolo del Sistema</span>
                  <span>Windows x64 (.exe)</span>
                </div>
                <p className="text-slate-400"># Instalar librerías del proyecto:</p>
                <p className="text-white font-bold">npm install</p>
                <p className="text-slate-400 pt-1"># Compilar instalador ejecutable de Windows:</p>
                <p className="text-emerald-400 font-bold">npm run dist</p>
                <p className="text-slate-400 text-[10px] pt-1">
                  El archivo instalador <span className="text-amber-300 font-semibold">EduGestion-Setup-1.0.0.exe</span> se generará en la carpeta <span className="text-amber-300 font-semibold">dist-electron/</span>.
                </p>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
};

