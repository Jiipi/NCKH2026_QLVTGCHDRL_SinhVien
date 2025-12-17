/**
 * StudentViewModal Component
 * ==========================
 * Tier 1 - UI Component (SOLID: Single Responsibility)
 * 
 * Modal for viewing student details with tabs
 * 
 * @module features/teacher/ui/components/students/StudentViewModal
 */

import React from 'react';
import { X, User, BookOpen, Home } from 'lucide-react';
import { getStudentAvatar, getAvatarGradient } from '../../../../../shared/lib/avatarUtils';

/**
 * Format date to Vietnamese locale
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
};

/**
 * Format gender
 * @param {string} gt - Gender code
 * @returns {string} Gender text
 */
const formatGender = (gt) => {
  const genderMap = { 'nam': 'Nam', 'nu': 'Nữ', 'khac': 'Khác' };
  return genderMap[gt] || 'N/A';
};

/**
 * StudentViewModal - View student details
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Object} props.student - Student data
 * @param {string} props.activeTab - Active tab ('basic', 'academic', 'personal')
 * @param {Function} props.onTabChange - Tab change handler
 * @param {Function} props.onClose - Close handler
 */
export function StudentViewModal({ 
  isOpen = false, 
  student, 
  activeTab = 'basic',
  onTabChange,
  onClose 
}) {
  if (!isOpen || !student) return null;

  const avatar = getStudentAvatar(student);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
          <h2 className="text-2xl font-bold text-white">Thông tin sinh viên</h2>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white p-2 hover:bg-white/20 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6 bg-gray-50">
          <button
            onClick={() => onTabChange('basic')}
            className={`py-4 px-6 font-bold transition-all ${
              activeTab === 'basic'
                ? 'text-indigo-600 border-b-4 border-indigo-600 -mb-[2px] bg-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Cơ bản
            </div>
          </button>
          <button
            onClick={() => onTabChange('academic')}
            className={`py-4 px-6 font-bold transition-all ${
              activeTab === 'academic'
                ? 'text-indigo-600 border-b-4 border-indigo-600 -mb-[2px] bg-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Học tập
            </div>
          </button>
          <button
            onClick={() => onTabChange('personal')}
            className={`py-4 px-6 font-bold transition-all ${
              activeTab === 'personal'
                ? 'text-indigo-600 border-b-4 border-indigo-600 -mb-[2px] bg-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Cá nhân
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6 pb-6 border-b-2 border-gray-100">
                {avatar.hasValidAvatar ? (
                  <img
                    src={avatar.src}
                    alt={avatar.alt}
                    className="w-24 h-24 rounded-2xl object-cover shadow-xl ring-4 ring-indigo-100"
                  />
                ) : (
                  <div 
                    className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${getAvatarGradient(student.ho_ten || student.sinh_vien?.mssv)} flex items-center justify-center text-white font-black text-3xl shadow-xl ring-4 ring-indigo-100`}
                  >
                    {avatar.fallback}
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-black text-gray-900">{student.ho_ten || 'N/A'}</h3>
                  <p className="text-indigo-600 font-bold text-lg">MSSV: {student.sinh_vien?.mssv || 'N/A'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <InfoField label="Họ và tên" value={student.ho_ten} />
                <InfoField label="MSSV" value={student.sinh_vien?.mssv} />
                <InfoField label="Email" value={student.email} />
                <InfoField label="Lớp" value={student.sinh_vien?.lop?.ten_lop} />
              </div>
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <InfoField 
                  label="Lớp" 
                  value={student.sinh_vien?.lop?.ten_lop} 
                  variant="blue"
                />
                <InfoField 
                  label="Khoa" 
                  value={student.sinh_vien?.lop?.khoa} 
                  variant="purple"
                />
                <InfoField 
                  label="Niên khóa" 
                  value={student.sinh_vien?.lop?.nien_khoa} 
                  variant="green"
                />
                <InfoField 
                  label="Năm nhập học" 
                  value={formatDate(student.sinh_vien?.lop?.nam_nhap_hoc)} 
                  variant="orange"
                />
              </div>
            </div>
          )}

          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <InfoField 
                  label="Ngày sinh" 
                  value={formatDate(student.sinh_vien?.ngay_sinh)} 
                  variant="pink"
                />
                <InfoField 
                  label="Giới tính" 
                  value={formatGender(student.sinh_vien?.gt)} 
                  variant="indigo"
                />
                <InfoField 
                  label="Số điện thoại" 
                  value={student.sinh_vien?.sdt} 
                  variant="teal"
                />
                <InfoField 
                  label="Địa chỉ" 
                  value={student.sinh_vien?.dia_chi} 
                  className="col-span-2"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * InfoField - Display field with label
 */
function InfoField({ label, value, variant = 'gray', className = '' }) {
  const variantStyles = {
    gray: 'bg-gray-50 border-gray-100',
    blue: 'bg-blue-50 border-blue-100 [&_label]:text-blue-600',
    purple: 'bg-purple-50 border-purple-100 [&_label]:text-purple-600',
    green: 'bg-green-50 border-green-100 [&_label]:text-green-600',
    orange: 'bg-orange-50 border-orange-100 [&_label]:text-orange-600',
    pink: 'bg-pink-50 border-pink-100 [&_label]:text-pink-600',
    indigo: 'bg-indigo-50 border-indigo-100 [&_label]:text-indigo-600',
    teal: 'bg-teal-50 border-teal-100 [&_label]:text-teal-600',
  };

  return (
    <div className={`rounded-xl p-4 border-2 ${variantStyles[variant]} ${className}`}>
      <label className="block text-sm font-bold text-gray-500 mb-1">{label}</label>
      <p className="text-lg text-gray-900">{value || 'N/A'}</p>
    </div>
  );
}

export default StudentViewModal;
