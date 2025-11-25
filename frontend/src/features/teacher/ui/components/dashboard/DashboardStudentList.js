import React from 'react';
import { Users, Award } from 'lucide-react';

export default function DashboardStudentList({ students = [] }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4" data-ref="dashboard-student-list">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-gray-900">Danh sách sinh viên</h3>
        </div>
        <span className="text-sm text-gray-500">{students.length} sinh viên</span>
      </div>
      <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
        {students.length > 0 ? (
          students
            .slice()
            .sort((a, b) => (Number(b.diem_rl) || 0) - (Number(a.diem_rl) || 0))
            .map((student) => (
              <div key={student.id} className="rounded-lg p-3 border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-start gap-2">
                  <Avatar name={student.ho_ten} avatar={student.avatar} />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">{student.ho_ten}</h4>
                    <div className="flex items-center gap-2 mb-1 text-xs text-gray-600">
                      <span className="font-mono">{student.mssv}</span>
                      <span className="text-gray-400">•</span>
                      <span>{student.lop || student.ten_lop}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-700">
                      <Award className="w-3 h-3 text-yellow-500" />
                      Điểm RL: <span className="font-semibold text-indigo-600">{student.diem_rl ?? '--'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-10 w-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Chưa có sinh viên</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Avatar({ name, avatar }) {
  const fallback = name?.split(' ').pop()?.charAt(0)?.toUpperCase() || '?';

  if (!avatar) {
    return (
      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 text-white font-bold text-sm">
        {fallback}
      </div>
    );
  }

  return (
    <img
      src={avatar}
      alt={name}
      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
      onError={(e) => {
        e.target.onerror = null;
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex';
      }}
    />
  );
}


