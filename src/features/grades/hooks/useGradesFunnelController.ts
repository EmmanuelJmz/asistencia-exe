import React, { useEffect, useState } from 'react';
import {
  Activity,
  ActivityType,
  Grade,
  Group,
  Period,
  Student,
  Subject,
} from '../../../shared/types';
import { schoolData } from '../../../application/schoolData';

export interface GradesFunnelScreenProps {
  groups: Group[];
  students: Student[];
  subjects: Subject[];
  periods: Period[];
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string | null) => void;
  onDataChanged: () => void;
}

export function useGradesFunnelController({
  groups,
  students,
  selectedGroupId,
  onSelectGroup,
  onDataChanged,
}: GradesFunnelScreenProps) {
  // Current active group (if null, user sees the Groups Dashboard)
  const activeGroup = groups.find(g => g.id === selectedGroupId) || null;

  // View state within the group: 'activities' (Classroom stream) or 'matrix' (Sábana de notas)
  const [currentTab, setCurrentTab] = useState<'activities' | 'matrix'>('activities');

  // If set, teacher is actively grading this activity
  const [gradingActivityId, setGradingActivityId] = useState<string | null>(null);

  // Filter activities by type
  const [filterType, setFilterType] = useState<string>('Todas');

  // Modal for creating or editing activity
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [modalForm, setModalForm] = useState<{
    title: string;
    type: ActivityType;
    dueDate: string;
    maxScore: number;
    description: string;
  }>({
    title: '',
    type: 'Tarea',
    dueDate: new Date().toISOString().split('T')[0],
    maxScore: 10,
    description: '',
  });

  // Grading scores map: studentId -> { score: string, observation: string }
  const [scoresMap, setScoresMap] = useState<Record<string, { score: string; observation: string }>>({});
  const [isSavedBanner, setIsSavedBanner] = useState(false);

  // Active students in selected group
  const activeStudents = activeGroup
    ? students
        .filter(s => s.groupId === activeGroup.id && s.status === 'Active')
        .sort((a, b) => (a.lastName || '').localeCompare(b.lastName || '', 'es') || (a.firstName || '').localeCompare(b.firstName || '', 'es') || a.rollNumber - b.rollNumber)
    : [];

  // Activities for this group
  const groupActivities = activeGroup
    ? schoolData.getActivities(activeGroup.id)
    : [];

  // Filtered activities
  const filteredActivities = filterType === 'Todas'
    ? groupActivities
    : groupActivities.filter(a => a.type === filterType);

  // Active activity being graded
  const activeActivity = gradingActivityId
    ? schoolData.getActivityById(gradingActivityId) || null
    : null;

  // Load scores when grading an activity
  useEffect(() => {
    if (activeActivity && activeGroup) {
      const existingGrades = schoolData.getActivityGrades(activeActivity.id);
      const newMap: Record<string, { score: string; observation: string }> = {};

      activeStudents.forEach(stu => {
        const found = existingGrades.find(g => g.studentId === stu.id);
        newMap[stu.id] = {
          score: found ? String(found.score) : '10.0',
          observation: found ? found.observation || '' : '',
        };
      });
      setScoresMap(newMap);
    }
  }, [gradingActivityId, activeStudents.length]);

  // Open modal to create new activity
  const handleOpenNewModal = () => {
    setEditingActivity(null);
    setModalForm({
      title: '',
      type: 'Tarea',
      dueDate: new Date().toISOString().split('T')[0],
      maxScore: 10,
      description: '',
    });
    setIsModalOpen(true);
  };

  // Open modal to edit existing activity
  const handleOpenEditModal = (act: Activity) => {
    setEditingActivity(act);
    setModalForm({
      title: act.title,
      type: act.type,
      dueDate: act.dueDate,
      maxScore: act.maxScore || 10,
      description: act.description || '',
    });
    setIsModalOpen(true);
  };

  // Save activity (create or update)
  const handleSaveActivityModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup || !modalForm.title.trim()) return;

    if (editingActivity) {
      schoolData.updateActivity(editingActivity.id, {
        title: modalForm.title.trim(),
        type: modalForm.type,
        dueDate: modalForm.dueDate,
        maxScore: modalForm.maxScore,
        description: modalForm.description.trim(),
      });
    } else {
      schoolData.createActivity({
        groupId: activeGroup.id,
        title: modalForm.title.trim(),
        type: modalForm.type,
        dueDate: modalForm.dueDate,
        maxScore: modalForm.maxScore,
        description: modalForm.description.trim(),
      });
    }

    setIsModalOpen(false);
    onDataChanged();
  };

  // Delete activity
  const handleDeleteActivity = (actId: string, title: string) => {
    if (window.confirm(`¿Está seguro de eliminar la actividad "${title}" y todas sus calificaciones asociadas?`)) {
      schoolData.deleteActivity(actId);
      if (gradingActivityId === actId) {
        setGradingActivityId(null);
      }
      onDataChanged();
    }
  };

  // Update a single student's score
  const handleScoreChange = (studentId: string, val: string) => {
    setScoresMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        score: val,
      },
    }));
  };

  // Update a single student's observation
  const handleObservationChange = (studentId: string, val: string) => {
    setScoresMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        observation: val,
      },
    }));
  };

  // Quick fill all students with a score preset
  const handleFillAllWith = (scoreVal: string) => {
    const nextMap: Record<string, { score: string; observation: string }> = {};
    activeStudents.forEach(stu => {
      nextMap[stu.id] = {
        score: scoreVal,
        observation: scoresMap[stu.id]?.observation || '',
      };
    });
    setScoresMap(nextMap);
  };

  // Save all grades for the current activity
  const handleSaveAllGrades = () => {
    if (!activeGroup || !activeActivity) return;

    const gradesPayload = activeStudents.map(stu => {
      const raw = scoresMap[stu.id]?.score || '0';
      const num = parseFloat(raw);
      const maxScore = Math.max(1, Number(activeActivity.maxScore) || 10);
      const safe = isNaN(num) ? 0 : Math.max(0, Math.min(maxScore, num));
      return {
        studentId: stu.id,
        score: safe,
        observation: scoresMap[stu.id]?.observation || '',
      };
    });

    schoolData.saveActivityGrades(activeActivity.id, activeGroup.id, gradesPayload);
    setIsSavedBanner(true);
    onDataChanged();
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // Calculate metrics for the active activity being graded
  const parsedScores = activeStudents.map(stu => {
    const raw = scoresMap[stu.id]?.score;
    const num = parseFloat(raw || '0');
    return isNaN(num) ? 0 : num;
  });

  const average = parsedScores.length > 0
    ? (parsedScores.reduce((a, b) => a + b, 0) / parsedScores.length).toFixed(1)
    : '0.0';

  const approvedCount = parsedScores.filter(s => s >= 6.0).length;
  const failingCount = parsedScores.filter(s => s < 6.0).length;
  const highest = parsedScores.length > 0 ? Math.max(...parsedScores).toFixed(1) : '0.0';
  const lowest = parsedScores.length > 0 ? Math.min(...parsedScores).toFixed(1) : '0.0';

  // Helper badge color for activity types
  const getTypeColor = (_type: ActivityType) => {
    return 'bg-slate-100 text-slate-700 border-slate-300 font-medium';
  };
  return {
    activeGroup,
    currentTab,
    setCurrentTab,
    gradingActivityId,
    setGradingActivityId,
    filterType,
    setFilterType,
    isModalOpen,
    setIsModalOpen,
    editingActivity,
    setEditingActivity,
    modalForm,
    setModalForm,
    scoresMap,
    setScoresMap,
    isSavedBanner,
    activeStudents,
    groupActivities,
    filteredActivities,
    activeActivity,
    handleOpenNewModal,
    handleOpenEditModal,
    handleSaveActivityModal,
    handleDeleteActivity,
    handleScoreChange,
    handleObservationChange,
    handleFillAllWith,
    handleSaveAllGrades,
    parsedScores,
    average,
    approvedCount,
    failingCount,
    highest,
    lowest,
    getTypeColor,
  };
}
