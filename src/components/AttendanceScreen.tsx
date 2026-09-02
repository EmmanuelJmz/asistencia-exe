import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Calendar, 
  Users, 
  Lock, 
  Unlock, 
  Save, 
  CheckCheck, 
  Clock, 
  AlertCircle,
  FileCheck,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { 
  Group, 
  Student, 
  AttendanceSession, 
  AttendanceRecord, 
  AttendanceStatus 
} from '../types';
import { dbService } from '../db/databaseService';

interface AttendanceScreenProps {
  groups: Group[];
  students: Student[];
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string) => void;
  onDataChanged: () => void;
}

export const AttendanceScreen: React.FC<AttendanceScreenProps> = ({
  groups,
  students,
  selectedGroupId,
  onSelectGroup,
  onDataChanged,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isSavedBanner, setIsSavedBanner] = useState(false);
  const [activeNoteStudentId, setActiveNoteStudentId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');

  const activeGroup = groups.find(g => g.id === selectedGroupId) || groups[0] || null;

  // Load or create attendance session whenever group or date changes
  useEffect(() => {
    if (activeGroup) {
      const data = dbService.getOrCreateAttendanceSession(activeGroup.id, selectedDate);
      setSession(data.session);
      setRecords(data.records);
    }
  }, [activeGroup, selectedDate]);

  const activeStudents = activeGroup
    ? students
        .filter(s => s.groupId === activeGroup.id && s.status === 'Active')
        .sort((a, b) => a.rollNumber - b.rollNumber)
    : [];

  const getRecordForStudent = (studentId: string): AttendanceRecord | undefined => {
    return records.find(r => r.studentId === studentId);
  };

  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    if (!session || session.isLocked) return;
    const updated = dbService.setStudentAttendanceStatus(session.id, studentId, status);
    setRecords(prev => {
      const idx = prev.findIndex(r => r.studentId === studentId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [...prev, updated];
    });
    onDataChanged();
  };

  const handleMarkAllPresent = () => {
    if (!session || session.isLocked) return;
    const studentIds = activeStudents.map(s => s.id);
    dbService.markAllPresent(session.id, studentIds);
    const reloaded = dbService.getOrCreateAttendanceSession(session.groupId, session.date);
    setRecords(reloaded.records);
    onDataChanged();
  };

  const handleSaveAndLock = (lock: boolean) => {
    if (!session) return;
    const updatedSession = dbService.commitAttendanceSave(session.id, lock);
    setSession(updatedSession);
    setIsSavedBanner(true);
    onDataChanged();
    setTimeout(() => setIsSavedBanner(false), 3000);
  };

  const handleSaveNote = (studentId: string) => {
    if (!session || session.isLocked) return;
    const existing = getRecordForStudent(studentId);
    const currentStatus: AttendanceStatus = existing ? existing.status : 'Presente';
    const updated = dbService.setStudentAttendanceStatus(session.id, studentId, currentStatus, tempNoteText);
    setRecords(prev => {
      const idx = prev.findIndex(r => r.studentId === studentId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [...prev, updated];
    });
    setActiveNoteStudentId(null);
    onDataChanged();
  };

  // Stats for the active session
  const totalInList = activeStudents.length;
  let countPresente = 0;
  let countFalta = 0;
  let countRetardo = 0;
  let countJustificada = 0;

  activeStudents.forEach(stu => {
    const rec = getRecordForStudent(stu.id);
    if (rec) {
      if (rec.status === 'Presente') countPresente++;
      else if (rec.status === 'Falta') countFalta++;
      else if (rec.status === 'Retardo') countRetardo++;
      else if (rec.status === 'Justificada') countJustificada++;
    }
  });

  const attendancePercentage = totalInList > 0 
    ? Math.round(((countPresente + countRetardo) / totalInList) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      {/* Title Bar & Filter Row (Classic Desktop Form Controls) */}
      <div className="bg-white border border-slate-300 rounded shadow-xs p-3.5 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-blue-50 border border-blue-200 text-blue-800">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                Libro de Asistencia y Puntualidad
              </h1>
              <p className="text-[11px] text-slate-500">
                Control y registro diario de asistencias por grupo y fecha escolar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllPresent}
              disabled={session?.isLocked || activeStudents.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-xs font-semibold shadow-xs transition-colors border border-emerald-800"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Marcar Todos Presentes</span>
            </button>

            {session?.isLocked ? (
              <button
                onClick={() => handleSaveAndLock(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold transition-colors"
                title="Desbloquear para permitir ediciones"
              >
                <Unlock className="w-3.5 h-3.5 text-amber-700" />
                <span>Desbloquear Sesión</span>
              </button>
            ) : (
              <button
                onClick={() => handleSaveAndLock(true)}
                disabled={activeStudents.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white text-xs font-semibold shadow-xs transition-colors border border-blue-800"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Guardar y Bloquear</span>
              </button>
            )}
          </div>
        </div>

        {/* Group Selector & Date Picker Bar */}
        {groups.length === 0 ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-xs flex items-center justify-between">
            <span>No hay grupos registrados aún. Registre su primer grupo para poder iniciar el pase de lista.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Grupo Escolar:</label>
              <select
                value={activeGroup ? activeGroup.id : ''}
                onChange={(e) => onSelectGroup(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-slate-800 font-medium focus:outline-none focus:border-blue-600 shadow-inner"
              >
                {groups.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name} — Turno {g.shift}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Fecha de la Sesión:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-slate-800 font-mono focus:outline-none focus:border-blue-600 shadow-inner"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Estado de la Sesión:</label>
              <div className="px-3 py-1.5 rounded bg-slate-50 border border-slate-300 flex items-center justify-between">
                <span className="text-slate-600 text-xs font-medium">Registro:</span>
                {session?.isLocked ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200 font-bold text-[11px]">
                    <Lock className="w-3 h-3 text-red-600" />
                    Bloqueada (Cerrada)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                    <Unlock className="w-3 h-3 text-emerald-600" />
                    Abierta (Editable)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Success Banner */}
      {isSavedBanner && (
        <div className="p-2.5 rounded bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="font-medium">¡Pase de lista guardado correctamente!</span>
        </div>
      )}

      {/* Live Statistics Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <div className="bg-white border border-slate-300 rounded p-2 text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Presentes</span>
          <p className="text-lg font-bold text-emerald-700 font-mono">{countPresente}</p>
        </div>
        <div className="bg-white border border-slate-300 rounded p-2 text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Faltas</span>
          <p className="text-lg font-bold text-red-700 font-mono">{countFalta}</p>
        </div>
        <div className="bg-white border border-slate-300 rounded p-2 text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Retardos</span>
          <p className="text-lg font-bold text-amber-700 font-mono">{countRetardo}</p>
        </div>
        <div className="bg-white border border-slate-300 rounded p-2 text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Justificadas</span>
          <p className="text-lg font-bold text-indigo-700 font-mono">{countJustificada}</p>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-white border border-slate-300 rounded p-2 text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">% Asistencia</span>
          <p className="text-lg font-bold text-blue-800 font-mono">{attendancePercentage}%</p>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
        <div className="bg-slate-100 px-3 py-2 border-b border-slate-300 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Alumnos inscritos en {activeGroup?.name || 'Grupo'} ({activeStudents.length})
          </span>
          <span className="text-[11px] text-slate-500">
            Haga clic sobre el botón de estado correspondiente
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-300">
                <th className="py-2 px-3 w-12 text-center border-r border-slate-200">N°</th>
                <th className="py-2 px-3 border-r border-slate-200">Apellidos y Nombre</th>
                <th className="py-2 px-3 text-center border-r border-slate-200">Estado de Asistencia</th>
                <th className="py-2 px-3 hidden md:table-cell">Observación / Justificante</th>
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
                  const record = getRecordForStudent(student.id);
                  const currentStatus = record ? record.status : null;

                  return (
                    <tr key={student.id} className="hover:bg-blue-50/50 transition-colors">
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

                      {/* Status Action Buttons with Strict Spec Color Coding */}
                      <td className="py-2 px-3 border-r border-slate-200">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {/* Presente */}
                          <button
                            onClick={() => handleSetStatus(student.id, 'Presente')}
                            disabled={session?.isLocked}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition-all border ${
                              currentStatus === 'Presente'
                                ? 'bg-[#D1FAE5] text-[#10B981] border-[#10B981] shadow-xs'
                                : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-300'
                            }`}
                          >
                            ✓ Presente
                          </button>

                          {/* Falta */}
                          <button
                            onClick={() => handleSetStatus(student.id, 'Falta')}
                            disabled={session?.isLocked}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition-all border ${
                              currentStatus === 'Falta'
                                ? 'bg-[#FEE2E2] text-[#EF4444] border-[#EF4444] shadow-xs'
                                : 'bg-white hover:bg-red-50 text-slate-700 border-slate-300'
                            }`}
                          >
                            ✕ Falta
                          </button>

                          {/* Retardo */}
                          <button
                            onClick={() => handleSetStatus(student.id, 'Retardo')}
                            disabled={session?.isLocked}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition-all border ${
                              currentStatus === 'Retardo'
                                ? 'bg-[#FEF3C7] text-[#F59E0B] border-[#F59E0B] shadow-xs'
                                : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-300'
                            }`}
                          >
                            ⏱ Retardo
                          </button>

                          {/* Justificada */}
                          <button
                            onClick={() => handleSetStatus(student.id, 'Justificada')}
                            disabled={session?.isLocked}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition-all border ${
                              currentStatus === 'Justificada'
                                ? 'bg-[#E0E7FF] text-[#6366F1] border-[#6366F1] shadow-xs'
                                : 'bg-white hover:bg-indigo-50 text-slate-700 border-slate-300'
                            }`}
                          >
                            ℹ Justificada
                          </button>
                        </div>
                      </td>

                      {/* Note / Justification column */}
                      <td className="py-2 px-3 hidden md:table-cell">
                        {activeNoteStudentId === student.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              autoFocus
                              value={tempNoteText}
                              onChange={(e) => setTempNoteText(e.target.value)}
                              placeholder="Motivo o justificante..."
                              className="px-2 py-1 rounded bg-white border border-blue-500 text-xs text-slate-800 focus:outline-none w-full shadow-inner"
                            />
                            <button
                              onClick={() => handleSaveNote(student.id)}
                              className="px-2 py-1 rounded bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs"
                            >
                              OK
                            </button>
                            <button
                              onClick={() => setActiveNoteStudentId(null)}
                              className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              if (session?.isLocked) return;
                              setActiveNoteStudentId(student.id);
                              setTempNoteText(record?.note || '');
                            }}
                            className={`cursor-pointer px-2 py-1 rounded border text-xs truncate max-w-[220px] transition-colors ${
                              record?.note
                                ? 'bg-amber-50 border-amber-300 text-amber-900 font-medium'
                                : 'border-dashed border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-400'
                            }`}
                            title="Haga clic para capturar o editar observación"
                          >
                            {record?.note ? (
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3 text-amber-700 shrink-0" />
                                <span>{record.note}</span>
                              </span>
                            ) : (
                              <span>+ Agregar nota</span>
                            )}
                          </div>
                        )}
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
};
