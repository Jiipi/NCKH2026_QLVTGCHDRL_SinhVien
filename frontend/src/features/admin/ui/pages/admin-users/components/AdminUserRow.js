import React from 'react';
import { Mail, GraduationCap, Eye, Lock, Unlock, Trash2, Calendar } from 'lucide-react';
import { getUserAvatar, getStudentAvatar } from '../../../../../../shared/lib/avatar';

export default function AdminUserRow({
  user,
  roleInfo,
  statusInfo,
  onViewDetails,
  onLockUser,
  onUnlockUser,
  onDeleteUser
}) {
  const avatarInfo = user.sinh_vien ? getStudentAvatar(user.sinh_vien) : getUserAvatar(user);
  const isLocked = user.trang_thai === 'khoa' || user.khoa === true;
  const createdAt = user.ngay_tao ? new Date(user.ngay_tao).toLocaleDateString('vi-VN') : 'N/A';

  return (
    <div className="group relative bg-white border-2 border-gray-200 rounded-xl hover:shadow-lg hover:border-violet-300 transition-all duration-200">
      <div className="flex items-center gap-4 p-4">
        <div className="flex-shrink-0">
          {avatarInfo.hasValidAvatar ? (
            <img
              src={avatarInfo.src}
              alt={avatarInfo.alt}
              className="w-12 h-12 rounded-full object-cover border-2"
              style={{ borderColor: roleInfo.bg }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg"
              style={{ backgroundColor: roleInfo.bg, color: roleInfo.color }}
            >
              {avatarInfo.fallback}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 items-center">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-violet-600 transition-colors">
              {user.ho_ten || 'Chưa có tên'}
            </h3>
            <p className="text-sm text-gray-500 truncate">{user.ten_dn || 'N/A'}</p>
          </div>
          <div className="hidden sm:block min-w-0">
            <p className="text-sm text-gray-600 truncate flex items-center gap-1.5">
              <Mail size={14} className="flex-shrink-0 text-gray-400" />
              {user.email || 'Chưa có email'}
            </p>
            {user.sinh_vien?.mssv && (
              <p className="text-sm text-gray-500 truncate flex items-center gap-1.5">
                <GraduationCap size={14} className="flex-shrink-0 text-gray-400" />
                {user.sinh_vien.mssv}
              </p>
            )}
          </div>
          <div className="hidden lg:flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: roleInfo.bg, color: roleInfo.color }}>
              {roleInfo.label}
            </span>
            <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}>
              {statusInfo.text}
            </span>
          </div>
          <div className="hidden lg:block text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-gray-400" />
              {createdAt}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => onViewDetails && onViewDetails(user)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 text-sm font-medium shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <Eye size={16} />
            <span className="hidden sm:inline">Chi tiết</span>
          </button>
          {isLocked ? (
            <button
              type="button"
              onClick={() => onUnlockUser && onUnlockUser(user)}
              title="Mở khóa tài khoản"
              className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all cursor-pointer"
            >
              <Unlock size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onLockUser && onLockUser(user)}
              title="Khóa tài khoản"
              className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all cursor-pointer"
            >
              <Lock size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={() => onDeleteUser && onDeleteUser(user)}
            title="Xóa tài khoản"
            className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

