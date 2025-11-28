import React from 'react';
import { Calendar, Clock, MapPin, Users, Activity, CheckCircle, XCircle } from 'lucide-react';

export default function MonitorActivitiesPanel({
  activeTab,
  onTabChange,
  recentFilter,
  onRecentFilterChange,
  recentCounts,
  filteredRecent,
  upcomingActivities,
  onActivityClick,
  onCreateActivity,
  onViewAllActivities,
  formatNumber
}) {
  const recentFilters = [
    { label: 'Tất cả', value: 'all', count: recentCounts.all },
    { label: 'Chờ duyệt', value: 'cho_duyet', count: recentCounts.cho_duyet },
    { label: 'Đã duyệt', value: 'da_duyet', count: recentCounts.da_duyet },
    { label: 'Đã tham gia', value: 'da_tham_gia', count: recentCounts.da_tham_gia },
    { label: 'Bị từ chối', value: 'tu_choi', count: recentCounts.tu_choi }
  ];

  const statusConfig = {
    cho_duyet: { label: 'Chờ duyệt', icon: Clock, color: 'text-yellow-700', bg: 'bg-yellow-100', pointsBg: 'bg-orange-500' },
    da_duyet: { label: 'Đã duyệt', icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-100', pointsBg: 'bg-green-500' },
    da_tham_gia: { label: 'Đã tham gia', icon: CheckCircle, color: 'text-blue-700', bg: 'bg-blue-100', pointsBg: 'bg-blue-500' },
    tu_choi: { label: 'Bị từ chối', icon: XCircle, color: 'text-red-700', bg: 'bg-red-100', pointsBg: 'bg-red-500' },
    default: { label: 'N/A', icon: Activity, color: 'text-gray-700', bg: 'bg-gray-100', pointsBg: 'bg-gray-500' }
  };

  return (
    <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => onTabChange('upcoming')}
            className={`px-4 py-2 rounded-lg inline-flex items-center gap-2 font-bold text-sm transition-all ${
              activeTab === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Hoạt động sắp diễn ra
          </button>
          <button
            onClick={() => onTabChange('recent')}
            className={`px-4 py-2 rounded-lg inline-flex items-center gap-2 font-bold text-sm transition-all ${
              activeTab === 'recent' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Clock className="w-5 h-5" />
            Hoạt động gần đây
          </button>
        </div>
        <button onClick={onViewAllActivities} className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">
          Xem tất cả →
        </button>
      </div>

      <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#a855f7 #f3f4f6' }}>
        {activeTab === 'upcoming' ? (
          <>
            {upcomingActivities?.length ? (
              upcomingActivities.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => onActivityClick(activity.id)}
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
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="mb-2">Chưa có hoạt động sắp diễn ra</p>
                <button onClick={onCreateActivity} className="mt-2 text-purple-600 hover:text-purple-700 font-medium text-sm">
                  Tạo hoạt động đầu tiên →
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {recentFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => onRecentFilterChange(filter.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-2 border ${
                    recentFilter === filter.value ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {filter.label}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${recentFilter === filter.value ? 'bg-white/20' : 'bg-gray-200 text-gray-600'}`}>
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
            {filteredRecent?.length ? (
              filteredRecent.map((activity, idx) => {
                const activityData = activity.activity || activity.hoat_dong || activity;
                const status = (activity.trang_thai_dk || activity.status || activity.trang_thai || '').toLowerCase();
                const points = activityData.diem_rl || activity.diem_rl || 0;
                const currentStatus = statusConfig[status] || statusConfig.default;
                const StatusIcon = currentStatus.icon;
                const activityName = activityData.ten_hd || activity.ten_hd || 'Hoạt động';
                const location = activityData.dia_diem || '';
                const displayDate = activityData.ngay_bd ? new Date(activityData.ngay_bd).toLocaleDateString('vi-VN') : 'N/A';
                const activityId = activityData.id || activity.id;

                return (
                  <div
                    key={activity.id || idx}
                    onClick={() => activityId && onActivityClick(activityId)}
                    className={`group/item cursor-pointer rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 ${currentStatus.bg.replace('bg-', 'bg-opacity-50 ')}`}
                  >
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="font-bold text-gray-900 flex-1 text-sm leading-tight">{activityName}</h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {points > 0 && (
                          <span className={`text-white px-2.5 py-1 rounded-full text-xs font-bold ${currentStatus.pointsBg}`}>+{formatNumber(points)}đ</span>
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
              })
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="mb-2">Không có hoạt động nào khớp với bộ lọc</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

