import React from 'react';
import { Users, ChevronRight } from 'lucide-react';

/**
 * ClassesSidebar - Sidebar component for class list
 */
export default function ClassesSidebar({ 
  classes, 
  selectedClass, 
  onSelectClass 
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <h3 className="font-semibold text-gray-900">Danh sách lớp</h3>
        <p className="text-sm text-gray-600">{classes.length} lớp phụ trách</p>
      </div>
      <div className="divide-y divide-gray-200">
        {classes.map((cls) => (
          <button
            key={cls.id}
            onClick={() => onSelectClass(cls)}
            className={`w-full p-4 text-left transition-colors ${
              selectedClass?.id === cls.id
                ? 'bg-indigo-50 border-l-4 border-indigo-600'
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{cls.ten_lop}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{cls.so_sinh_vien || 0} sinh viên</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

