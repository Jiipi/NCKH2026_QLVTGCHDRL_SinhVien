import React from 'react';
import { Sparkles } from 'lucide-react';

const CHIP_CONFIG = [
  { key: '', label: (counts) => `Tất cả (${counts.total})`, classes: 'border-slate-200/70 bg-slate-50/70 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300', dot: 'bg-slate-500' },
  { key: 'hoat_dong', label: (counts) => `Phiên hoạt động (${counts.active})`, classes: 'border-emerald-200/70 bg-emerald-50/70 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300', dot: 'bg-emerald-500' },
  { key: 'khoa', label: (counts) => `Bị khóa (${counts.locked})`, classes: 'border-rose-200/70 bg-rose-50/70 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300', dot: 'bg-rose-500' },
  { key: 'khong_hoat_dong', label: (counts) => `Không hoạt động (${counts.inactive})`, classes: 'border-amber-200/70 bg-amber-50/70 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300', dot: 'bg-amber-500' }
];

export default function AdminUsersStatusChips({
  statusFilter,
  onStatusChange,
  totalAccounts = 0,
  activeNowCount = 0,
  lockedAccounts = 0,
  inactiveCount = 0
}) {
  const counts = {
    total: totalAccounts,
    active: activeNowCount,
    locked: lockedAccounts,
    inactive: inactiveCount
  };

  return (
    <div className="rounded-[2rem] border border-white/60 bg-white/60 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/60">
      <div className="flex items-center gap-2 px-6 pt-4 text-sm font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
        <Sparkles className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
        Trạng thái tài khoản
      </div>
      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        {CHIP_CONFIG.map((chip) => (
          <button
            key={chip.key || 'all'}
            onClick={() => onStatusChange(chip.key)}
            className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 font-bold transition-all hover:-translate-y-0.5 ${chip.classes} ${
              statusFilter === chip.key ? 'shadow-lg ring-2 ring-indigo-100/70 dark:ring-indigo-400/20' : 'shadow-sm'
            }`}
          >
            <span className="text-sm">{chip.label(counts)}</span>
            <div className={`h-2 w-2 rounded-full ${chip.dot}`} />
          </button>
        ))}
      </div>
    </div>
  );
}




