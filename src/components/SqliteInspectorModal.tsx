import React, { useState } from 'react';
import { 
  Database, 
  Table, 
  Code2, 
  Layers, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Copy,
  Terminal,
  X
} from 'lucide-react';
import { SQLITE_INIT_DDL } from '../db/sqliteSchema';
import { dbService } from '../db/databaseService';

interface SqliteInspectorModalProps {
  onClose: () => void;
}

export const SqliteInspectorModal: React.FC<SqliteInspectorModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'tables' | 'ddl' | 'raw_json'>('tables');
  const [selectedTable, setSelectedTable] = useState<string>('Groups');
  const [copied, setCopied] = useState(false);

  const rawData = dbService.getRawTables();

  const tables = [
    { name: 'Groups', count: rawData.groups.length, description: 'Grupos y grados escolares' },
    { name: 'Students', count: rawData.students.length, description: 'Alumnos y estatus activo/baja (FK -> Groups ON DELETE CASCADE)' },
    { name: 'Attendance_Sessions', count: rawData.sessions.length, description: 'Sesiones de pase de lista por fecha' },
    { name: 'Attendance_Records', count: rawData.attendanceRecords.length, description: 'Registros individuales de asistencia' },
    { name: 'Subjects', count: rawData.subjects.length, description: 'Materias o asignaturas curriculares' },
    { name: 'Periods', count: rawData.periods.length, description: 'Periodos de evaluación (Trimestres)' },
    { name: 'Grades', count: rawData.grades.length, description: 'Calificaciones numéricas por actividad y rubro' },
    { name: 'Security_Config', count: 1, description: 'Configuración de PIN de 4 dígitos' },
  ];

  const getTableData = () => {
    switch (selectedTable) {
      case 'Groups': return rawData.groups;
      case 'Students': return rawData.students;
      case 'Attendance_Sessions': return rawData.sessions;
      case 'Attendance_Records': return rawData.attendanceRecords;
      case 'Subjects': return rawData.subjects;
      case 'Periods': return rawData.periods;
      case 'Grades': return rawData.grades;
      case 'Security_Config': return [rawData.security];
      default: return [];
    }
  };

  const currentTableRecords = getTableData();
  const headers = currentTableRecords.length > 0 ? Object.keys(currentTableRecords[0]) : [];

  const handleCopyDDL = () => {
    navigator.clipboard.writeText(SQLITE_INIT_DDL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        
        {/* Modal Window Titlebar */}
        <div className="bg-slate-100 px-3 py-2 border-b border-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-800" />
            <span className="text-xs font-bold text-slate-800">
              Explorador de Base de Datos SQLite Local
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 border border-blue-200 font-mono font-semibold">
              PRAGMA foreign_keys = ON
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-600 hover:text-white text-slate-500 transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Toolbar & Tabs */}
        <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveTab('tables')}
              className={`px-3 py-1 rounded text-xs font-semibold border transition-all ${
                activeTab === 'tables' 
                  ? 'bg-white border-slate-300 text-blue-900 shadow-xs' 
                  : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Tablas y Registros
            </button>
            <button
              onClick={() => setActiveTab('ddl')}
              className={`px-3 py-1 rounded text-xs font-semibold border transition-all ${
                activeTab === 'ddl' 
                  ? 'bg-white border-slate-300 text-blue-900 shadow-xs' 
                  : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Esquema DDL (SQL)
            </button>
            <button
              onClick={() => setActiveTab('raw_json')}
              className={`px-3 py-1 rounded text-xs font-semibold border transition-all ${
                activeTab === 'raw_json' 
                  ? 'bg-white border-slate-300 text-blue-900 shadow-xs' 
                  : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Snapshot JSON
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-mono">
            {selectedTable}.db | {currentTableRecords.length} filas
          </span>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden p-3 bg-slate-50/50">
          {activeTab === 'tables' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 h-full">
              {/* Tables Sidebar */}
              <div className="md:col-span-4 bg-white border border-slate-300 rounded p-2 space-y-1 overflow-y-auto">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider px-2 py-1 block border-b border-slate-200">
                  Tablas del Sistema ({tables.length})
                </span>
                {tables.map(tbl => (
                  <div
                    key={tbl.name}
                    onClick={() => setSelectedTable(tbl.name)}
                    className={`px-2.5 py-1.5 rounded cursor-pointer border text-xs transition-colors ${
                      selectedTable === tbl.name
                        ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                        : 'bg-white hover:bg-slate-100 border-transparent text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs">{tbl.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-600 font-semibold">
                        {tbl.count} reg.
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">{tbl.description}</p>
                  </div>
                ))}
              </div>

              {/* Table Data View */}
              <div className="md:col-span-8 bg-white border border-slate-300 rounded p-3 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-800">
                    <Table className="w-3.5 h-3.5 text-blue-700" />
                    <span>SELECT * FROM {selectedTable};</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {currentTableRecords.length} registros cargados
                  </span>
                </div>

                <div className="flex-1 overflow-auto mt-2 border border-slate-200 rounded">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 sticky top-0">
                        {headers.map(h => (
                          <th key={h} className="py-1.5 px-2.5 whitespace-nowrap border-r border-slate-200">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {currentTableRecords.length === 0 ? (
                        <tr>
                          <td colSpan={headers.length || 1} className="py-6 text-center text-slate-400">
                            Tabla vacía (0 registros)
                          </td>
                        </tr>
                      ) : (
                        currentTableRecords.map((row: any, i: number) => (
                          <tr key={i} className="hover:bg-blue-50/40">
                            {headers.map(h => (
                              <td key={h} className="py-1 px-2.5 whitespace-nowrap truncate max-w-[220px] border-r border-slate-200 text-[11px]">
                                {String(row[h] !== undefined ? row[h] : '')}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ddl' && (
            <div className="h-full flex flex-col bg-white border border-slate-300 rounded p-3 overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 font-mono">
                  <Code2 className="w-3.5 h-3.5 text-blue-700" />
                  <span>schema.sql (SQLite DDL con Claves Foráneas e Integridad)</span>
                </div>
                <button
                  onClick={handleCopyDDL}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-300 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '¡Copiado!' : 'Copiar DDL SQL'}</span>
                </button>
              </div>

              <pre className="flex-1 overflow-auto mt-2 p-3 bg-slate-900 text-emerald-300 rounded font-mono text-xs leading-relaxed border border-slate-700 selection:bg-blue-600 selection:text-white">
                {SQLITE_INIT_DDL}
              </pre>
            </div>
          )}

          {activeTab === 'raw_json' && (
            <div className="h-full flex flex-col bg-white border border-slate-300 rounded p-3 overflow-hidden">
              <div className="pb-2 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-800">
                  JSON Database Snapshot
                </span>
                <span className="text-[11px] text-slate-500">
                  Total Entidades: {Object.keys(rawData).length}
                </span>
              </div>
              <pre className="flex-1 overflow-auto mt-2 p-3 bg-slate-900 text-blue-200 rounded font-mono text-xs leading-relaxed border border-slate-700">
                {JSON.stringify(rawData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Statusbar */}
        <div className="bg-slate-100 px-3 py-1 border-t border-slate-300 flex items-center justify-between text-[11px] text-slate-600">
          <span>Modo Offline-First con Motor SQLite Local</span>
          <button
            onClick={onClose}
            className="px-3 py-0.5 rounded bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold shadow-2xs"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
