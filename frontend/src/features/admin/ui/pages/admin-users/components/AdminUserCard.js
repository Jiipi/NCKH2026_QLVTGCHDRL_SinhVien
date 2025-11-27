import React from 'react';
import { Mail, User, GraduationCap, Calendar, Eye, Lock, Unlock, Trash2, Users } from 'lucide-react';
import { getUserAvatar, getStudentAvatar } from '../../../../../../shared/lib/avatar';

const buttonStyle = 'flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200';

export default function AdminUserCard({
  user,
  roleInfo,
  statusInfo,
  onViewDetails,
  onLockUser,
  onUnlockUser,
  onDeleteUser
}) {
  const avatarInfo = user.sinh_vien ? getStudentAvatar(user.sinh_vien) : getUserAvatar(user);
  const createdAt = user.ngay_tao ? new Date(user.ngay_tao).toLocaleDateString('vi-VN') : 'Không xác định';
  const isLocked = user.trang_thai === 'khoa' || user.khoa === true;

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex flex-col"
    >
      <div className="flex items-center gap-3 p-4 border-b border-gray-100">
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
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{user.ho_ten || 'Chưa có tên'}</h3>
          <p className="text-sm text-gray-500 truncate">{user.ten_dn || 'N/A'}</p>
        </div>
        <div className="flex flex-col gap-1 text-xs font-semibold">
          <span className="px-2 py-1 rounded-full" style={{ backgroundColor: roleInfo.bg, color: roleInfo.color }}>
            {roleInfo.label}
          </span>
          <span className="px-2 py-1 rounded-full" style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}>
            {statusInfo.text}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3 flex-1">
        <InfoRow icon={<Mail size={14} />} text={user.email || 'Chưa có email'} />
        <InfoRow icon={<User size={14} />} text={user.ten_dn || 'Chưa có username'} />
        {user.sinh_vien && (
          <>
            <InfoRow icon={<GraduationCap size={14} />} text={`MSSV: ${user.sinh_vien.mssv || 'N/A'}`} />
            {user.sinh_vien.lop?.ten_lop && (
              <InfoRow icon={<Users size={14} />} text={`Lớp: ${user.sinh_vien.lop.ten_lop}`} />
            )}
          </>
        )}
        <InfoRow icon={<Calendar size={14} />} text={`Tham gia: ${createdAt}`} />
      </div>

      <div className="flex gap-2 p-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => onViewDetails && onViewDetails(user)}
          className={`${buttonStyle} bg-blue-500 hover:bg-blue-600 text-white flex-1 cursor-pointer`}
        >
          <Eye size={16} />
          Chi tiết
        </button>
        {isLocked ? (
          <button type="button" onClick={() => onUnlockUser && onUnlockUser(user)} className={`${buttonStyle} bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer`}>
            <Unlock size={16} />
          </button>
        ) : (
          <button type="button" onClick={() => onLockUser && onLockUser(user)} className={`${buttonStyle} bg-amber-500 hover:bg-amber-600 text-white cursor-pointer`}>
            <Lock size={16} />
          </button>
        )}
        <button type="button" onClick={() => onDeleteUser && onDeleteUser(user)} className={`${buttonStyle} bg-rose-500 hover:bg-rose-600 text-white cursor-pointer`}>
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

function InfoRow({ icon, text }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 min-h-[24px]">
      <span className="text-gray-400 flex-shrink-0">{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  );
}

