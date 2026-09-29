import React, { useState } from 'react';
import { Group, Student, StudentStatus } from '../../../shared/types';
import { schoolData } from '../../../application/schoolData';
import { buildGroupRecommendations } from '../model/buildGroupRecommendations';

export interface GroupsStudentsScreenProps {
  groups: Group[];
  students: Student[];
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string) => void;
  onDataChanged: () => void;
}

export function useGroupsStudentsController({
  groups,
  students,
  selectedGroupId,
  onSelectGroup,
  onDataChanged,
}: GroupsStudentsScreenProps) {
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

  const groupRecommendations = React.useMemo(
    () => buildGroupRecommendations(activeGroup, students),
    [activeGroup, students],
  );

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
    const newGrp = schoolData.addGroup(groupForm);
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
    schoolData.updateGroup({
      ...activeGroup,
      ...groupForm,
    });
    setIsSaving(false);
    onDataChanged();
    setIsEditGroupModalOpen(false);
  };

  const handleDeleteGroup = (groupId: string) => {
    schoolData.deleteGroup(groupId);
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

    schoolData.addStudent({
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
        schoolData.addStudent({
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
    schoolData.updateStudent({
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
    schoolData.updateStudentStatus(student.id, nextStatus);
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
    schoolData.moveStudentToGroup(movingStudent.id, targetMoveGroupId);
    onDataChanged();
    setMovingStudent(null);
  };

  const handleDeleteStudent = (studentId: string) => {
    if (window.confirm('¿Desea eliminar permanentemente a este alumno y todas sus calificaciones/asistencias?')) {
      schoolData.deleteStudent(studentId);
      onDataChanged();
    }
  };
  return {
    activeGroup,
    searchQuery,
    setSearchQuery,
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
    studentViewMode,
    setStudentViewMode,
    groupViewMode,
    setGroupViewMode,
    groupForm,
    setGroupForm,
    studentForm,
    setStudentForm,
    targetMoveGroupId,
    setTargetMoveGroupId,
    sortBy,
    setSortBy,
    groupStudents,
    groupRecommendations,
    handleOpenNewGroup,
    handleSaveNewGroup,
    handleOpenEditGroup,
    handleSaveEditGroup,
    handleDeleteGroup,
    handleOpenNewStudent,
    handleSaveNewStudent,
    handleOpenImportModal,
    handleExecuteImport,
    handleOpenEditStudent,
    handleSaveEditStudent,
    handleToggleStudentStatus,
    handleOpenMoveStudent,
    handleConfirmMoveStudent,
    handleDeleteStudent,
  };
}
