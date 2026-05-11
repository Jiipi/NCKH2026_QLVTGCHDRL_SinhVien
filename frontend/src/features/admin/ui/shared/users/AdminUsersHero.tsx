import React from 'react';
import { Shield, UserPlus, Users, Activity, Lock, LayoutGrid, Sparkles } from 'lucide-react';

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
  // Normalize roleCounts - support both API format (adminCount) and legacy format (admin)
  const adminNum = roleCounts.adminCount ?? roleCounts.admin ?? 0;
  const teacherNum = roleCounts.teacherCount ?? roleCounts.teacher ?? 0;
  const classMonitorNum = roleCounts.classMonitorCount ?? roleCounts.classMonitor ?? 0;
  const studentNum = roleCounts.studentCount ?? roleCounts.student ?? 0;
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20 sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(129,140,248,0.16),transparent_30%),radial-gradient(circle_at_100%_0%,rgba(45,212,191,0.12),transparent_28%)]" />
      <div className="relative z-10 space-y-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-indigo-300">
              <Sparkles className="h-4 w-4" />
              Quản trị tài khoản
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-indigo-50/80 p-3 shadow-sm ring-1 ring-indigo-100 dark:bg-indigo-400/10 dark:ring-indigo-400/20">
                <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-3xl">Quản lý tài khoản</h1>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">
                  Theo dõi hoạt động đăng nhập, trạng thái khóa/kích hoạt và phân bổ vai trò cho toàn bộ hệ thống.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onCreateClick}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-700"
          >
            <UserPlus className="h-5 w-5" />
            Thêm tài khoản
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <HeroCard icon={Users} value={totalAccounts} label="Tổng tài khoản" tone="text-indigo-600 dark:text-indigo-300" bg="bg-indigo-50 dark:bg-indigo-400/10" />
          <HeroCard icon={Activity} value={liveSessions} label="Phiên hoạt động" tone="text-emerald-600 dark:text-emerald-300" bg="bg-emerald-50 dark:bg-emerald-400/10" />
          <HeroCard icon={Lock} value={lockedAccounts} label="Bị khóa" tone="text-rose-600 dark:text-rose-300" bg="bg-rose-50 dark:bg-rose-400/10" />
          <HeroCard icon={LayoutGrid} value={`${adminNum}/${teacherNum}/${classMonitorNum}/${studentNum}`} label="Admin • GV • LT • SV" tone="text-sky-600 dark:text-sky-300" bg="bg-sky-50 dark:bg-sky-400/10" isCompact />
        </div>
      </div>
    </section>
  );
}

interface HeroCardProps {
  icon: React.ComponentType<{ className?: string }>;
  value: number | string;
  label: string;
  tone: string;
  bg: string;
  isCompact?: boolean;
}

function HeroCard({ icon: Icon, value, label, tone, bg, isCompact = false }: HeroCardProps) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${bg}`}>
        <Icon className={`h-5 w-5 ${tone}`} />
      </div>
      <p className={`font-black tracking-[-0.04em] text-slate-950 dark:text-white ${isCompact ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl'}`}>
        {value}
      </p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{label}</p>
    </div>
  );
}










