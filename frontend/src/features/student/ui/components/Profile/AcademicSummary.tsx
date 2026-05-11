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
    <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(99,102,241,0.14),transparent_32%),radial-gradient(circle_at_100%_0%,rgba(20,184,166,0.12),transparent_28%)]" />
      <div className="relative z-10">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-500 dark:text-indigo-300">Học vụ</p>
            <h3 className="text-xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">Thông tin sinh viên</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-white/60 bg-white/45 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                <Icon className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-300" />
                <span>{label}</span>
              </div>
              <div className="text-lg font-black text-slate-950 dark:text-white">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
