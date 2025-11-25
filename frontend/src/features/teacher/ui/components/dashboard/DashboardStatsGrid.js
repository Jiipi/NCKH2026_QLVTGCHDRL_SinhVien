import React from 'react';
import { Clock, Activity, Users, Award, CheckCircle, Target } from 'lucide-react';

const STAT_CONFIGS = [
  { key: 'pendingApprovals', label: 'Chờ phê duyệt', icon: Clock, className: 'bg-yellow-400' },
  { key: 'totalActivities', label: 'Tổng hoạt động', icon: Activity, className: 'bg-purple-400', text: 'text-white' },
  { key: 'totalStudents', label: 'Tổng sinh viên', icon: Users, className: 'bg-blue-400', text: 'text-white' },
  { key: 'avgClassScore', label: 'Điểm TB lớp', icon: Award, className: 'bg-green-400' },
  { key: 'approvedThisWeek', label: 'Duyệt tuần này', icon: CheckCircle, className: 'bg-pink-400' },
  { key: 'participationRate', label: 'Tỉ lệ tham gia', icon: Target, className: 'bg-orange-400', suffix: '%' }
];

export default function DashboardStatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" data-ref="dashboard-stats-grid">
      {STAT_CONFIGS.map((config) => {
        const Icon = config.icon;
        const value = stats?.[config.key] ?? 0;
        return (
          <div key={config.key} className="group relative">
            <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl" />
            <div className={`relative ${config.className} border-4 border-black rounded-xl p-4 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col justify-between min-h-[120px]`}>
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-6 h-6 ${config.text === 'text-white' ? 'text-white' : 'text-black'}`} />
              </div>
              <div>
                <p className={`text-3xl font-black ${config.text || 'text-black'} mb-1 leading-none`}>
                  {value}{config.suffix || ''}
                </p>
                <p className={`text-[11px] font-black ${config.text ? `${config.text}/80` : 'text-black/70'} uppercase tracking-wider leading-tight`}>
                  {config.label}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


