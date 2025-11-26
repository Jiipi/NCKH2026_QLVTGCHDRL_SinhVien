import React from 'react';
import { Activity, Users, TrendingUp } from 'lucide-react';

export default function TeacherStatsDetails({ stats }) {
  const detailItems = [
    {
      icon: Activity,
      value: stats.totalRegistrations || 0,
      label: 'Lượt đăng ký hoạt động',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: Users,
      value: stats.totalStudents || 0,
      label: 'Tổng sinh viên quản lý',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      icon: TrendingUp,
      value: `${Math.round(stats.participationRate || 0)}%`,
      label: 'Tỷ lệ sinh viên tham gia',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết thống kê</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {detailItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-center gap-4">
              <div className={`p-3 ${item.bgColor} rounded-lg`}>
                <Icon className={`w-6 h-6 ${item.iconColor}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                <div className="text-sm text-gray-600">{item.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

