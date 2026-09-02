import React, { useState } from 'react';
import { Users, Search, UserPlus, Edit3, Trash2 } from 'lucide-react';
import { Student } from '../types';
import { dbService } from '../db/databaseService';

interface GlobalStudentsScreenProps {
  students: Student[];
  onDataChanged: () => void;
}

export const GlobalStudentsScreen: React.FC<GlobalStudentsScreenProps> = ({
  students,
  onDataChanged,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [studentForm, setStudentForm] = useState({
    firstName: '',
    lastName: '',
    status: 'Active' as const,
    notes: '',
  });

  const GLOBAL_POOL_ID = 'grp-global-pool';
  const globalStudents = students.filter(s => s.groupId === GLOBAL_POOL_ID);

  const filteredStudents = searchQuery
    ? globalStudents.filter(s => 
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : globalStudents;

  const handleOpenNewStudent = () => {
    setEditingStudent(null);
    setStudentForm({ firstName: '', lastName: '', status: 'Active', notes: '' });
    setIsNewStudentModalOpen(true);
  };

  const handleSaveNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.firstName.trim() || !studentForm.lastName.trim()) return;
    
    dbService.addStudent({
      groupId: GLOBAL_POOL_ID,
      firstName: studentForm.firstName.trim(),
      lastName: studentForm.lastName.trim(),
      rollNumber: globalStudents.length + 1,
      status: studentForm.status,
      notes: studentForm.notes?.trim(),
    });
    
    onDataChanged();
    setIsNewStudentModalOpen(false);
  };

  const handleOpenEditStudent = (student: Student) => {
    setEditingStudent(student);
    setStudentForm({
      firstName: student.firstName,
      lastName: student.lastName,
      status: student.status,
      notes: student.notes || '',
    });
    setIsNewStudentModalOpen(true);
  };

  const handleSaveEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !studentForm.firstName.trim() || !studentForm.lastName.trim()) return;
    
    dbService.updateStudent({
      ...editingStudent,
      firstName: studentForm.firstName.trim(),
      lastName: studentForm.lastName.trim(),
      status: studentForm.status,
      notes: studentForm.notes?.trim(),
    });
    
    onDataChanged();
    setIsNewStudentModalOpen(false);
    setEditingStudent(null);
  };

  const handleDeleteStudent = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar a este alumno del directorio global?')) {
      dbService.deleteStudent(id);
      onDataChanged();
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="bg-white border border-slate-300 rounded shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Directorio Global de Alumnos
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-lg">
            Agregue alumnos aquí para tenerlos disponibles en todo el sistema. Luego podrá importarlos directamente a cualquiera de sus grupos escolares desde la pestaña "Alumnos y Grupos".
          </p>
        </div>
        <button
          onClick={handleOpenNewStudent}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Nuevo Alumno Global
        </button>
      </div>

      <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar alumno global por nombre o apellido..."
              className="w-full pl-9 pr-3 py-2 rounded bg-white border border-slate-300 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 shadow-inner"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-xs uppercase tracking-wider font-bold border-b border-slate-300">
                <th className="py-2.5 px-4 w-12 text-center">N°</th>
                <th className="py-2.5 px-4">Apellidos</th>
                <th className="py-2.5 px-4">Nombres</th>
                <th className="py-2.5 px-4">Estatus</th>
                <th className="py-2.5 px-4 hidden md:table-cell">Notas / Tutor</th>
                <th className="py-2.5 px-4 text-center w-24">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="w-8 h-8 text-slate-300" />
                      <p>No hay alumnos en el directorio global.</p>
                      <button onClick={handleOpenNewStudent} className="text-indigo-600 font-bold hover:underline">
                        Agregar el primero
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-4 text-center text-slate-500 font-mono font-bold text-xs">{index + 1}</td>
                    <td className="py-2 px-4 font-semibold text-slate-900">{student.lastName}</td>
                    <td className="py-2 px-4 text-slate-800">{student.firstName}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        student.status === 'Active' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.status === 'Active' ? 'Activo' : 'Baja'}
                      </span>
                    </td>
                    <td className="py-2 px-4 hidden md:table-cell text-xs text-slate-500 truncate max-w-[200px]">
                      {student.notes || '-'}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditStudent(student)}
                          className="p-1.5 rounded text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Editar Alumno"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="p-1.5 rounded text-red-600 hover:bg-red-50 transition-colors"
                          title="Eliminar Alumno"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isNewStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-400 rounded shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between font-bold">
              <span>{editingStudent ? 'Editar Alumno Global' : 'Nuevo Alumno Global'}</span>
              <button onClick={() => setIsNewStudentModalOpen(false)} className="text-slate-300 hover:text-white">✕</button>
            </div>
            <form onSubmit={editingStudent ? handleSaveEditStudent : handleSaveNewStudent} className="p-4 space-y-4 bg-slate-50">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1 text-sm">Nombres:</label>
                  <input
                    type="text"
                    required
                    value={studentForm.firstName}
                    onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-white border border-slate-300 focus:outline-none focus:border-indigo-600 shadow-inner"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1 text-sm">Apellidos:</label>
                  <input
                    type="text"
                    required
                    value={studentForm.lastName}
                    onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-white border border-slate-300 focus:outline-none focus:border-indigo-600 shadow-inner"
                  />
                </div>
              </div>
              
              <div>
                <label className="font-semibold text-slate-700 block mb-1 text-sm">Estatus Académico:</label>
                <select
                  value={studentForm.status}
                  onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded bg-white border border-slate-300 focus:outline-none focus:border-indigo-600 shadow-inner"
                >
                  <option value="Active">Activo</option>
                  <option value="Inactive">Baja Temporal / Inactivo</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1 text-sm">Notas / Tutor:</label>
                <textarea
                  rows={2}
                  value={studentForm.notes}
                  onChange={(e) => setStudentForm({ ...studentForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-white border border-slate-300 focus:outline-none focus:border-indigo-600 shadow-inner"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewStudentModalOpen(false)}
                  className="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md"
                >
                  {editingStudent ? 'Guardar Cambios' : 'Guardar Alumno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
