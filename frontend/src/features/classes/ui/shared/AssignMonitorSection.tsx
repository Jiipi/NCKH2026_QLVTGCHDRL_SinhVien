import React from 'react';
import { UserCheck } from 'lucide-react';

/**
 * AssignMonitorSection - Section for assigning class monitor
 */
export default function AssignMonitorSection({ 
  students, 
  selectedMonitorId, 
  onMonitorChange, 
  onAssign, 
  assigning 
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <UserCheck className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">Gán lớp trưởng</h3>
      </div>
      <div className="flex gap-3">
        <select
          value={selectedMonitorId}
          onChange={(e) => onMonitorChange(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">Chọn sinh viên làm lớp trưởng</option>
          {students.map((student) => (
            <option key={student.sinh_vien?.id} value={student.sinh_vien?.id}>
              {student.ho_ten} - {student.sinh_vien?.mssv}
            </option>
          ))}
        </select>
        <button
          onClick={onAssign}
          disabled={assigning}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {assigning ? 'Đang xử lý...' : 'Gán lớp trưởng'}
        </button>
      </div>
    </div>
  );
}

