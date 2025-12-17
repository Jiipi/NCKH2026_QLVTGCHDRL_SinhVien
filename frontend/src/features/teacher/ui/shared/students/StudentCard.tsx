/**
 * StudentCard Component
 * =====================
 * Tier 1 - UI Component (SOLID: Single Responsibility)
 * 
 * Grid view card for a student
 * 
 * @module features/teacher/ui/components/students/StudentCard
 */

import React from 'react';
import { Eye, Edit, Trash2, MapPin } from 'lucide-react';
import { getStudentAvatar, getAvatarGradient } from '../../../../../shared/lib/avatarUtils';

/**
 * StudentCard - Grid view student card
 * @param {Object} props
 * @param {Object} props.student - Student data
 * @param {boolean} props.isSelected - Whether card is selected
 * @param {Function} props.onSelect - Selection toggle handler
 * @param {Function} props.onView - View details handler
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onDelete - Delete handler
 */
export function StudentCard({ 
  student, 
  isSelected = false, 
  onSelect, 
  onView, 
  onEdit, 
  onDelete 
}) {
  const avatar = getStudentAvatar(student);

  return (
    <div 
      className={`relative bg-white border-2 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${
        isSelected 
          ? 'border-indigo-500 bg-indigo-50 shadow-md' 
          : 'border-gray-200 hover:border-indigo-300'
      }`}
      onClick={() => onView(student)}
    >
      {/* Checkbox */}
      <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(student.id)}
          className="w-5 h-5 text-indigo-600 border-2 border-gray-300 rounded focus:ring-indigo-500"
        />
      </div>
      
      {/* Avatar & Info */}
      <div className="flex flex-col items-center text-center">
        {avatar.hasValidAvatar ? (
          <img
            src={avatar.src}
            alt={avatar.alt}
            className="w-20 h-20 rounded-full object-cover shadow-lg ring-4 ring-indigo-100 mb-3"
          />
        ) : (
          <div 
            className={`w-20 h-20 bg-gradient-to-br ${getAvatarGradient(student.ho_ten || student.sinh_vien?.mssv)} rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-indigo-100 mb-3`}
          >
            {avatar.fallback}
          </div>
        )}
        <h4 className="font-bold text-gray-900 text-lg">{student.ho_ten || 'Chưa có tên'}</h4>
        <p className="text-sm text-indigo-600 font-medium">MSSV: {student.sinh_vien?.mssv || 'N/A'}</p>
        <p className="text-sm text-gray-500 mt-1">{student.email || 'N/A'}</p>
        <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
          <MapPin className="w-4 h-4" />
          <span>{student.sinh_vien?.lop?.ten_lop || 'N/A'}</span>
        </div>
      </div>
      
      {/* Actions */}
      <div 
        className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-100" 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={() => onView(student)}
          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          title="Xem chi tiết"
        >
          <Eye className="w-5 h-5" />
        </button>
        <button 
          onClick={() => onEdit(student)}
          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Chỉnh sửa"
        >
          <Edit className="w-5 h-5" />
        </button>
        <button 
          onClick={() => onDelete(student.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Xóa"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default StudentCard;
