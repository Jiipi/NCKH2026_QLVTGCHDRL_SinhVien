import React from 'react';
import { Activity as ActivityIcon, CheckCircle, XCircle, BarChart3 } from 'lucide-react';

// Neo-brutalism StatCard Component
function NeoStatCard({ icon: Icon, value, label, subLabel, className }) {
  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl" />
      <div className={`relative ${className} border-4 border-black p-6 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1`}>
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-black/20 rounded-xl border-2 border-black">
            <Icon className="h-6 w-6 text-black" />
          </div>
          <span className="text-xs font-black text-black/70 uppercase tracking-wider">{label}</span>
        </div>
        <div className="text-4xl font-black text-black mb-1">{value}</div>
        <div className="text-sm font-bold text-black/60 uppercase tracking-wide">{subLabel}</div>
      </div>
    </div>
  );
}

export default function AdminStatsGrid({ totalByStatus, totalDailyRegs }) {
  const statCards = [
    {
      icon: ActivityIcon,
      value: totalByStatus('cho_duyet'),
      label: 'Chờ duyệt',
      subLabel: 'Hoạt động',
      className: 'bg-yellow-400'
    },
    {
      icon: CheckCircle,
      value: totalByStatus('da_duyet'),
      label: 'Đã duyệt',
      subLabel: 'Hoạt động',
      className: 'bg-green-400'
    },
    {
      icon: XCircle,
      value: totalByStatus('tu_choi'),
      label: 'Từ chối',
      subLabel: 'Hoạt động',
      className: 'bg-red-400'
    },
    {
      icon: BarChart3,
      value: totalDailyRegs,
      label: 'Tổng đăng ký/ngày',
      subLabel: 'Tổng cộng',
      className: 'bg-cyan-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statCards.map((card, index) => (
        <NeoStatCard
          key={index}
          icon={card.icon}
          value={card.value}
          label={card.label}
          subLabel={card.subLabel}
          className={card.className}
        />
      ))}
    </div>
  );
}

