import React from 'react';
import { Calendar, Users, MapPin, Award, Eye, CheckCircle, XCircle } from 'lucide-react';
import ActivityImageSlideshow from '../../../../../shared/components/ActivityImageSlideshow';

export default function TeacherActivityListItem({
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
    <div className="group relative" data-ref="teacher-activity-list-item">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity" />
      <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-4 hover:shadow-lg transition-all flex gap-4">
        <div className="relative w-40 h-28 flex-shrink-0 rounded-xl overflow-hidden">
          <ActivityImageSlideshow
            images={activity.hinh_anh}
            activityType={activity.loai_hd?.ten_loai_hd}
            alt={activity.ten_hd}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            showDots={true}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute top-2 left-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusClass}`}>
              {statusLabel}
            </span>
          </div>
          {activity.diem_rl && (
            <div className="absolute bottom-2 right-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/95 text-white rounded-lg text-xs font-bold shadow">
                <Award className="h-3 w-3" />+{activity.diem_rl}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-snug mb-1 line-clamp-1">{activity.ten_hd}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{activity.mo_ta || 'Chưa có mô tả'}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-gray-600 mt-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              {activity.ngay_bd ? new Date(activity.ngay_bd).toLocaleDateString('vi-VN') : 'Chưa rõ'}
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-gray-400" />
              {activity.sl_toi_da ? `Sức chứa ${activity.sl_toi_da}` : 'Không giới hạn'}
            </div>
            {activity.dia_diem && (
              <div className="flex items-center gap-1.5 col-span-2">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                {activity.dia_diem}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-center gap-2">
          {activity.trang_thai === 'cho_duyet' && isWritable ? (
            <>
              <button
                onClick={() => onApprove?.(activity.id)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold shadow hover:shadow-lg transition-all"
              >
                <CheckCircle className="h-4 w-4" />
                Duyệt
              </button>
              <button
                onClick={() => onReject?.(activity.id)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-semibold shadow hover:shadow-lg transition-all"
              >
                <XCircle className="h-4 w-4" />
                Từ chối
              </button>
            </>
          ) : (
            <button
              onClick={() => onViewDetail?.(activity)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold shadow hover:shadow-lg transition-all"
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


