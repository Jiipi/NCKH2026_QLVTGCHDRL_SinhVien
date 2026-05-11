/**
 * StudentList Component
 * =====================
 * Tier 1 - UI Component (SOLID: Single Responsibility)
 * 
 * Container component for displaying students in grid or list view
 * 
 * @module features/teacher/ui/components/students/StudentList
 */

import React from 'react';
import { Users, Grid3X3, List, Plus, UserX } from 'lucide-react';
import StudentCard from './StudentCard';
import StudentListItem from './StudentListItem';
import Pagination from '../../../../../shared/components/common/Pagination';

/**
 * StudentList - Students list container with view mode toggle
 * @param {Object} props
 * @param {Array} props.students - List of students to display
 * @param {Array} props.selectedStudents - List of selected student IDs
 * @param {string} props.viewMode - 'grid' or 'list'
 * @param {Function} props.onViewModeChange - View mode toggle handler
 * @param {Function} props.onSelectStudent - Student selection handler
 * @param {Function} props.onSelectAll - Select all handler
 * @param {Function} props.onViewStudent - View student details handler
 * @param {Function} props.onEditStudent - Edit student handler
 * @param {Function} props.onDeleteStudent - Delete student handler
 * @param {Function} props.onAddStudent - Add student handler
 * @param {Object} props.pagination - Pagination state
 * @param {number} props.displayFrom - Display from index
 * @param {number} props.displayTo - Display to index
 * @param {Function} props.onPageChange - Page change handler
 * @param {Function} props.onLimitChange - Limit change handler
 * @param {string} props.searchTerm - Current search term for empty state
 */
export function StudentList({
  students = [],
  selectedStudents = [],
  viewMode = 'list',
  onViewModeChange,
  onSelectStudent,
  onSelectAll,
  onViewStudent,
  onEditStudent,
  onDeleteStudent,
  onAddStudent,
  pagination,
  displayFrom = 0,
  displayTo = 0,
  onPageChange,
  onLimitChange,
  searchTerm = ''
}) {
  const allSelected = students.length > 0 && 
    students.every(s => selectedStudents.includes(s.id));

  return (
    <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/70 border border-white/60 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-black/30">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/50 dark:border-white/10 bg-gradient-to-r from-white/50 to-indigo-500/10 dark:from-white/5 dark:to-indigo-400/10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Danh sách sinh viên
          </h3>
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white/50 dark:bg-white/10 rounded-xl p-1 border border-white/60 dark:border-white/10 backdrop-blur-sm">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-white/90 dark:bg-white/15 shadow-md text-indigo-600 dark:text-indigo-300'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Xem dạng lưới"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-white/90 dark:bg-white/15 shadow-md text-indigo-600 dark:text-indigo-300'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Xem dạng danh sách"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            {/* Select All */}
            {students.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => onSelectAll(students)}
                  className="w-4 h-4 text-indigo-600 border-2 border-white/60 dark:border-white/10 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Chọn tất cả</span>
              </label>
            )}
          </div>
        </div>
      </div>
      
      {/* Content */}
      {students.length > 0 ? (
        viewMode === 'grid' ? (
          /* Grid View */
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {students.map(student => (
              <StudentCard
                key={student.id}
                student={student}
                isSelected={selectedStudents.includes(student.id)}
                onSelect={onSelectStudent}
                onView={onViewStudent}
                onEdit={onEditStudent}
                onDelete={onDeleteStudent}
              />
            ))}
          </div>
        ) : (
          /* List View */
          <div className="divide-y divide-white/50 dark:divide-white/10">
            {students.map(student => (
              <StudentListItem
                key={student.id}
                student={student}
                isSelected={selectedStudents.includes(student.id)}
                onSelect={onSelectStudent}
                onView={onViewStudent}
                onEdit={onEditStudent}
                onDelete={onDeleteStudent}
              />
            ))}
          </div>
        )
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/50 dark:bg-white/10 rounded-full mb-4 backdrop-blur-sm">
            <UserX className="w-10 h-10 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-500 dark:text-slate-300 mb-2">Không có sinh viên nào</h3>
          <p className="text-slate-400 dark:text-slate-500 mb-6">
            {searchTerm 
              ? 'Không tìm thấy sinh viên phù hợp với bộ lọc' 
              : 'Chưa có sinh viên nào trong lớp này'
            }
          </p>
          <button
            onClick={onAddStudent}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Thêm sinh viên mới
          </button>
        </div>
      )}
      
      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="bg-gradient-to-r from-white/50 to-indigo-500/10 dark:from-white/5 dark:to-indigo-400/10 border-t border-white/50 dark:border-white/10">
          <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">
              Hiển thị <span className="font-bold text-indigo-600">{displayFrom} - {displayTo}</span> của <span className="font-bold">{pagination.total}</span> sinh viên
            </div>
            <Pagination
              pagination={pagination}
              onPageChange={onPageChange}
              onLimitChange={onLimitChange}
              itemLabel="sinh viên"
              showLimitSelector
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentList;
