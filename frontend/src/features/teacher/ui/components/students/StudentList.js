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
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Danh sách sinh viên
          </h3>
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-white shadow-md text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Xem dạng lưới"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-white shadow-md text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
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
                  className="w-4 h-4 text-indigo-600 border-2 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-600 font-medium">Chọn tất cả</span>
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
          <div className="divide-y divide-gray-200">
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <UserX className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-500 mb-2">Không có sinh viên nào</h3>
          <p className="text-gray-400 mb-6">
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
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-t-2 border-gray-200">
          <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-600 font-medium">
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
