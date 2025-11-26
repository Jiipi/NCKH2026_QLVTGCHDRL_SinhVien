import React from 'react';
import { Users, Mail, User, Calendar, Eye, Trash2, GraduationCap } from 'lucide-react';
import { getUserAvatar } from '../../../shared/lib/avatar'; // Assuming this util is moved to shared

const getStatusInfo = (status) => {
  switch (status) {
    case 'hoat_dong': return { bg: '#dcfce7', color: '#15803d', text: 'Hoạt động' };
    case 'khong_hoat_dong': return { bg: '#f3f4f6', color: '#374151', text: 'Không hoạt động' };
    case 'khoa': return { bg: '#fef2f2', color: '#dc2626', text: 'Bị khóa' };
    default: return { bg: '#fef3c7', color: '#92400e', text: 'Chưa xác định' };
  }
};

const getRoleInfo = (role) => {
  switch (role) {
    case 'Admin': return { bg: '#fef2f2', color: '#dc2626' };
    case 'Giảng viên': return { bg: '#fef3c7', color: '#92400e' };
    case 'Lớp trưởng': return { bg: '#dbeafe', color: '#1e40af' };
    case 'Sinh viên': return { bg: '#dcfce7', color: '#15803d' };
    default: return { bg: '#f3f4f6', color: '#374151' };
  }
};

export default function UserCard({ user, onDetails, onDelete, activeIdentifiers = { ids: new Set(), codes: new Set() } }) {
  const avatarInfo = user.sinh_vien ? getUserAvatar(user.sinh_vien) : getUserAvatar(user);
  
  const sameId = user.id && activeIdentifiers.ids.has(String(user.id));
  const sameCode = (user.maso && activeIdentifiers.codes.has(String(user.maso))) || 
                 (user.ten_dn && activeIdentifiers.codes.has(String(user.ten_dn))) || 
                 (user.sinh_vien?.mssv && activeIdentifiers.codes.has(String(user.sinh_vien.mssv)));
  const locked = user.trang_thai === 'khoa';
  const derivedStatus = locked ? 'khoa' : (sameId || sameCode ? 'hoat_dong' : 'khong_hoat_dong');

  const statusInfo = getStatusInfo(derivedStatus);
  const roleInfo = getRoleInfo(user.vai_tro?.ten_vt);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 transition-all hover:shadow-lg hover:border-blue-300">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <img 
            src={avatarInfo.src} 
            alt={avatarInfo.alt}
            className="w-14 h-14 rounded-full object-cover border-2"
            style={{ borderColor: roleInfo.bg }}
            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
          />
          <div 
            className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl hidden"
            style={{ backgroundColor: roleInfo.bg, color: roleInfo.color }}
          >
            {avatarInfo.fallback}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 truncate">{user.ho_ten || 'Chưa có tên'}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: roleInfo.bg, color: roleInfo.color }}>
              {user.vai_tro?.ten_vt || 'N/A'}
            </span>
            <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}>
              {statusInfo.text}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-5">
        <div className="flex items-center gap-2"><Mail size={14} /> <span className="truncate">{user.email || 'N/A'}</span></div>
        <div className="flex items-center gap-2"><User size={14} /> <span>{user.ten_dn || 'N/A'}</span></div>
        {user.sinh_vien && (
          <>
            <div className="flex items-center gap-2"><GraduationCap size={14} /> <span>MSSV: {user.sinh_vien.mssv}</span></div>
            {user.sinh_vien.lop && <div className="flex items-center gap-2"><Users size={14} /> <span>Lớp: {user.sinh_vien.lop.ten_lop}</span></div>}
          </>
        )}
        <div className="flex items-center gap-2"><Calendar size={14} /> <span>Tham gia: {user.ngay_tao ? new Date(user.ngay_tao).toLocaleDateString('vi-VN') : 'N/A'}</span></div>
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <button onClick={() => onDetails(user.id)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition">
          <Eye size={16} /> Chi tiết
        </button>
        <button onClick={() => onDelete(user)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

