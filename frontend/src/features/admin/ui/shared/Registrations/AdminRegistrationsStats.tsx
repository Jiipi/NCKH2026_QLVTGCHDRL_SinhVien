import React from 'react';
import { Activity as ActivityIcon, Clock, CheckCircle, XCircle, Award } from 'lucide-react';

const STATS_CONFIG = [
  { key: 'total', label: 'Tổng đăng ký', icon: ActivityIcon, tone: 'text-indigo-600 dark:text-indigo-300', bg: 'bg-indigo-50 dark:bg-indigo-400/10' },
  { key: 'pending', label: 'Chờ duyệt', icon: Clock, tone: 'text-amber-600 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-400/10' },
  { key: 'approved', label: 'Đã duyệt', icon: CheckCircle, tone: 'text-emerald-600 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-400/10' },
  { key: 'rejected', label: 'Từ chối', icon: XCircle, tone: 'text-rose-600 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-400/10' },
  { key: 'participated', label: 'Đã tham gia', icon: Award, tone: 'text-purple-600 dark:text-purple-300', bg: 'bg-purple-50 dark:bg-purple-400/10' }
];

export default function AdminRegistrationsStats({ stats, viewMode }) {
  const toRender = viewMode === 'all' 
    ? STATS_CONFIG 
    : STATS_CONFIG.filter(c => c.key === viewMode);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
      {toRender.map((stat, index) => {
        const Icon = stat.icon;
        const value = stats[stat.key] || 0;
        return (
          <div key={index} className="rounded-[1.5rem] border border-white/60 bg-white/60 p-4 shadow-sm backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/75 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/60 dark:hover:bg-white/10">
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${stat.bg}`}>
              <Icon className={`h-5 w-5 ${stat.tone}`} />
            </div>
            <div className="text-3xl font-black tracking-[-0.05em] text-slate-950 dark:text-white">{value}</div>
            <div className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
}

