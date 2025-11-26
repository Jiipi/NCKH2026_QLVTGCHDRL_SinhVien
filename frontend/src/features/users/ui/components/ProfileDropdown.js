import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDropdown } from '../../../shared/hooks/useDropdown';
import sessionStorageManager from '../../../shared/services/storage/sessionStorageManager';
import { getUserAvatar, getAvatarGradient } from '../../../shared/lib/avatar';
import { useAppStore } from '../../../shared/store/useAppStore';

const getRoleContext = (role) => {
  const normalizedRole = String(role || '').toUpperCase();
  const isAdminContext = normalizedRole.includes('ADMIN') || normalizedRole.includes('QUẢN TRỊ');
  const isTeacherContext = normalizedRole.includes('GIANG_VIEN') || normalizedRole.includes('GIẢNG VIÊN');
  const isMonitorContext = normalizedRole.includes('LOP_TRUONG') || normalizedRole.includes('LỚP TRƯỞNG');
  return { isAdminContext, isTeacherContext, isMonitorContext };
};

export const ProfileDropdown = ({ profile }) => {
  const navigate = useNavigate();
  const { isOpen, toggle, dropdownRef } = useDropdown();
  const { role, clearAuth } = useAppStore();

  const handleLogout = () => {
    sessionStorageManager.clearSession();
    clearAuth();
    navigate('/login');
  };

  if (!profile) return null;

  const { isAdminContext, isTeacherContext, isMonitorContext } = getRoleContext(profile.vai_tro?.ten_vt || role);
  const avatar = getUserAvatar(profile);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
        onClick={toggle}
      >
        {avatar.hasValidAvatar ? (
          <img
            src={avatar.src}
            alt={avatar.alt}
            className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
          />
        ) : (
          <div className={`w-8 h-8 rounded-full ${getAvatarGradient(profile.ho_ten || '')} flex items-center justify-center text-white text-sm font-semibold`}>
            {avatar.fallback}
          </div>
        )}
        <span className="hidden sm:block text-sm font-medium text-gray-700">
          {profile.ho_ten || 'User'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="py-1">
            {isAdminContext ? (
              <Link to="/admin/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Thông tin cá nhân</Link>
            ) : isMonitorContext ? (
              <Link to="/monitor/my-profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Hồ sơ cá nhân</Link>
            ) : isTeacherContext ? (
              <>
                <Link to="/teacher/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Thông tin cá nhân</Link>
                <Link to="/teacher/preferences" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Tùy chọn</Link>
              </>
            ) : (
              <Link to="/student/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Thông tin cá nhân</Link>
            )}
            <hr className="my-1 border-gray-100" />
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
