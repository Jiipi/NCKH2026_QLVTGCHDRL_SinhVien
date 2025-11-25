/**
 * StudentFormModal Component
 * ==========================
 * Tier 1 - UI Component (SOLID: Single Responsibility)
 * 
 * Modal for adding/editing student
 * 
 * @module features/teacher/ui/components/students/StudentFormModal
 */

import React from 'react';
import { X, Plus, Edit, Save } from 'lucide-react';

/**
 * StudentFormModal - Add/Edit student form
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal open state
 * @param {string} props.mode - 'add' or 'edit'
 * @param {Object} props.formData - Form data
 * @param {Function} props.onFormChange - Form change handler
 * @param {Array} props.classes - List of classes for dropdown
 * @param {Function} props.onSubmit - Submit handler
 * @param {Function} props.onClose - Close handler
 */
export function StudentFormModal({ 
  isOpen = false, 
  mode = 'add',
  formData = {},
  onFormChange,
  classes = [],
  onSubmit,
  onClose 
}) {
  if (!isOpen) return null;

  const isEdit = mode === 'edit';
  const gradientColors = isEdit 
    ? 'from-green-500 to-emerald-500' 
    : 'from-indigo-600 via-purple-600 to-pink-600';
  const focusRingColor = isEdit 
    ? 'focus:ring-green-500 focus:border-green-500' 
    : 'focus:ring-indigo-500 focus:border-indigo-500';

  const handleChange = (field, value) => {
    onFormChange({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r ${gradientColors}`}>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {isEdit ? <Edit className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            {isEdit ? 'Chỉnh sửa sinh viên' : 'Thêm sinh viên mới'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white p-2 hover:bg-white/20 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Form */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              {/* Họ và tên */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên *</label>
                <input
                  type="text"
                  value={formData.ho_ten || ''}
                  onChange={(e) => handleChange('ho_ten', e.target.value)}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl ${focusRingColor} font-medium transition-all`}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              
              {/* MSSV */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">MSSV *</label>
                <input
                  type="text"
                  value={formData.mssv || ''}
                  onChange={(e) => handleChange('mssv', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl font-medium transition-all ${
                    isEdit 
                      ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed' 
                      : `border-gray-300 ${focusRingColor}`
                  }`}
                  disabled={isEdit}
                  placeholder="SV001234"
                />
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border-2 border-gray-300 rounded-xl ${focusRingColor} font-medium transition-all`}
                  placeholder="example@email.com"
                />
              </div>
              
              {/* Tên đăng nhập - Only for add mode */}
              {!isEdit && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tên đăng nhập *</label>
                  <input
                    type="text"
                    value={formData.ten_dn || ''}
                    onChange={(e) => handleChange('ten_dn', e.target.value)}
                    className={`w-full px-4 py-3 border-2 border-gray-300 rounded-xl ${focusRingColor} font-medium transition-all`}
                    placeholder="username"
                  />
                </div>
              )}
              
              {/* Mật khẩu - Only for add mode */}
              {!isEdit && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu *</label>
                  <input
                    type="password"
                    value={formData.mat_khau || ''}
                    onChange={(e) => handleChange('mat_khau', e.target.value)}
                    className={`w-full px-4 py-3 border-2 border-gray-300 rounded-xl ${focusRingColor} font-medium transition-all`}
                    placeholder="••••••••"
                  />
                </div>
              )}
              
              {/* Ngày sinh */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ngày sinh</label>
                <input
                  type="date"
                  value={formData.ngay_sinh || ''}
                  onChange={(e) => handleChange('ngay_sinh', e.target.value)}
                  className={`w-full px-4 py-3 border-2 border-gray-300 rounded-xl ${focusRingColor} font-medium transition-all`}
                />
              </div>
              
              {/* Giới tính */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Giới tính</label>
                <select
                  value={formData.gt || 'nam'}
                  onChange={(e) => handleChange('gt', e.target.value)}
                  className={`w-full px-4 py-3 border-2 border-gray-300 rounded-xl ${focusRingColor} font-medium transition-all`}
                >
                  <option value="nam">Nam</option>
                  <option value="nu">Nữ</option>
                  <option value="khac">Khác</option>
                </select>
              </div>
              
              {/* Lớp */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Lớp *</label>
                <select
                  value={formData.lop_id || ''}
                  onChange={(e) => handleChange('lop_id', e.target.value)}
                  className={`w-full px-4 py-3 border-2 border-gray-300 rounded-xl ${focusRingColor} font-medium transition-all`}
                >
                  {!isEdit && <option value="">Chọn lớp</option>}
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.ten_lop}</option>
                  ))}
                </select>
              </div>
              
              {/* Số điện thoại */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  value={formData.sdt || ''}
                  onChange={(e) => handleChange('sdt', e.target.value)}
                  className={`w-full px-4 py-3 border-2 border-gray-300 rounded-xl ${focusRingColor} font-medium transition-all`}
                  placeholder="0901234567"
                />
              </div>
              
              {/* Địa chỉ */}
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Địa chỉ</label>
                <textarea
                  value={formData.dia_chi || ''}
                  onChange={(e) => handleChange('dia_chi', e.target.value)}
                  rows="2"
                  className={`w-full px-4 py-3 border-2 border-gray-300 rounded-xl ${focusRingColor} font-medium transition-all`}
                  placeholder="Địa chỉ sinh viên..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t-2 border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-bold"
          >
            Hủy
          </button>
          <button
            onClick={onSubmit}
            className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${gradientColors} text-white rounded-xl hover:opacity-90 transition-all font-bold shadow-lg`}
          >
            {isEdit ? (
              <>
                <Save className="w-5 h-5" />
                Lưu thay đổi
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Thêm sinh viên
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentFormModal;
