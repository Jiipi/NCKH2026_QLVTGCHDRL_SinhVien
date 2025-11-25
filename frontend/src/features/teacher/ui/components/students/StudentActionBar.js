/**
 * StudentActionBar Component
 * ==========================
 * Tier 1 - UI Component (SOLID: Single Responsibility)
 * 
 * Search, filter and action buttons for student list
 * 
 * @module features/teacher/ui/components/students/StudentActionBar
 */

import React from 'react';
import { Search, Plus, Upload, Download } from 'lucide-react';

/**
 * StudentActionBar - Search and actions toolbar
 * @param {Object} props
 * @param {string} props.searchTerm - Current search term
 * @param {Function} props.onSearchChange - Search input handler
 * @param {Array} props.classes - List of classes for filter
 * @param {string|null} props.selectedClass - Selected class ID
 * @param {Function} props.onClassChange - Class filter handler
 * @param {Function} props.onAddStudent - Add student handler
 * @param {Function} props.onImport - Import handler
 * @param {Function} props.onExport - Export handler
 */
export function StudentActionBar({
  searchTerm = '',
  onSearchChange,
  classes = [],
  selectedClass,
  onClassChange,
  onAddStudent,
  onImport,
  onExport
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-md">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm sinh viên theo tên, MSSV, email..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium transition-all"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedClass || ''}
            onChange={(e) => onClassChange(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
          >
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.ten_lop}</option>
            ))}
          </select>
          <button 
            onClick={onAddStudent}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Thêm sinh viên
          </button>
          <button 
            onClick={onImport}
            className="flex items-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
          >
            <Upload className="w-5 h-5" />
            Import
          </button>
          <button 
            onClick={() => onExport('xlsx')}
            className="flex items-center gap-2 px-4 py-3 border border-green-500 text-green-600 rounded-xl hover:bg-green-50 transition-all font-medium"
            title="Xuất Excel"
          >
            <Download className="w-5 h-5" />
            Xuất Excel
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentActionBar;
