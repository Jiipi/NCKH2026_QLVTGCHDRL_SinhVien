import React from 'react';
import { GraduationCap, Hash, Calendar, User as UserIcon } from 'lucide-react';

export default function AcademicSummary({ profile, formatDateVN, getGenderDisplay }) {
  const cards = [
    { label: 'MSSV', value: profile?.mssv || profile?.maso || 'Chưa cập nhật', icon: Hash },
    { label: 'Lớp', value: profile?.lop || 'Chưa cập nhật', icon: GraduationCap },
    { label: 'Khoa', value: profile?.khoa || 'Chưa cập nhật', icon: GraduationCap },
    { label: 'Niên khóa', value: profile?.nienkhoa || 'Chưa cập nhật', icon: Calendar },
    {
      label: 'Ngày sinh',
      value: profile?.ngaysinh || profile?.ngay_sinh ? formatDateVN(profile?.ngaysinh || profile?.ngay_sinh) : 'Chưa cập nhật',
      icon: Calendar
    },
    { label: 'Giới tính', value: getGenderDisplay(profile?.gt), icon: UserIcon }
  ];

  return (
    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className="h-6 w-6" />
        <h3 className="text-xl font-bold">📚 Thông tin sinh viên</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-2 text-white/80 text-xs mb-1">
              <Icon className="h-3 w-3" />
              <span>{label}</span>
            </div>
            <div className="text-lg font-bold">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

