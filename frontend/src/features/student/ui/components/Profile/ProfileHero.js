import React from 'react';
import { User, GraduationCap, Edit3, Key } from 'lucide-react';

export default function ProfileHero({
  profile,
  canDisplayImage,
  directImageUrl,
  onEdit,
  onChangePassword,
  editing,
  changingPassword
}) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-100 rounded-xl">
          <User className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thông tin cá nhân</h1>
          <p className="text-gray-600 mt-1">Quản lý thông tin tài khoản sinh viên</p>
        </div>
      </div>
      {!editing && !changingPassword && (
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={onChangePassword}
            className="flex items-center gap-2 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors shadow-sm"
          >
            <Key className="h-4 w-4" /> Đổi mật khẩu
          </button>
          <button
            onClick={onEdit}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Edit3 className="h-4 w-4" /> Chỉnh sửa
          </button>
        </div>
      )}
    </div>
  );
}

