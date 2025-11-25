import React from 'react';
import { Award, Calendar, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const STATUS_COLORS = {
  cho_duyet: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  da_duyet: 'bg-green-100 text-green-800 border-green-200',
  tu_choi: 'bg-red-100 text-red-800 border-red-200',
  hoan_thanh: 'bg-blue-100 text-blue-800 border-blue-200'
};

const STATUS_LABELS = {
  cho_duyet: 'Chờ duyệt',
  da_duyet: 'Đã duyệt',
  tu_choi: 'Từ chối',
  hoan_thanh: 'Hoàn thành'
};

export default function DashboardActivityCard({ activity, onApprove, onReject }) {
  if (!activity) return null;

  const badgeClass = STATUS_COLORS[activity.trang_thai] || 'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200" data-ref="dashboard-activity-card">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg mb-2">{activity.ten_hd}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{activity.mo_ta}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badgeClass}`}>
          {STATUS_LABELS[activity.trang_thai] || 'Chưa rõ'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-yellow-500" />
          <span className="text-gray-600">Điểm:</span>
          <span className="font-medium">{activity.diem_rl}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span className="text-gray-600">Ngày:</span>
          <span className="font-medium">{activity.ngay_bd ? new Date(activity.ngay_bd).toLocaleDateString('vi-VN') : '—'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-green-500" />
          <span className="text-gray-600">Sức chứa:</span>
          <span className="font-medium">{activity.sl_toi_da || '—'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-500" />
          <span className="text-gray-600">Tạo:</span>
          <span className="font-medium">{activity.ngay_tao ? new Date(activity.ngay_tao).toLocaleDateString('vi-VN') : '—'}</span>
        </div>
      </div>

      {activity.trang_thai === 'cho_duyet' && (
        <div className="flex gap-2">
          <button
            onClick={() => onApprove?.(activity.id)}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
          >
            <CheckCircle className="w-4 h-4" />
            Phê duyệt
          </button>
          <button
            onClick={() => onReject?.(activity.id)}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
          >
            <AlertCircle className="w-4 h-4" />
            Từ chối
          </button>
        </div>
      )}
    </div>
  );
}


