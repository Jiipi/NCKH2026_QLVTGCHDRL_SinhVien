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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[80vh] overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">{selectedTeacher.ho_ten || selectedTeacher.fullName || selectedTeacher.name || 'Giảng viên'}</h2>
                <p className="text-indigo-100 text-sm">Thông tin giảng viên</p>
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
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)] space-y-4">
          {teacherDetailError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              {teacherDetailError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="text-base font-semibold text-gray-900 break-words">
                {selectedTeacher.email || selectedTeacher.nguoi_dung?.email || '—'}
              </p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <p className="text-sm text-gray-600 mb-1">Tên đăng nhập</p>
              <p className="text-base font-semibold text-gray-900">
                {selectedTeacher.ten_dn || selectedTeacher.username || selectedTeacher.account || '—'}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600 mb-1">Vai trò</p>
              <p className="text-base font-semibold text-gray-900">
                {(selectedTeacher.vai_tro?.ten_vt) || selectedTeacher.role || 'Giảng viên'}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                {(selectedTeacher.trang_thai || 'Hoạt động').replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Số điện thoại</p>
            <p className="text-base font-semibold text-gray-900">
              {selectedTeacher.sdt || selectedTeacher.phone || 'Chưa cập nhật'}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
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

