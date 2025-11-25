import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

export default function UpcomingActivities({
  upcoming = [],
  onViewAll = () => {},
  onSelectActivity = () => {},
  formatNumber = (value) => value
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 font-bold text-sm">
          <Calendar className="w-5 h-5" />
          Hoạt động sắp tới
        </div>
        <button
          onClick={onViewAll}
          className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
        >
          Xem tất cả →
        </button>
      </div>
      <div
        className="max-h-[500px] overflow-y-auto pr-2 space-y-3"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#a855f7 #f3f4f6' }}
      >
        {upcoming.length > 0 ? (
          upcoming.map((activity, idx) => {
            const activityData = activity.activity || activity;
            const startDate = activity.ngay_bd ? new Date(activity.ngay_bd) : null;
            const daysUntil = startDate ? Math.ceil((startDate - new Date()) / (1000 * 60 * 60 * 24)) : null;

            return (
              <div
                key={activity.id || idx}
                className="group/item cursor-pointer bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
                onClick={() => onSelectActivity(activity)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900 flex-1 text-sm leading-tight">
                    {activityData.ten_hd || activityData.name || 'Hoạt động'}
                  </h3>
                  <span className="bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-bold ml-2 whitespace-nowrap">
                    {daysUntil !== null ? `+${daysUntil}d` : `+${formatNumber(activityData.diem_rl || 0)}đ`}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-700 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {activity.ngay_bd ? new Date(activity.ngay_bd).toLocaleDateString('vi-VN') : 'N/A'}
                  </span>
                  {(activity.dia_diem || activityData.dia_diem) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {activity.dia_diem || activityData.dia_diem}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="font-semibold text-gray-900">Chưa có hoạt động sắp tới</p>
            <p className="text-gray-600 text-sm">Chọn học kỳ khác hoặc kiểm tra sau</p>
          </div>
        )}
      </div>
    </div>
  );
}

