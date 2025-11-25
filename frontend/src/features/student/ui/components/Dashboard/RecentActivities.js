import React from 'react';
import { Activity, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    badge: { bg: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Chờ duyệt' },
    points: 'bg-orange-500'
  },
  approved: {
    badge: { bg: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Đã duyệt' },
    points: 'bg-green-500'
  },
  joined: {
    badge: { bg: 'bg-blue-100 text-blue-700', icon: CheckCircle, label: 'Đã tham gia' },
    points: 'bg-blue-500'
  },
  rejected: {
    badge: { bg: 'bg-red-100 text-red-700', icon: XCircle, label: 'Bị từ chối' },
    points: 'bg-red-500'
  }
};

export default function RecentActivities({
  recentActivities = [],
  recentFilter = 'all',
  onFilterChange = () => {},
  onViewAll = () => {},
  onSelectActivity = () => {},
  myActivities = {},
  formatNumber = (value) => value
}) {
  const counts = {
    all: myActivities.all?.length || 0,
    pending: myActivities.pending?.length || 0,
    approved: myActivities.approved?.length || 0,
    joined: myActivities.joined?.length || 0,
    rejected: myActivities.rejected?.length || 0
  };

  const filters = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ duyệt' },
    { key: 'approved', label: 'Đã duyệt' },
    { key: 'joined', label: 'Đã tham gia' },
    { key: 'rejected', label: 'Bị từ chối' }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-purple-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 font-bold text-sm">
          <Activity className="w-5 h-5" />
          Hoạt động gần đây
        </div>
        <button
          onClick={onViewAll}
          className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
        >
          Xem tất cả →
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onFilterChange(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              recentFilter === key
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
            }`}
          >
            {label} ({counts[key]})
          </button>
        ))}
      </div>

      <div
        className="max-h-[500px] overflow-y-auto pr-2 space-y-3"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#a855f7 #f3f4f6' }}
      >
        {recentActivities.length > 0 ? (
          recentActivities.map((activity, idx) => {
            const activityData = activity.activity || activity;
            const status = normalizeStatus(activity.trang_thai_dk || activity.status);
            const config = STATUS_CONFIG[status];
            const location =
              activity.dia_diem ||
              activityData.dia_diem ||
              activity.activity?.dia_diem ||
              activity.hoat_dong?.dia_diem ||
              activityData.location ||
              activity.location ||
              'N/A';
            const displayDate =
              activity.ngay_tham_gia ||
              activity.ngay_bd ||
              activityData.ngay_bd ||
              activityData.ngay_tham_gia ||
              activity.hoat_dong?.ngay_bd ||
              null;

            return (
              <div
                key={activity.id || activity.activity_id || idx}
                className="group/item cursor-pointer bg-gradient-to-br rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
                style={{ background: resolveBackground(status) }}
                onClick={() => onSelectActivity(activity)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900 flex-1 text-sm leading-tight">
                    {activityData.ten_hd || activityData.name || 'Hoạt động'}
                  </h3>
                  <div className="ml-2 flex items-center gap-2">
                    {config && (
                      <span className={`${config.badge.bg} px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
                        <config.badge.icon className="h-3 w-3" />
                        {config.badge.label}
                      </span>
                    )}
                    <span className={`${config?.points || 'bg-blue-500'} text-white px-2.5 py-1 rounded-full text-xs font-medium`}>
                      +{formatNumber(activityData.diem_rl || activity.diem_rl || 0)}đ
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-700 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {displayDate ? new Date(displayDate).toLocaleDateString('vi-VN') : 'N/A'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {location}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500 font-medium">Không có hoạt động nào</div>
        )}
      </div>
    </div>
  );
}

function normalizeStatus(status = '') {
  const value = status.toLowerCase();
  if (value === 'cho_duyet' || value === 'pending') return 'pending';
  if (value === 'da_duyet' || value === 'approved') return 'approved';
  if (value === 'da_tham_gia' || value === 'participated' || value === 'attended') return 'joined';
  if (value === 'tu_choi' || value === 'rejected') return 'rejected';
  return 'pending';
}

function resolveBackground(status) {
  switch (status) {
    case 'pending':
      return 'linear-gradient(to bottom right, #fef9c3, #fef3c7)';
    case 'approved':
      return 'linear-gradient(to bottom right, #dcfce7, #d1fae5)';
    case 'joined':
      return 'linear-gradient(to bottom right, #dbeafe, #e0e7ff)';
    case 'rejected':
      return 'linear-gradient(to bottom right, #fee2e2, #fecaca)';
    default:
      return 'linear-gradient(to bottom right, #dbeafe, #e0e7ff)';
  }
}

