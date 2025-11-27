import React from 'react';
import { Sparkles } from 'lucide-react';

const CHIP_CONFIG = [
  { key: '', label: (counts) => `Tất cả (${counts.total})`, classes: 'bg-gray-100 border-gray-200 text-gray-900', dot: 'bg-gray-600' },
  { key: 'hoat_dong', label: (counts) => `Phiên hoạt động (${counts.active})`, classes: 'bg-emerald-50 border-emerald-200 text-emerald-700', dot: 'bg-emerald-500' },
  { key: 'khoa', label: (counts) => `Bị khóa (${counts.locked})`, classes: 'bg-rose-50 border-rose-200 text-rose-700', dot: 'bg-rose-500' },
  { key: 'khong_hoat_dong', label: (counts) => `Không hoạt động (${counts.inactive})`, classes: 'bg-amber-50 border-amber-200 text-amber-700', dot: 'bg-amber-500' }
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
    <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm">
      <div className="px-6 pt-4 text-sm font-semibold text-gray-700 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-purple-500" />
        Trạng thái tài khoản
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {CHIP_CONFIG.map((chip) => (
          <button
            key={chip.key || 'all'}
            onClick={() => onStatusChange(chip.key)}
            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold border-2 transition-all hover:-translate-y-0.5 ${chip.classes} ${
              statusFilter === chip.key ? 'shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-2 ring-offset-2 ring-white/70' : ''
            }`}
          >
            <span className="text-sm">{chip.label(counts)}</span>
            <div className={`w-2 h-2 rounded-full ${chip.dot}`} />
          </button>
        ))}
      </div>
    </div>
  );
}




