import React from 'react';
import { Calendar, Users, MapPin, Award, Eye, CheckCircle, XCircle } from 'lucide-react';
import { getBestActivityImage } from '../../../../../shared/lib/activityImages';

export default function TeacherActivityGridCard({
  activity,
  statusLabels,
  statusColors,
  isWritable,
  onApprove,
  onReject,
  onViewDetail
}) {
  if (!activity) return null;

  const statusClass = statusColors[activity.trang_thai] || 'bg-gray-100 text-gray-600 border-gray-200';
  const statusLabel = statusLabels[activity.trang_thai] || 'Chưa xác định';

  return (
    <div className="group relative h-full" data-ref="teacher-activity-grid-card">
      <div className="relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col h-full">
        <div className="relative w-full h-40 overflow-hidden">
          <img
            src={getBestActivityImage(activity.hinh_anh, activity.loai_hd?.ten_loai_hd)}
            alt={activity.ten_hd}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusClass}`}>
              {statusLabel}
            </span>
          </div>
          {activity.diem_rl && (
            <div className="absolute bottom-3 right-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/95 backdrop-blur-sm text-white rounded-lg text-xs font-bold shadow">
                <Award className="h-3 w-3" />+{activity.diem_rl}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 p-4 space-y-3">
          <div>
            <h3 className="text-base font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
              {activity.ten_hd}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
              {activity.mo_ta || 'Chưa có mô tả'}
            </p>
          </div>

          <div className="space-y-2 text-xs font-medium text-gray-600">
            {activity.loai_hd?.ten_loai_hd && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-700 rounded border border-blue-200">
                <TagIcon />{activity.loai_hd.ten_loai_hd}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              {activity.ngay_bd ? new Date(activity.ngay_bd).toLocaleDateString('vi-VN') : 'Chưa xác định'}
            </div>
            {activity.dia_diem && (
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                {activity.dia_diem}
              </div>
            )}
            {activity.sl_toi_da && (
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-gray-400" />
                Sức chứa: {activity.sl_toi_da}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 pt-0 flex gap-2">
          {activity.trang_thai === 'cho_duyet' && isWritable ? (
            <>
              <button
                onClick={() => onApprove?.(activity.id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-semibold shadow hover:shadow-lg transition-all"
              >
                <CheckCircle className="h-4 w-4" />
                Duyệt
              </button>
              <button
                onClick={() => onReject?.(activity.id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg text-sm font-semibold shadow hover:shadow-lg transition-all"
              >
                <XCircle className="h-4 w-4" />
                Từ chối
              </button>
            </>
          ) : (
            <button
              onClick={() => onViewDetail?.(activity)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-sm font-semibold shadow hover:shadow-lg transition-all"
            >
              <Eye className="h-4 w-4" />
              Chi tiết
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TagIcon() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 5a3 3 0 013-3h5.586a2 2 0 011.414.586l6.414 6.414a2 2 0 010 2.828l-5.172 5.172a2 2 0 01-2.828 0L2.586 8.414A2 2 0 012 7V5z" />
    </svg>
  );
}


