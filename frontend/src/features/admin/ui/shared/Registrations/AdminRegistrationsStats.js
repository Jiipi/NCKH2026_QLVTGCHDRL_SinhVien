import React from 'react';
import { Activity as ActivityIcon, Clock, CheckCircle, XCircle, Award } from 'lucide-react';

const STATS_CONFIG = [
  { key: 'total', label: 'Tổng đăng ký', icon: ActivityIcon, color: 'from-blue-500 to-cyan-600' },
  { key: 'pending', label: 'Chờ duyệt', icon: Clock, color: 'from-yellow-500 to-amber-600' },
  { key: 'approved', label: 'Đã duyệt', icon: CheckCircle, color: 'from-green-500 to-emerald-600' },
  { key: 'rejected', label: 'Từ chối', icon: XCircle, color: 'from-red-500 to-rose-600' },
  { key: 'participated', label: 'Đã tham gia', icon: Award, color: 'from-purple-500 to-indigo-600' }
];

export default function AdminRegistrationsStats({ stats, viewMode }) {
  const toRender = viewMode === 'all' 
    ? STATS_CONFIG 
    : STATS_CONFIG.filter(c => c.key === viewMode);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      {toRender.map((stat, index) => {
        const Icon = stat.icon;
        const value = stats[stat.key] || 0;
        return (
          <div key={index} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className={`bg-gradient-to-r ${stat.color} p-4`}>
              <Icon className="w-6 h-6 text-white mb-2" />
              <div className="text-3xl font-bold text-white">{value}</div>
              <div className="text-sm text-white/90 mt-1">{stat.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

