import React from 'react';
import { Users, Calendar, AlertCircle, Activity, Clock, Target, Trophy, Star } from 'lucide-react';

export default function MonitorStatsGrid({
  monitorPoints,
  totalPointsProgress,
  totalStudents,
  activitiesJoined,
  pendingApprovals,
  totalActivities,
  upcomingCount,
  classRank,
  goalPoints,
  goalText,
  formatNumber
}) {
  const cards = [
    {
      key: 'personalPoints',
      className: 'col-span-2 group relative',
      content: (
        <>
          <p className="text-white/90 font-black text-[10px] uppercase tracking-wider mb-1">ĐIỂM CÁ NHÂN CỦA TÔI</p>
          <div className="flex items-baseline gap-1">
            <p className="text-4xl font-black text-white">{formatNumber(monitorPoints)}</p>
            <p className="text-sm font-bold text-white/70">/100</p>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex-1">
              <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-1000" style={{ width: `${Math.min(totalPointsProgress, 100)}%` }}></div>
              </div>
            </div>
            <p className="text-white font-black text-lg ml-2">
              <span className="text-[10px] font-bold text-white/80">TIẾN ĐỘ </span>
              {formatNumber(totalPointsProgress)}%
            </p>
          </div>
        </>
      ),
      wrapperClass: 'bg-gradient-to-br from-pink-400 via-purple-500 to-purple-600',
      label: null
    },
    {
      key: 'students',
      icon: Users,
      label: 'LỚP HỌC',
      value: totalStudents,
      description: 'SINH VIÊN',
      wrapperClass: 'bg-blue-400',
      textColor: 'text-white',
      badgeColor: 'text-blue-400'
    },
    {
      key: 'activitiesJoined',
      icon: Calendar,
      label: 'THAM GIA',
      value: activitiesJoined,
      description: 'HOẠT ĐỘNG',
      wrapperClass: 'bg-yellow-400',
      textColor: 'text-black',
      badgeColor: 'text-yellow-400',
      badgeTextColor: 'text-black'
    },
    {
      key: 'pendingApprovals',
      icon: AlertCircle,
      label: 'CHỜ DUYỆT',
      value: pendingApprovals,
      description: 'CHỜ DUYỆT',
      wrapperClass: 'bg-orange-400',
      textColor: 'text-black'
    },
    {
      key: 'approvedActivities',
      icon: Activity,
      label: 'ĐÃ DUYỆT',
      value: totalActivities,
      description: 'HOẠT ĐỘNG LỚP',
      wrapperClass: 'bg-purple-400',
      textColor: 'text-white',
      badgeColor: 'text-purple-400'
    },
    {
      key: 'upcoming',
      icon: Clock,
      label: 'SẮP TỚI',
      value: upcomingCount,
      description: 'HOẠT ĐỘNG',
      wrapperClass: 'bg-pink-400',
      textColor: 'text-black'
    },
    {
      key: 'classRank',
      icon: Trophy,
      label: 'HẠNG CỦA TÔI',
      value: `${classRank}/${totalStudents}`,
      description: null,
      wrapperClass: 'bg-blue-500',
      textColor: 'text-white',
      extraIcon: Star
    },
    {
      key: 'goal',
      icon: Target,
      label: 'MỤC TIÊU',
      value: goalPoints > 0 ? goalPoints : '🎉',
      description: goalPoints > 0 ? goalText : 'ĐÃ ĐẠT XUẤT SẮC',
      wrapperClass: 'bg-green-400',
      textColor: 'text-black'
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((card) => {
        if (card.key === 'personalPoints') {
          return (
            <div key={card.key} className={card.className}>
              <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
              <div className={`relative ${card.wrapperClass} border-4 border-black p-3 rounded-xl h-full transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5`}>
                {card.content}
              </div>
            </div>
          );
        }

        const Icon = card.icon;
        const ExtraIcon = card.extraIcon;

        return (
          <div key={card.key} className="group relative">
            <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
            <div className={`relative ${card.wrapperClass} border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col`}>
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${card.textColor}`} />
                {card.label && (
                  <div className={`bg-black ${card.badgeColor || card.textColor} px-2 py-0.5 rounded-md font-black text-[9px] uppercase tracking-wider`}>
                    {card.label}
                  </div>
                )}
                {ExtraIcon && <ExtraIcon className="w-4 h-4 text-white" />}
              </div>
              <p className={`text-3xl font-black ${card.textColor} mb-0.5`}>{card.value}</p>
              {card.description && (
                <p className={`text-[10px] font-black ${card.textColor?.includes('text-black') ? 'text-black/70' : 'text-white/80'} uppercase tracking-wider`}>
                  {card.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

