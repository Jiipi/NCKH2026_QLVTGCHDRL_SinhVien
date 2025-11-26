import React from 'react';
import { Activity, Users, TrendingUp, Award } from 'lucide-react';

export default function TeacherStatsGrid({ stats }) {
  const statCards = [
    {
      icon: Activity,
      value: stats.totalActivities || 0,
      label: 'Tổng hoạt động',
      subLabel: 'Trong khoảng thời gian',
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-white bg-opacity-20',
      textColor: 'text-blue-200'
    },
    {
      icon: Users,
      value: stats.totalStudents || 0,
      label: 'Sinh viên tham gia',
      subLabel: 'Tổng số sinh viên',
      gradient: 'from-green-500 to-green-600',
      iconBg: 'bg-white bg-opacity-20',
      textColor: 'text-green-200'
    },
    {
      icon: TrendingUp,
      value: `${Math.round(stats.participationRate || 0)}%`,
      label: 'Tỷ lệ tham gia',
      subLabel: 'Trung bình',
      gradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-white bg-opacity-20',
      textColor: 'text-purple-200'
    },
    {
      icon: Award,
      value: parseFloat(stats.averageScore || 0).toFixed(1),
      label: 'Điểm trung bình',
      subLabel: 'Điểm rèn luyện',
      gradient: 'from-orange-500 to-orange-600',
      iconBg: 'bg-white bg-opacity-20',
      textColor: 'text-orange-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className={`bg-gradient-to-br ${card.gradient} rounded-xl p-6 text-white`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${card.iconBg} rounded-lg`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className={`${card.textColor} text-sm`}>{card.label}</span>
            </div>
            <div className="text-3xl font-bold mb-1">{card.value}</div>
            <div className={`${card.textColor} text-sm`}>{card.subLabel}</div>
          </div>
        );
      })}
    </div>
  );
}

