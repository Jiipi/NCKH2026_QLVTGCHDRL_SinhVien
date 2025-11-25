import React from 'react';
import { Clock, MapPin, Users, Calendar, CheckCircle, XCircle, Activity } from 'lucide-react';

/**
 * ActivityListItem Component - Item trong danh sách hoạt động
 */
export default function ActivityListItem({ 
  activity, 
  onClick, 
  formatNumber,
  variant = 'upcoming' // 'upcoming' | 'recent'
}) {
  if (variant === 'upcoming') {
    return (
      <div 
        onClick={onClick} 
        className="group/item cursor-pointer bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-900 flex-1 text-sm leading-tight">{activity.ten_hd}</h3>
          <span className="bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-bold ml-2 whitespace-nowrap">
            +{activity.diem_rl} điểm
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-700 font-medium">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {new Date(activity.ngay_bd).toLocaleDateString('vi-VN')}
          </span>
          {activity.dia_diem && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {activity.dia_diem}
            </span>
          )}
          {activity.registeredStudents > 0 && (
            <span className="flex items-center gap-1 ml-auto text-blue-600">
              <Users className="h-3.5 w-3.5" />
              {activity.registeredStudents} SV
            </span>
          )}
        </div>
      </div>
    );
  }

  // Recent variant
  const activityData = activity.activity || activity.hoat_dong || activity;
  const status = (activity.trang_thai_dk || activity.status || activity.trang_thai || '').toLowerCase();
  const points = activityData.diem_rl || activity.diem_rl || 0;
  const statusConfig = {
    cho_duyet: { label: 'Chờ duyệt', icon: Clock, color: 'text-yellow-700', bg: 'bg-yellow-100', pointsBg: 'bg-orange-500' },
    da_duyet: { label: 'Đã duyệt', icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-100', pointsBg: 'bg-green-500' },
    da_tham_gia: { label: 'Đã tham gia', icon: CheckCircle, color: 'text-blue-700', bg: 'bg-blue-100', pointsBg: 'bg-blue-500' },
    tu_choi: { label: 'Bị từ chối', icon: XCircle, color: 'text-red-700', bg: 'bg-red-100', pointsBg: 'bg-red-500' },
    default: { label: 'N/A', icon: Activity, color: 'text-gray-700', bg: 'bg-gray-100', pointsBg: 'bg-gray-500' },
  };
  const currentStatus = statusConfig[status] || statusConfig.default;
  const StatusIcon = currentStatus.icon;
  const activityName = activityData.ten_hd || activity.ten_hd || 'Hoạt động';
  const location = activityData.dia_diem || '';
  const displayDate = activityData.ngay_bd ? new Date(activityData.ngay_bd).toLocaleDateString('vi-VN') : 'N/A';

  return (
    <div 
      onClick={onClick} 
      className={`group/item cursor-pointer rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 ${currentStatus.bg.replace('bg-', 'bg-opacity-50 ')}`}
    >
      <div className="flex justify-between items-start mb-2 gap-2">
        <h3 className="font-bold text-gray-900 flex-1 text-sm leading-tight">{activityName}</h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          {points > 0 && (
            <span className={`text-white px-2.5 py-1 rounded-full text-xs font-bold ${currentStatus.pointsBg}`}>
              +{formatNumber(points)}đ
            </span>
          )}
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${currentStatus.bg} ${currentStatus.color}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {currentStatus.label}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-600 font-medium">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          {displayDate}
        </span>
        {location && (
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-gray-400" />
            {location}
          </span>
        )}
      </div>
    </div>
  );
}

