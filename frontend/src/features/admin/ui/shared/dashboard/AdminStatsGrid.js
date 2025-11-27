import React from 'react';
import { Users, Activity, Clock, UserCheck, CheckCircle, TrendingUp } from 'lucide-react';

export default function AdminStatsGrid({ stats }) {
  const statItems = [
    {
      icon: Users,
      value: stats.totalUsers || 0,
      label: 'Tổng người dùng',
      badge: 'USER',
      bgColor: 'bg-gradient-to-br from-blue-400 to-indigo-500',
      badgeColor: 'bg-black text-blue-400',
      textColor: 'text-white',
      labelColor: 'text-white/80'
    },
    {
      icon: Activity,
      value: stats.totalActivities || 0,
      label: 'Hoạt động',
      badge: 'ACTIVITY',
      bgColor: 'bg-green-400',
      badgeColor: 'bg-black text-green-400',
      textColor: 'text-black',
      labelColor: 'text-black/70'
    },
    {
      icon: Clock,
      value: stats.pendingApprovals || 0,
      label: 'Chờ duyệt',
      badge: 'PENDING',
      bgColor: 'bg-yellow-400',
      badgeColor: 'bg-black text-yellow-400',
      textColor: 'text-black',
      labelColor: 'text-black/70'
    },
    {
      icon: UserCheck,
      value: stats.activeUsers || 0,
      label: 'Đang hoạt động',
      badge: 'ACTIVE',
      bgColor: 'bg-purple-400',
      badgeColor: 'bg-black text-purple-400',
      textColor: 'text-white',
      labelColor: 'text-white/80'
    },
    {
      icon: CheckCircle,
      value: stats.todayApprovals || 0,
      label: 'Duyệt hôm nay',
      badge: 'TODAY',
      bgColor: 'bg-pink-400',
      badgeColor: 'bg-black text-pink-400',
      textColor: 'text-black',
      labelColor: 'text-black/70'
    },
    {
      icon: TrendingUp,
      value: `+${stats.newUsersThisMonth || 0}`,
      label: 'User tháng này',
      badge: 'GROWTH',
      bgColor: 'bg-orange-400',
      badgeColor: 'bg-black text-orange-400',
      textColor: 'text-black',
      labelColor: 'text-black/70'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="group relative">
            <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
            <div className={`relative ${item.bgColor} border-4 border-black p-3 rounded-xl transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col`}>
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${item.textColor}`} />
                <div className={`${item.badgeColor} px-2 py-0.5 rounded-md font-black text-[9px] uppercase tracking-wider`}>
                  {item.badge}
                </div>
              </div>
              <p className={`text-3xl font-black ${item.textColor} mb-0.5`}>{item.value}</p>
              <p className={`text-[10px] font-black ${item.labelColor} uppercase tracking-wider`}>{item.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

