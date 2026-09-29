import React, { useState } from 'react';
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
  MoreVertical,
  School,
  Sparkles,
  AlertTriangle,
  LayoutGrid,
  List,
  ClipboardList,
  TrendingDown,
  CalendarClock,
  ShieldAlert
} from 'lucide-react';
import { Group, Student, StudentStatus } from '../types';
import { dbService } from '../db/databaseService';

interface GroupsStudentsScreenProps {
  groups: Group[];
  students: Student[];
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string) => void;
  onDataChanged: () => void;
}

export const GroupsStudentsScreen: React.FC<GroupsStudentsScreenProps> = ({
  groups,
  students,
  selectedGroupId,
  onSelectGroup,
  onDataChanged,
}) => {
  const activeGroup = groups.find(g => g.id === selectedGroupId) || null;

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [movingStudent, setMovingStudent] = useState<Student | null>(null);
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);
  const [importSearchQuery, setImportSearchQuery] = useState('');
  const [selectedImportStudentIds, setSelectedImportStudentIds] = useState<Set<string>>(new Set());
  const [studentViewMode, setStudentViewMode] = useState<'list' | 'grid'>('list');
  const [groupViewMode, setGroupViewMode] = useState<'list' | 'grid'>('list');

  // Form states for Group
  const [groupForm, setGroupForm] = useState({
    name: '',
    grade: '1°',
    section: 'A',
    shift: 'Matutino' as 'Matutino' | 'Vespertino' | 'Nocturno',
    schoolYear: '2026-2027',
    colorHex: '#1E3A8A',
  });

  // Form states for Student
  const [studentForm, setStudentForm] = useState({
    firstName: '',
    lastName: '',
    rollNumber: 1,
    status: 'Active' as StudentStatus,
    notes: '',
  });

  const [targetMoveGroupId, setTargetMoveGroupId] = useState<string>('');
  const [sortBy, setSortBy] = useState<'lastName_asc' | 'lastName_desc' | 'roll_asc' | 'roll_desc' | 'firstName_asc'>('lastName_asc');

  const groupStudents = activeGroup
    ? students
        .filter(s => s.groupId === activeGroup.id)
        .filter(s => {
          if (!searchQuery) return true;
          const full = `${s.firstName} ${s.lastName} ${s.rollNumber}`.toLowerCase();
          return full.includes(searchQuery.toLowerCase());
        })
        .sort((a, b) => {
          if (sortBy === 'lastName_asc') {
            return (a.lastName || '').localeCompare(b.lastName || '', 'es') || (a.firstName || '').localeCompare(b.firstName || '', 'es');
          }
          if (sortBy === 'lastName_desc') {
            return (b.lastName || '').localeCompare(a.lastName || '', 'es') || (b.firstName || '').localeCompare(a.firstName || '', 'es');
          }
          if (sortBy === 'roll_asc') {
            return a.rollNumber - b.rollNumber;
          }
          if (sortBy === 'roll_desc') {
            return b.rollNumber - a.rollNumber;
          }
          if (sortBy === 'firstName_asc') {
            return (a.firstName || '').localeCompare(b.firstName || '', 'es') || (a.lastName || '').localeCompare(b.lastName || '', 'es');
          }
          return 0;
        })
    : [];

  const groupRecommendations = React.useMemo(() => {
    if (!activeGroup) return [] as Array<{ id: string; type: 'warning' | 'danger' | 'info'; title: string; message: string; count?: number; icon: React.ReactNode }>;

    const activeStudents = students.filter(s => s.groupId === activeGroup.id && s.status === 'Active');
    const activeStudentIds = new Set(activeStudents.map(student => student.id));
    const groupActivities = dbService.getActivities(activeGroup.id);
    const groupGrades = dbService.getAllGradesForGroup(activeGroup.id)
      .filter(grade => activeStudentIds.has(grade.studentId));
    const rawData = dbService.getRawTables();
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

    const items: Array<{ id: string; type: 'warning' | 'danger' | 'info'; title: string; message: string; count?: number; icon: React.ReactNode }> = [];

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
  }, [activeGroup, students]);

  // ================= Handlers =================
  const handleOpenNewGroup = () => {
    setGroupForm({
      name: '',
      grade: '1°',
      section: 'A',
      shift: 'Matutino',
      schoolYear: '2025-2026',
      colorHex: '#1E3A8A',
    });
    setIsNewGroupModalOpen(true);
  };

  const handleSaveNewGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupForm.name.trim()) return;
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    const newGrp = dbService.addGroup(groupForm);
    setIsSaving(false);
    onDataChanged();
    onSelectGroup(newGrp.id);
    setIsNewGroupModalOpen(false);
  };

  const handleOpenEditGroup = () => {
    if (!activeGroup) return;
    setGroupForm({
      name: activeGroup.name,
      grade: activeGroup.grade,
      section: activeGroup.section,
      shift: activeGroup.shift,
      schoolYear: activeGroup.schoolYear,
      colorHex: activeGroup.colorHex,
    });
    setIsEditGroupModalOpen(true);
  };

  const handleSaveEditGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup) return;
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    dbService.updateGroup({
      ...activeGroup,
      ...groupForm,
    });
    setIsSaving(false);
    onDataChanged();
    setIsEditGroupModalOpen(false);
  };

  const handleDeleteGroup = (groupId: string) => {
    dbService.deleteGroup(groupId);
    onDataChanged();
    setDeletingGroupId(null);
    if (selectedGroupId === groupId && groups.length > 1) {
      const remaining = groups.filter(g => g.id !== groupId);
      if (remaining.length > 0) onSelectGroup(remaining[0].id);
    }
  };

  const handleOpenNewStudent = () => {
    if (!activeGroup) return;
    const nextRoll = students.filter(s => s.groupId === activeGroup.id).length + 1;
    setStudentForm({
      firstName: '',
      lastName: '',
      rollNumber: nextRoll,
      status: 'Active',
      notes: '',
    });
    setIsNewStudentModalOpen(true);
  };

  const handleSaveNewStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup || !studentForm.firstName.trim() || !studentForm.lastName.trim()) return;
    setIsSaving(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    dbService.addStudent({
      groupId: activeGroup.id,
      firstName: studentForm.firstName.trim(),
      lastName: studentForm.lastName.trim(),
      rollNumber: Number(studentForm.rollNumber) || 1,
      status: studentForm.status,
      notes: studentForm.notes?.trim(),
    });

    setIsSaving(false);
    onDataChanged();
    setIsNewStudentModalOpen(false);
  };

  const handleOpenImportModal = () => {
    setImportSearchQuery('');
    setSelectedImportStudentIds(new Set());
    setIsImportModalOpen(true);
  };

  const handleExecuteImport = async () => {
    if (!activeGroup || selectedImportStudentIds.size === 0) return;
    setIsSaving(true);

    await new Promise(resolve => setTimeout(resolve, 800)); // Un poco más largo para importar varios

    let nextRoll = students.filter(s => s.groupId === activeGroup.id).length + 1;

    selectedImportStudentIds.forEach(stuId => {
      const stuToCopy = students.find(s => s.id === stuId);
      if (stuToCopy) {
        dbService.addStudent({
          groupId: activeGroup.id,
          firstName: stuToCopy.firstName,
          lastName: stuToCopy.lastName,
          rollNumber: nextRoll++,
          status: 'Active',
          notes: stuToCopy.notes,
        });
      }
    });

    setIsSaving(false);
    onDataChanged();
    setIsImportModalOpen(false);
  };

  const handleOpenEditStudent = (student: Student) => {
    setEditingStudent(student);
    setStudentForm({
      firstName: student.firstName,
      lastName: student.lastName,
      rollNumber: student.rollNumber,
      status: student.status,
      notes: student.notes || '',
    });
  };

  const handleSaveEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    dbService.updateStudent({
      ...editingStudent,
      firstName: studentForm.firstName.trim(),
      lastName: studentForm.lastName.trim(),
      rollNumber: Number(studentForm.rollNumber) || 1,
      status: studentForm.status,
      notes: studentForm.notes?.trim(),
    });
    onDataChanged();
    setEditingStudent(null);
  };

  const handleToggleStudentStatus = (student: Student) => {
    const nextStatus: StudentStatus = student.status === 'Active' ? 'Inactive' : 'Active';
    dbService.updateStudentStatus(student.id, nextStatus);
    onDataChanged();
  };

  const handleOpenMoveStudent = (student: Student) => {
    setMovingStudent(student);
    const otherGroups = groups.filter(g => g.id !== student.groupId);
    if (otherGroups.length > 0) {
      setTargetMoveGroupId(otherGroups[0].id);
    }
  };

  const handleConfirmMoveStudent = () => {
    if (!movingStudent || !targetMoveGroupId) return;
    dbService.moveStudentToGroup(movingStudent.id, targetMoveGroupId);
    onDataChanged();
    setMovingStudent(null);
  };

  const handleDeleteStudent = (studentId: string) => {
    if (window.confirm('¿Desea eliminar permanentemente a este alumno y todas sus calificaciones/asistencias?')) {
      dbService.deleteStudent(studentId);
      onDataChanged();
    }
  };

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
    </div>
  );
};
