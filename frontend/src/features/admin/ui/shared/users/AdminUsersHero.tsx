import React from 'react';
import { Activity, LayoutGrid, Lock, Shield, UserPlus, Users } from 'lucide-react';
import { AdminPageHero } from '../../../../../shared/components/admin';

interface RoleCounts {
  adminCount?: number;
  admin?: number;
  teacherCount?: number;
  teacher?: number;
  classMonitorCount?: number;
  classMonitor?: number;
  studentCount?: number;
  student?: number;
}

interface AdminUsersHeroProps {
  totalAccounts?: number;
  liveSessions?: number;
  lockedAccounts?: number;
  roleCounts?: RoleCounts;
  onCreateClick?: () => void;
}

export default function AdminUsersHero({
  totalAccounts = 0,
  liveSessions = 0,
  lockedAccounts = 0,
  roleCounts = {},
  onCreateClick
}: AdminUsersHeroProps) {
  const adminNum = roleCounts.adminCount ?? roleCounts.admin ?? 0;
  const teacherNum = roleCounts.teacherCount ?? roleCounts.teacher ?? 0;
  const classMonitorNum = roleCounts.classMonitorCount ?? roleCounts.classMonitor ?? 0;
  const studentNum = roleCounts.studentCount ?? roleCounts.student ?? 0;

  return (
    <AdminPageHero
      eyebrow="Quản trị tài khoản"
      title="Quản lý tài khoản"
      description="Theo dõi hoạt động đăng nhập, trạng thái khóa/kích hoạt và phân bổ vai trò cho toàn bộ hệ thống."
      heroIcon={Shield}
      metrics={[
        { icon: Users, label: 'Tổng tài khoản', value: totalAccounts, tone: 'text-indigo-600 dark:text-indigo-300' },
        { icon: Activity, label: 'Phiên hoạt động', value: liveSessions, tone: 'text-emerald-600 dark:text-emerald-300' },
        { icon: Lock, label: 'Bị khóa', value: lockedAccounts, tone: 'text-rose-600 dark:text-rose-300' },
        { icon: LayoutGrid, label: 'Admin/GV/LT/SV', value: `${adminNum}/${teacherNum}/${classMonitorNum}/${studentNum}`, tone: 'text-sky-600 dark:text-sky-300' }
      ]}
      actions={(
        <button
          onClick={onCreateClick}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-700"
        >
          <UserPlus className="h-5 w-5" />
          Thêm tài khoản
        </button>
      )}
    />
  );
}
