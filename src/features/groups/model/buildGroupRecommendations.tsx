import React from 'react';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  ShieldAlert,
  TrendingDown,
} from 'lucide-react';
import { Group, Student } from '../../../shared/types';
import { schoolData } from '../../../application/schoolData';

export interface GroupRecommendation {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  count?: number;
  icon: React.ReactNode;
}

export function buildGroupRecommendations(
  activeGroup: Group | null,
  students: Student[],
): GroupRecommendation[] {
  if (!activeGroup) return [];

  const activeStudents = students.filter(s => s.groupId === activeGroup.id && s.status === 'Active');
  const activeStudentIds = new Set(activeStudents.map(student => student.id));
  const groupActivities = schoolData.getActivities(activeGroup.id);
  const groupGrades = schoolData.getAllGradesForGroup(activeGroup.id)
    .filter(grade => activeStudentIds.has(grade.studentId));
  const rawData = schoolData.getRawTables();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const todaySession = rawData.sessions.find(session => session.groupId === activeGroup.id && session.date === todayStr);

  const studentsWithoutAttendance = activeStudents.filter(student => {
    if (!todaySession) return true;
    return !rawData.attendanceRecords.some(record => record.sessionId === todaySession.id && record.studentId === student.id);
  });

  const pendingActivities = groupActivities.filter(activity => {
    const gradedStudentIds = new Set(groupGrades
      .filter(grade => grade.activityId === activity.id && activeStudentIds.has(grade.studentId))
      .map(grade => grade.studentId));
    return gradedStudentIds.size < activeStudents.length;
  });

  const averageScore = groupGrades.length
    ? groupGrades.reduce((sum, grade) => sum + Number(grade.score || 0), 0) / groupGrades.length
    : 0;

  const attendanceCountsAsPresent = (status: string) => ['Presente', 'Retardo', 'Justificada'].includes(status);
  const attendanceRate = todaySession && activeStudents.length > 0
    ? (rawData.attendanceRecords.filter(record =>
        record.sessionId === todaySession.id &&
        activeStudentIds.has(record.studentId) &&
        attendanceCountsAsPresent(record.status)
      ).length / activeStudents.length) * 100
    : 0;

  const studentsAtRisk = activeStudents.filter(student => {
    const studentGrades = groupGrades.filter(grade => grade.studentId === student.id);
    const studentAverage = studentGrades.length
      ? studentGrades.reduce((sum, grade) => sum + Number(grade.score || 0), 0) / studentGrades.length
      : 0;
    const todayRecord = todaySession
      ? rawData.attendanceRecords.find(record => record.sessionId === todaySession.id && record.studentId === student.id)
      : undefined;
    const studentAttendance = todaySession
      ? (todayRecord && attendanceCountsAsPresent(todayRecord.status) ? 100 : 0)
      : 100;

    return (studentGrades.length > 0 && studentAverage < 7) || studentAttendance < 75;
  });

  const items: GroupRecommendation[] = [];

  if (studentsWithoutAttendance.length > 0) {
    items.push({
      id: 'attendance',
      type: 'warning',
      title: 'Asistencia incompleta',
      message: `Faltan registrar ${studentsWithoutAttendance.length} alumno${studentsWithoutAttendance.length === 1 ? '' : 's'} de hoy.`,
      count: studentsWithoutAttendance.length,
      icon: <CalendarClock className="w-4 h-4" />,
    });
  }

  if (pendingActivities.length > 0) {
    items.push({
      id: 'activities',
      type: 'info',
      title: 'Por calificar',
      message: `Faltan por calificar ${pendingActivities.length} actividad${pendingActivities.length === 1 ? '' : 'es'} del grupo.`,
      count: pendingActivities.length,
      icon: <ClipboardList className="w-4 h-4" />,
    });
  }

  if (groupGrades.length > 0 && averageScore < 7) {
    items.push({
      id: 'grades',
      type: 'danger',
      title: 'Rendimiento bajo',
      message: `El promedio del grupo está en ${averageScore.toFixed(1)} puntos. Revisa el apoyo académico.`,
      count: Number(averageScore.toFixed(1)),
      icon: <TrendingDown className="w-4 h-4" />,
    });
  }

  if (todaySession && activeStudents.length > 0 && attendanceRate < 75) {
    items.push({
      id: 'attendance-rate',
      type: 'danger',
      title: 'Asistencia baja',
      message: `La asistencia del grupo está en ${attendanceRate.toFixed(0)}%. Se recomienda revisar faltas.`,
      count: Number(attendanceRate.toFixed(0)),
      icon: <ShieldAlert className="w-4 h-4" />,
    });
  }

  if (studentsAtRisk.length > 0) {
    items.push({
      id: 'risk',
      type: 'warning',
      title: 'Alumnos en riesgo',
      message: `${studentsAtRisk.length} alumno${studentsAtRisk.length === 1 ? '' : 's'} requieren seguimiento por bajo rendimiento o asistencia.`,
      count: studentsAtRisk.length,
      icon: <AlertTriangle className="w-4 h-4" />,
    });
  }

  if (items.length === 0) {
    items.push({
      id: 'healthy',
      type: 'info',
      title: 'Todo en orden',
      message: 'El grupo presenta avance y asistencia dentro del rango esperado.',
      icon: <CheckCircle2 className="w-4 h-4" />,
    });
  }

  return items;
}