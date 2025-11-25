/**
 * MonitorAssignment Component
 * ===========================
 * Tier 1 - UI Component (SOLID: Single Responsibility)
 * 
 * UI for assigning class monitor (lớp trưởng)
 * 
 * @module features/teacher/ui/components/students/MonitorAssignment
 */

import React from 'react';
import { UserCheck } from 'lucide-react';

/**
 * MonitorAssignment - Select and assign class monitor
 * @param {Object} props
 * @param {Array} props.students - List of students to select from
 * @param {string} props.selectedMonitorId - Currently selected student ID
 * @param {Function} props.onMonitorChange - Callback when selection changes
 * @param {Function} props.onAssign - Callback when assign button clicked
 * @param {boolean} props.isAssigning - Loading state
 */
export function MonitorAssignment({ 
  students = [], 
  selectedMonitorId = '',
  onMonitorChange,
  onAssign,
  isAssigning = false
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
          <UserCheck className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Gán lớp trưởng</h3>
      </div>
      <div className="flex gap-3">
        <select
          value={selectedMonitorId}
          onChange={(e) => onMonitorChange(e.target.value)}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium transition-all"
        >
          <option value="">Chọn sinh viên làm lớp trưởng</option>
          {students.map((student) => (
            <option 
              key={student.sinh_vien?.id || student.id} 
              value={student.sinh_vien?.id}
            >
              {student.ho_ten} - {student.sinh_vien?.mssv}
            </option>
          ))}
        </select>
        <button
          onClick={onAssign}
          disabled={isAssigning}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg hover:shadow-xl"
        >
          {isAssigning ? 'Đang xử lý...' : 'Gán lớp trưởng'}
        </button>
      </div>
    </div>
  );
}

export default MonitorAssignment;
