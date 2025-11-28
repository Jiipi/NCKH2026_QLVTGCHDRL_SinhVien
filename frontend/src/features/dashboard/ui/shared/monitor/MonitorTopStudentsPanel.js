import React from 'react';
import { Trophy } from 'lucide-react';

const getScoreGrade = (points) => {
  if (points >= 90) return { label: 'Xuất sắc', color: 'from-green-500 to-emerald-600', bg: 'bg-green-50', text: 'text-green-700' };
  if (points >= 80) return { label: 'Tốt', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700' };
  if (points >= 65) return { label: 'Khá', color: 'from-yellow-500 to-yellow-600', bg: 'bg-yellow-50', text: 'text-yellow-700' };
  if (points >= 50) return { label: 'Trung bình', color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50', text: 'text-orange-700' };
  return { label: 'Yếu', color: 'from-red-500 to-red-600', bg: 'bg-red-50', text: 'text-red-700' };
};

export default function MonitorTopStudentsPanel({ topStudents }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="bg-purple-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 font-bold text-sm">
          <Trophy className="w-5 h-5" />
          Danh Sách Sinh Viên
        </div>
        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">
          {topStudents?.length || 0} SV
        </span>
      </div>

      <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#a855f7 #f3f4f6' }}>
        {topStudents && topStudents.length > 0 ? (
          topStudents.map((student, index) => {
            const grade = getScoreGrade(student.points);

            return (
              <div
                key={student.id}
                className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-300"
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md ${
                    index === 0
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
                      : index === 1
                      ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'
                      : index === 2
                      ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{student.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500">{student.mssv}</p>
                    <span className="text-gray-300">•</span>
                    <p className="text-xs text-gray-500">{student.activitiesCount} hoạt động</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${grade.bg} ${grade.text}`}>{grade.label}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className={`font-bold text-lg bg-gradient-to-r ${grade.color} bg-clip-text text-transparent`}>{student.points}</p>
                  <p className="text-xs text-gray-500 font-medium">điểm RL</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Chưa có dữ liệu</p>
          </div>
        )}
      </div>
    </div>
  );
}

