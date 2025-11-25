/**
 * StudentListItem Component
 * =========================
 * Tier 1 - UI Component (SOLID: Single Responsibility)
 * 
 * List view row for a student
 * 
 * @module features/teacher/ui/components/students/StudentListItem
 */

import React from 'react';
import { Eye, Edit, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { getStudentAvatar, getAvatarGradient } from '../../../../../shared/lib/avatarUtils';

/**
 * StudentListItem - List view student row
 * @param {Object} props
 * @param {Object} props.student - Student data
 * @param {boolean} props.isSelected - Whether row is selected
 * @param {Function} props.onSelect - Selection toggle handler
 * @param {Function} props.onView - View details handler
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onDelete - Delete handler
 */
export function StudentListItem({ 
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
      className={`p-6 transition-all duration-200 cursor-pointer ${
        isSelected ? 'bg-indigo-50' : 'hover:bg-gray-50'
      }`}
      onClick={() => onView(student)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Checkbox */}
          <div onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(student.id)}
              className="w-5 h-5 text-indigo-600 border-2 border-gray-300 rounded focus:ring-indigo-500"
            />
          </div>
          
          {/* Avatar */}
          {avatar.hasValidAvatar ? (
            <img
              src={avatar.src}
              alt={avatar.alt}
              className="w-14 h-14 rounded-xl object-cover shadow-md ring-2 ring-white"
            />
          ) : (
            <div 
              className={`w-14 h-14 bg-gradient-to-br ${getAvatarGradient(student.ho_ten || student.sinh_vien?.mssv)} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md`}
            >
              {avatar.fallback}
            </div>
          )}
          
          <div>
            <h4 className="font-bold text-gray-900 text-lg">{student.ho_ten || 'Chưa có tên'}</h4>
            <p className="text-sm text-indigo-600 font-medium">MSSV: {student.sinh_vien?.mssv || 'N/A'}</p>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <span>{student.email || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span>{student.sinh_vien?.sdt || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full">
            <MapPin className="w-4 h-4 text-indigo-500" />
            <span className="text-indigo-600 font-medium">
              {student.sinh_vien?.lop?.ten_lop || 'N/A'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => onView(student)}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            title="Xem chi tiết"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onEdit(student)}
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
            title="Chỉnh sửa"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onDelete(student.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Xóa"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentListItem;
