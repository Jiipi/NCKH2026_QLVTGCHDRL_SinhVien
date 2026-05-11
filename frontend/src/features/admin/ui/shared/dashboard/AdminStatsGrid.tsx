import React from 'react';
import { Users, Activity, Clock, UserCheck, CheckCircle, TrendingUp } from 'lucide-react';

export default function AdminStatsGrid({ stats }) {
  const statItems = [
    {
      icon: Users,
      value: stats.totalUsers || 0,
      label: 'Tổng người dùng',
      tone: 'text-indigo-600 dark:text-indigo-300',
      bg: 'bg-indigo-50 dark:bg-indigo-400/10'
    },
    {
      icon: Activity,
      value: stats.totalActivities || 0,
      label: 'Hoạt động',
      tone: 'text-emerald-600 dark:text-emerald-300',
      bg: 'bg-emerald-50 dark:bg-emerald-400/10'
    },
    {
      icon: Clock,
      value: stats.pendingApprovals || 0,
      label: 'Chờ duyệt',
      tone: 'text-amber-600 dark:text-amber-300',
      bg: 'bg-amber-50 dark:bg-amber-400/10'
    },
    {
      icon: UserCheck,
      value: stats.activeUsers || 0,
      label: 'Đang hoạt động',
      tone: 'text-sky-600 dark:text-sky-300',
      bg: 'bg-sky-50 dark:bg-sky-400/10'
    },
    {
      icon: CheckCircle,
      value: stats.todayApprovals || 0,
      label: 'Duyệt hôm nay',
      tone: 'text-rose-600 dark:text-rose-300',
      bg: 'bg-rose-50 dark:bg-rose-400/10'
    },
    {
      icon: TrendingUp,
      value: `+${stats.newUsersThisMonth || 0}`,
      label: 'User tháng này',
      tone: 'text-orange-600 dark:text-orange-300',
      bg: 'bg-orange-50 dark:bg-orange-400/10'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="group rounded-[1.5rem] border border-white/60 bg-white/60 p-4 shadow-sm backdrop-blur-2xl transition-all hover:-translate-y-0.5 hover:bg-white/75 hover:shadow-lg dark:border-white/10 dark:bg-slate-950/55 dark:hover:bg-white/10">
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${item.bg}`}>
              <Icon className={`h-5 w-5 ${item.tone}`} />
            </div>
            <p className="text-3xl font-black tracking-[-0.05em] text-slate-950 dark:text-white">{item.value}</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{item.label}</p>
          </div>
        );
      })}
    </div>
  );
}

