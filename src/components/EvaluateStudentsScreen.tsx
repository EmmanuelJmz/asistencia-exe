import React from 'react';
import { Group, Student, Activity, Grade } from '../types';

type EvaluateStudentsScreenProps = {
  groups: Group[];
  students: Student[];
  activities: Activity[];
  grades: Grade[];
  onNavigateBack: () => void;
};

export const EvaluateStudentsScreen: React.FC<EvaluateStudentsScreenProps> = ({ groups, students, activities, grades, onNavigateBack }) => {
  // Compute summary per group
  const groupSummaries = groups.map((group) => {
    const groupStudents = students.filter((s) => s.groupId === group.id);
    const groupActivities = activities.filter((a) => a.groupId === group.id);
    const totalActivities = groupActivities.length;
    const groupGrades = grades.filter((g) => g.groupId === group.id);
    const totalGrades = groupGrades.length;
    const avgScore = totalGrades > 0
      ? (groupGrades.reduce((sum, g) => sum + (g.score ?? 0), 0) / totalGrades).toFixed(2)
      : 'N/A';
    const pendingActivities = groupActivities.filter((a) => !a.isLocked).length; // placeholder logic
    return {
      group,
      totalStudents: groupStudents.length,
      totalActivities,
      pendingActivities,
      avgScore,
    };
  });

  return (
    <div className="p-4">
      <button
        onClick={onNavigateBack}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Volver
      </button>
      <h1 className="text-2xl font-bold mb-4">Evaluar Alumnos</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groupSummaries.map(({ group, totalStudents, totalActivities, pendingActivities, avgScore }) => (
          <div key={group.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">{group.name}</h2>
            <ul className="text-sm space-y-1">
              <li><span className="font-medium">Alumnos:</span> {totalStudents}</li>
              <li><span className="font-medium">Actividades:</span> {totalActivities}</li>
              <li><span className="font-medium">Pendientes:</span> {pendingActivities}</li>
              <li><span className="font-medium">Promedio:</span> {avgScore}</li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
