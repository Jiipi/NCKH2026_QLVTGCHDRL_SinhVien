import React from 'react';

/**
 * StudentsList - List component for students
 */
export default function StudentsList({ 
  students, 
  selectedMonitorId 
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-900">Danh sách sinh viên</h3>
      </div>
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {students.length > 0 ? (
          students.map((student) => (
            <div key={student.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {student.ho_ten?.charAt(0) || 'S'}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{student.ho_ten || 'N/A'}</h4>
                  <p className="text-sm text-gray-600">MSSV: {student.sinh_vien?.mssv || 'N/A'}</p>
                </div>
                {student.sinh_vien?.id === selectedMonitorId && (
                  <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                    Lớp trưởng
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            Chưa có sinh viên trong lớp
          </div>
        )}
      </div>
    </div>
  );
}

