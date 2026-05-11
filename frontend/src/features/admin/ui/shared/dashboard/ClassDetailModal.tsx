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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/60 bg-white/90 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/90">
        <div className="border-b border-white/60 bg-white/55 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-50/80 p-3 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">{selectedClass.name || selectedClass.ten_lop || 'Lớp'}</h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-300">Chi tiết lớp học</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-2xl border border-white/60 bg-white/45 p-2 text-slate-500 transition-colors hover:bg-white/75 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-indigo-200/70 bg-indigo-50/70 p-4 dark:border-indigo-400/20 dark:bg-indigo-400/10">
                <p className="text-sm text-gray-600 mb-1">Mã lớp</p>
                <p className="text-lg font-bold text-gray-900">{selectedClass.id || selectedClass.ma_lop || '—'}</p>
              </div>
              <div className="rounded-2xl border border-indigo-200/70 bg-indigo-50/70 p-4 dark:border-indigo-400/20 dark:bg-indigo-400/10">
                <p className="text-sm text-gray-600 mb-1">Số sinh viên</p>
                <p className="text-lg font-bold text-gray-900">
                  {selectedClass.studentCount || selectedClass._count?.students || classStudents.length || 0}
                </p>
              </div>
            </div>
            {selectedClass.teacher && (
              <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/70 p-4 dark:border-emerald-400/20 dark:bg-emerald-400/10">
                <p className="text-sm text-gray-600 mb-1">Giảng viên chủ nhiệm</p>
                <p className="text-lg font-bold text-gray-900">
                  {selectedClass.teacher.name || selectedClass.teacher.full_name || selectedClass.teacher.ho_ten || '—'}
                </p>
              </div>
            )}
            {selectedClass.description && (
              <div className="rounded-2xl border border-white/60 bg-white/45 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm text-gray-600 mb-1">Mô tả</p>
                <p className="text-gray-900">{selectedClass.description}</p>
              </div>
            )}
            <div className="rounded-2xl border border-white/60 bg-white/45 p-4 dark:border-white/10 dark:bg-white/5">
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
                        className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/55 p-3 dark:border-white/10 dark:bg-white/5"
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
        <div className="flex justify-end border-t border-white/60 bg-white/45 p-4 dark:border-white/10 dark:bg-white/5">
          <button
            onClick={onClose}
            className="rounded-2xl border border-white/60 bg-white/70 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

