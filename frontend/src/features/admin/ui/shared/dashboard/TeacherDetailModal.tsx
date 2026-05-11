import React from 'react';
import { Users, X } from 'lucide-react';

export default function TeacherDetailModal({
  isOpen,
  selectedTeacher,
  loadingTeacherDetail,
  teacherDetailError,
  onClose
}) {
  if (!isOpen || !selectedTeacher) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="max-h-[80vh] w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/60 bg-white/90 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/90">
        <div className="border-b border-white/60 bg-white/55 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-50/80 p-3 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">{selectedTeacher.ho_ten || selectedTeacher.fullName || selectedTeacher.name || 'Giảng viên'}</h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-300">Thông tin giảng viên</p>
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
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)] space-y-4">
          {teacherDetailError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              {teacherDetailError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-indigo-200/70 bg-indigo-50/70 p-4 dark:border-indigo-400/20 dark:bg-indigo-400/10">
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="text-base font-semibold text-gray-900 break-words">
                {selectedTeacher.email || selectedTeacher.nguoi_dung?.email || '—'}
              </p>
            </div>
            <div className="rounded-2xl border border-indigo-200/70 bg-indigo-50/70 p-4 dark:border-indigo-400/20 dark:bg-indigo-400/10">
              <p className="text-sm text-gray-600 mb-1">Tên đăng nhập</p>
              <p className="text-base font-semibold text-gray-900">
                {selectedTeacher.ten_dn || selectedTeacher.username || selectedTeacher.account || '—'}
              </p>
            </div>
            <div className="rounded-2xl border border-purple-200/70 bg-purple-50/70 p-4 dark:border-purple-400/20 dark:bg-purple-400/10">
              <p className="text-sm text-gray-600 mb-1">Vai trò</p>
              <p className="text-base font-semibold text-gray-900">
                {(selectedTeacher.vai_tro?.ten_vt) || selectedTeacher.role || 'Giảng viên'}
              </p>
            </div>
            <div className="rounded-2xl border border-purple-200/70 bg-purple-50/70 p-4 dark:border-purple-400/20 dark:bg-purple-400/10">
              <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                {(selectedTeacher.trang_thai || 'Hoạt động').replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/45 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-sm text-gray-600 mb-1">Số điện thoại</p>
            <p className="text-base font-semibold text-gray-900">
              {selectedTeacher.sdt || selectedTeacher.phone || 'Chưa cập nhật'}
            </p>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/45 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-gray-900">Thông tin khác</h3>
              {loadingTeacherDetail && (
                <span className="text-xs text-gray-500">Đang tải...</span>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Ngày tạo</span>
                <span className="text-gray-900 font-medium">
                  {selectedTeacher.ngay_tao 
                    ? new Date(selectedTeacher.ngay_tao).toLocaleDateString('vi-VN')
                    : (selectedTeacher.created_at ? new Date(selectedTeacher.created_at).toLocaleDateString('vi-VN') : '—')}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Cập nhật lần cuối</span>
                <span className="text-gray-900 font-medium">
                  {selectedTeacher.ngay_cap_nhat 
                    ? new Date(selectedTeacher.ngay_cap_nhat).toLocaleDateString('vi-VN')
                    : (selectedTeacher.updated_at ? new Date(selectedTeacher.updated_at).toLocaleDateString('vi-VN') : '—')}
                </span>
              </div>
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

