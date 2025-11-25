import React from 'react';

/**
 * TopStudentItem Component - Item trong danh sách top sinh viên
 */
export default function TopStudentItem({ student, index }) {
  const getScoreGrade = (points) => {
    if (points >= 90) return { label: 'Xuất sắc', color: 'from-green-500 to-emerald-600', bg: 'bg-green-50', text: 'text-green-700' };
    if (points >= 80) return { label: 'Tốt', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700' };
    if (points >= 65) return { label: 'Khá', color: 'from-yellow-500 to-yellow-600', bg: 'bg-yellow-50', text: 'text-yellow-700' };
    if (points >= 50) return { label: 'Trung bình', color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50', text: 'text-orange-700' };
    return { label: 'Yếu', color: 'from-red-500 to-red-600', bg: 'bg-red-50', text: 'text-red-700' };
  };

  const grade = getScoreGrade(student.points);

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-300">
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md ${
        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' : 
        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' : 
        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' : 
        'bg-gray-200 text-gray-600'
      }`}>
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{student.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-gray-500">{student.mssv}</p>
          <span className="text-gray-300">•</span>
          <p className="text-xs text-gray-500">{student.activitiesCount} hoạt động</p>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${grade.bg} ${grade.text}`}>
            {grade.label}
          </span>
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className={`font-bold text-lg bg-gradient-to-r ${grade.color} bg-clip-text text-transparent`}>
          {student.points}
        </p>
        <p className="text-xs text-gray-500 font-medium">điểm RL</p>
      </div>
    </div>
  );
}

