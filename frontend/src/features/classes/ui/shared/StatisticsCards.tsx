import React from 'react';
import { Users, BookOpen, TrendingUp, Award } from 'lucide-react';

/**
 * StatisticsCards - Statistics cards component
 */
export default function StatisticsCards({ statistics }) {
  const cards = [
    {
      label: 'Tổng SV',
      value: statistics.totalStudents,
      subLabel: 'Sinh viên trong lớp',
      icon: Users,
      iconColor: 'text-indigo-600'
    },
    {
      label: 'Hoạt động',
      value: statistics.totalActivities,
      subLabel: 'Đã tham gia',
      icon: BookOpen,
      iconColor: 'text-green-600'
    },
    {
      label: 'Tham gia',
      value: `${statistics.participationRate}%`,
      subLabel: `${statistics.totalParticipants} lượt tham gia`,
      icon: TrendingUp,
      iconColor: 'text-purple-600'
    },
    {
      label: 'Điểm TB',
      value: statistics.averageScore,
      subLabel: 'Điểm rèn luyện',
      icon: Award,
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500 mt-1">{card.subLabel}</p>
              </div>
              <Icon className={`w-8 h-8 ${card.iconColor} opacity-20`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

