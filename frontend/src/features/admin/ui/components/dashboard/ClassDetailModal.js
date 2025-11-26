import React from 'react';
import { GraduationCap, X, Users } from 'lucide-react';

export default function ClassDetailModal({
  isOpen,
  selectedClass,
  classStudents,
  loadingClassDetail,
  classDetailError,
  onClose
}) {
  if (!isOpen || !selectedClass) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">{selectedClass.name || selectedClass.ten_lop || 'Lớp'}</h2>
                <p className="text-blue-100 text-sm">Chi tiết lớp học</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Mã lớp</p>
                <p className="text-lg font-bold text-gray-900">{selectedClass.id || selectedClass.ma_lop || '—'}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Số sinh viên</p>
                <p className="text-lg font-bold text-gray-900">
                  {selectedClass.studentCount || selectedClass._count?.students || classStudents.length || 0}
                </p>
              </div>
            </div>
            {selectedClass.teacher && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-1">Giảng viên chủ nhiệm</p>
                <p className="text-lg font-bold text-gray-900">
                  {selectedClass.teacher.name || selectedClass.teacher.full_name || selectedClass.teacher.ho_ten || '—'}
                </p>
              </div>
            )}
            {selectedClass.description && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Mô tả</p>
                <p className="text-gray-900">{selectedClass.description}</p>
              </div>
            )}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-900">
                  Danh sách sinh viên ({classStudents.length})
                </h3>
                {loadingClassDetail && (
                  <span className="text-xs text-gray-500">Đang tải...</span>
                )}
              </div>
              {classDetailError && (
                <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {classDetailError}
                </div>
              )}
              {loadingClassDetail ? (
                <div className="py-8 flex flex-col items-center justify-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-2"></div>
                  <p className="text-sm">Đang tải danh sách sinh viên...</p>
                </div>
              ) : classStudents.length === 0 ? (
                <div className="py-6 text-center text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Chưa có dữ liệu sinh viên cho lớp này</p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#3b82f6 #f3f4f6' }}>
                  {classStudents.map((student, index) => {
                    const studentName = student.ho_ten || student.fullName || student.full_name || student.name || student.ten_sv || 'Sinh viên';
                    const studentCode = student.ma_sv || student.mssv || student.studentCode || student.code || student.username || student.email;
                    return (
                      <div
                        key={student.id || student.user_id || student.ma_sv || index}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                          {(studentName || 'SV').split(' ').pop()?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{studentName}</p>
                          <p className="text-xs text-gray-600 truncate">{studentCode || 'Chưa có mã'}</p>
                        </div>
                        {(student.trang_thai || student.status) && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                            {student.trang_thai || student.status}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

