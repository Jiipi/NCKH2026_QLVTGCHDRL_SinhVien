import React from 'react';
import { Trophy, Activity, Users } from 'lucide-react';

export default function TopActivitiesList({ activities = [], totalDailyRegs = 0 }) {
  if (!activities.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">Top hoạt động theo số đăng ký</h3>
        </div>
        <p className="text-sm text-gray-500">Hiện chưa có dữ liệu.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">Top hoạt động theo số đăng ký</h3>
        </div>
        <div className="text-sm text-gray-500 flex items-center gap-1">
          <Activity className="h-4 w-4 text-gray-400" />
          Tổng đăng ký/ngày: <span className="font-semibold text-gray-900">{totalDailyRegs}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((activity, index) => (
          <div
            key={activity.id || index}
            className="border border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-white transition shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-lg font-semibold text-gray-700">#{index + 1}</span>
              <div className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-700">
                <Users className="h-3.5 w-3.5 text-gray-500" />
                {activity.count}
              </div>
            </div>
            <p className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{activity.ten_hd}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Activity className="h-3 w-3 text-gray-400" />
              Lượt đăng ký
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

