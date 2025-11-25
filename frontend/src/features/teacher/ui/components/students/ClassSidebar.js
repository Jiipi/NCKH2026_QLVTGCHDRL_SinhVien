/**
 * ClassSidebar Component
 * ======================
 * Tier 1 - UI Component (SOLID: Single Responsibility)
 * 
 * Displays list of classes with selection functionality
 * 
 * @module features/teacher/ui/components/students/ClassSidebar
 */

import React from 'react';
import { GraduationCap, Users, ChevronRight } from 'lucide-react';

/**
 * ClassSidebar - List of classes for selection
 * @param {Object} props
 * @param {Array} props.classes - List of classes
 * @param {string|null} props.selectedClass - Currently selected class ID
 * @param {Function} props.onSelectClass - Callback when class is selected
 */
export function ClassSidebar({ classes = [], selectedClass, onSelectClass }) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg">
      <div className="p-4 border-b-2 border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-500">
        <h3 className="font-bold text-white flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          Danh sách lớp
        </h3>
        <p className="text-sm text-white/80">{classes.length} lớp phụ trách</p>
      </div>
      <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
        {classes.map((cls) => (
          <button
            key={cls.id}
            onClick={() => onSelectClass(cls.id)}
            className={`w-full p-4 text-left transition-all duration-200 ${
              selectedClass === cls.id
                ? 'bg-indigo-50 border-l-4 border-indigo-600'
                : 'hover:bg-gray-50 hover:translate-x-1'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900">{cls.ten_lop}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {cls.so_sinh_vien || 0} sinh viên
                  </span>
                </div>
              </div>
              <ChevronRight 
                className={`w-5 h-5 transition-transform ${
                  selectedClass === cls.id 
                    ? 'text-indigo-600 rotate-90' 
                    : 'text-gray-400'
                }`} 
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ClassSidebar;
