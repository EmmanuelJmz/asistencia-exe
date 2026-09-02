import React, { useState } from 'react';
import { 
  BarChart3, 
  FileSpreadsheet, 
  Printer, 
  School, 
  CheckCircle2,
  CheckSquare,
  GraduationCap
} from 'lucide-react';
import { 
  Group, 
  Student, 
  Subject, 
  Period, 
  UserSettings
} from '../types';
import { dbService } from '../db/databaseService';

interface ReportsScreenProps {
  groups: Group[];
  students: Student[];
  subjects: Subject[]; // Mantenido para no romper App.tsx aunque no se use
  periods: Period[];   // Mantenido para no romper App.tsx aunque no se use
  settings: UserSettings;
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string) => void;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  groups,
  students,
  settings,
  selectedGroupId,
  onSelectGroup,
}) => {
  const activeGroup = groups.find(g => g.id === selectedGroupId) || groups[0] || null;
  const [currentTab, setCurrentTab] = useState<'attendance' | 'grades'>('attendance');
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  const raw = dbService.getRawTables();

  const groupStudents = activeGroup
    ? students
        .filter(s => s.groupId === activeGroup.id)
        .sort((a, b) => a.rollNumber - b.rollNumber)
    : [];

  // Calculate statistics for each student
  const studentReports = groupStudents.map(student => {
    // Attendance stats
    const studentRecords = raw.attendanceRecords.filter(r => r.studentId === student.id);
    const totalSessions = studentRecords.length;
    const presentes = studentRecords.filter(r => r.status === 'Presente').length;
    const faltas = studentRecords.filter(r => r.status === 'Falta').length;
    const retardos = studentRecords.filter(r => r.status === 'Retardo').length;
    const justificadas = studentRecords.filter(r => r.status === 'Justificada').length;
    const attPct = totalSessions > 0 ? Math.round(((presentes + retardos) / totalSessions) * 100) : 100;

    // Grades for this group 
    const studentGrades = raw.grades.filter(
      g => g.studentId === student.id && g.groupId === activeGroup?.id
    );

    const gradeScores = studentGrades.map(g => g.score);
    const avgGrade = gradeScores.length > 0
      ? (gradeScores.reduce((a, b) => a + b, 0) / gradeScores.length).toFixed(1)
      : 'N/A';

    return {
      student,
      totalSessions,
      presentes,
      faltas,
      retardos,
      justificadas,
      attPct,
      studentGrades,
      avgGrade,
    };
  });

  // Calculate group averages
  const validGrades = studentReports
    .filter(r => r.avgGrade !== 'N/A')
    .map(r => parseFloat(r.avgGrade));

  const groupGradeAverage = validGrades.length > 0
    ? (validGrades.reduce((a, b) => a + b, 0) / validGrades.length).toFixed(1)
    : '0.0';

  const groupAttendanceAverage = studentReports.length > 0
    ? Math.round(studentReports.reduce((a, b) => a + b.attPct, 0) / studentReports.length)
    : 0;

  // Export to CSV Functionality
  const handleExportCSV = async () => {
    if (!activeGroup) return;

    let csvContent = currentTab === 'attendance' 
      ? 'N_Lista,Apellidos,Nombres,Estatus,Asistencias,Faltas,Retardos,Justificadas,Porcentaje_Asistencia\n'
      : 'N_Lista,Apellidos,Nombres,Estatus,Promedio_Calificacion\n';

    studentReports.forEach(r => {
      let row = '';
      if (currentTab === 'attendance') {
        row = [
          r.student.rollNumber,
          `"${r.student.lastName.replace(/"/g, '""')}"`,
          `"${r.student.firstName.replace(/"/g, '""')}"`,
          r.student.status,
          r.presentes,
          r.faltas,
          r.retardos,
          r.justificadas,
          `${r.attPct}%`
        ].join(',');
      } else {
        row = [
          r.student.rollNumber,
          `"${r.student.lastName.replace(/"/g, '""')}"`,
          `"${r.student.firstName.replace(/"/g, '""')}"`,
          r.student.status,
          r.avgGrade
        ].join(',');
      }
      csvContent += row + '\n';
    });

    const prefix = currentTab === 'attendance' ? 'Asistencia' : 'Calificaciones';
    const defaultFilename = `Reporte_${prefix}_${activeGroup.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', defaultFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportFeedback(`Reporte exportado exitosamente como ${defaultFilename}`);
    setTimeout(() => setExportFeedback(null), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 print:m-0 print:p-0">
      {/* Filters & Export Bar */}
      <div className="bg-white border border-slate-300 rounded shadow-xs p-3 space-y-3 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-blue-50 border border-blue-200 text-blue-800">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">Concentrado de Reportes y Estadísticas</h1>
              <p className="text-[11px] text-slate-500">
                Sábanas de calificaciones y concentrado de asistencia con exportación a Excel / CSV e impresión oficial.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors border border-emerald-800"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar Excel / CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Formato</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2.5 border-t border-slate-200 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Grupo Escolar:</label>
            <select
              value={activeGroup ? activeGroup.id : ''}
              onChange={(e) => onSelectGroup(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-600 shadow-inner"
            >
              {groups.map(g => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.shift})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Tipo de Reporte:</label>
            <div className="flex items-center bg-slate-100 border border-slate-300 rounded p-1">
              <button
                onClick={() => setCurrentTab('attendance')}
                className={`flex-1 flex items-center justify-center gap-2 py-1 rounded text-xs font-semibold transition-colors ${
                  currentTab === 'attendance'
                    ? 'bg-white shadow-xs text-slate-900 border-slate-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Reporte de Asistencias
              </button>
              <button
                onClick={() => setCurrentTab('grades')}
                className={`flex-1 flex items-center justify-center gap-2 py-1 rounded text-xs font-semibold transition-colors ${
                  currentTab === 'grades'
                    ? 'bg-white shadow-xs text-slate-900 border-slate-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Reporte de Calificaciones
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Export Feedback Toast */}
      {exportFeedback && (
        <div className="p-2.5 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center justify-center gap-2 shadow-xs print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">{exportFeedback}</span>
        </div>
      )}

      {/* Official Report Card (Printable Document Layout) */}
      <div className="bg-white border border-slate-300 rounded shadow-xs p-6 space-y-5 print:border-none print:shadow-none print:p-0">
        {/* Printable Header */}
        <div className="border-b-2 border-slate-800 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <School className="w-4 h-4 text-blue-900" />
              <h2 className="text-base font-bold text-slate-900">{settings.schoolName}</h2>
            </div>
            <p className="text-xs text-slate-600">
              Docente Responsable: <strong className="text-slate-900">{settings.teacherName}</strong>
            </p>
          </div>

          <div className="text-left md:text-right space-y-0.5 text-xs text-slate-700">
            <p className="font-bold text-sm text-slate-900">
              {currentTab === 'attendance' ? 'Reporte Oficial de Asistencias' : 'Sábana Oficial de Calificaciones'}
            </p>
            <p><strong>Grupo:</strong> {activeGroup?.name || 'N/A'}</p>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-slate-50 border border-slate-300 rounded p-2.5 text-center">
            <span className="text-[11px] text-slate-500 font-medium block">Total Alumnos</span>
            <p className="text-base font-bold text-slate-900 font-mono">{groupStudents.length}</p>
          </div>
          {currentTab === 'grades' ? (
            <>
              <div className="bg-slate-50 border border-slate-300 rounded p-2.5 text-center">
                <span className="text-[11px] text-slate-500 font-medium block">Promedio Calificaciones</span>
                <p className="text-base font-bold text-blue-900 font-mono">{groupGradeAverage}</p>
              </div>
              <div className="bg-slate-50 border border-slate-300 rounded p-2.5 text-center sm:col-span-2">
                <span className="text-[11px] text-slate-500 font-medium block">Alumnos Aprobados</span>
                <p className="text-base font-bold text-teal-800 font-mono">
                  {studentReports.filter(r => r.avgGrade !== 'N/A' && parseFloat(r.avgGrade) >= 6.0).length} / {studentReports.length}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-slate-50 border border-slate-300 rounded p-2.5 text-center sm:col-span-3">
                <span className="text-[11px] text-slate-500 font-medium block">% Asistencia Grupal</span>
                <p className="text-base font-bold text-emerald-800 font-mono">{groupAttendanceAverage}%</p>
              </div>
            </>
          )}
        </div>

        {/* Master Grade & Attendance Table */}
        <div className="overflow-x-auto border border-slate-300 rounded">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <th className="py-2 px-2.5 w-10 text-center border-r border-slate-200">N°</th>
                <th className="py-2 px-2.5 border-r border-slate-200">Apellidos y Nombres</th>
                <th className="py-2 px-2 text-center w-20 border-r border-slate-200">Estatus</th>
                {currentTab === 'attendance' ? (
                  <>
                    <th className="py-2 px-2 text-center text-emerald-800 border-r border-slate-200">Pres.</th>
                    <th className="py-2 px-2 text-center text-red-700 border-r border-slate-200">Falt.</th>
                    <th className="py-2 px-2 text-center text-amber-700 border-r border-slate-200">Ret.</th>
                    <th className="py-2 px-2 text-center text-blue-700 border-r border-slate-200">Just.</th>
                    <th className="py-2 px-2.5 text-center border-r border-slate-200">% Asist.</th>
                  </>
                ) : (
                  <th className="py-2 px-2.5 text-center font-bold text-slate-900">Promedio</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {studentReports.length === 0 ? (
                <tr>
                  <td colSpan={currentTab === 'attendance' ? 8 : 4} className="py-8 text-center text-slate-500">
                    No hay alumnos registrados para generar el reporte.
                  </td>
                </tr>
              ) : (
                studentReports.map(r => {
                  const numGrade = parseFloat(r.avgGrade);
                  const isPassing = !isNaN(numGrade) && numGrade >= 6.0;

                  return (
                    <tr key={r.student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-1.5 px-2.5 text-center font-mono font-bold text-slate-600 border-r border-slate-200 bg-slate-50/50">
                        {r.student.rollNumber}
                      </td>
                      <td className="py-1.5 px-2.5 border-r border-slate-200 font-semibold text-slate-900">
                        {r.student.lastName}, {r.student.firstName}
                      </td>
                      <td className="py-1.5 px-2 text-center border-r border-slate-200">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                          r.student.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}>
                          {r.student.status === 'Active' ? 'Activo' : 'Baja'}
                        </span>
                      </td>
                      {currentTab === 'attendance' ? (
                        <>
                          <td className="py-1.5 px-2 text-center font-mono font-semibold text-emerald-700 border-r border-slate-200">
                            {r.presentes}
                          </td>
                          <td className="py-1.5 px-2 text-center font-mono font-semibold text-red-600 border-r border-slate-200">
                            {r.faltas}
                          </td>
                          <td className="py-1.5 px-2 text-center font-mono font-semibold text-amber-600 border-r border-slate-200">
                            {r.retardos}
                          </td>
                          <td className="py-1.5 px-2 text-center font-mono font-semibold text-blue-600 border-r border-slate-200">
                            {r.justificadas}
                          </td>
                          <td className="py-1.5 px-2.5 text-center font-mono font-bold text-slate-700 border-r border-slate-200">
                            {r.attPct}%
                          </td>
                        </>
                      ) : (
                        <td className="py-1.5 px-2.5 text-center">
                          {r.avgGrade === 'N/A' ? (
                            <span className="text-slate-400 font-mono text-xs">S/C</span>
                          ) : (
                            <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                              isPassing
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                : 'bg-red-50 text-red-700 border border-red-300'
                            }`}>
                              {r.avgGrade}
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Printable Signature Footers */}
        <div className="pt-10 grid grid-cols-2 gap-12 text-center text-xs">
          <div className="border-t border-slate-400 pt-2">
            <p className="font-bold text-slate-900">{settings.teacherName}</p>
            <p className="text-slate-500 text-[11px]">Firma del Docente Titular</p>
          </div>
          <div className="border-t border-slate-400 pt-2">
            <p className="font-bold text-slate-900">Dirección del Plantel Escolar</p>
            <p className="text-slate-500 text-[11px]">Sello y Firma de Dirección</p>
          </div>
        </div>
      </div>
    </div>
  );
};
