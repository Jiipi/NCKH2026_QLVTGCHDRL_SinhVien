import React from 'react';
import { Calendar, Users, Clock, Eye, CheckCircle, XCircle, Award } from 'lucide-react';
import { getActivityImage } from '../../../../../shared/lib/activityImages';

export default function ActivityApprovalGridCard({
  activity,
  statusLabels,
  statusColors,
  viewMode,
  isWritable,
  onApprove,
  onReject,
  onViewDetail,
  formatDate
}) {
  if (!activity) return null;

  const statusClass = statusColors[activity.trang_thai] || 'bg-gray-100 text-gray-600 border-gray-200';
  const statusLabel = statusLabels[activity.trang_thai] || 'Không xác định';

  return (
    <div className="group relative h-full" data-ref="teacher-approval-grid-card">
      <div className="relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col h-full">
        <div className="relative w-full h-36 overflow-hidden">
          <img
            src={getActivityImage(activity.hinh_anh, activity.loai_hd?.ten_loai_hd)}
            alt={activity.ten_hd}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          <div className="absolute top-2 left-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusClass}`}>
              {statusLabel}
            </span>
          </div>

          {activity.diem_rl && (
            <div className="absolute bottom-2 right-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/95 backdrop-blur-sm text-white rounded-lg text-xs font-bold shadow-md">
                <Award className="h-3 w-3" />+{activity.diem_rl}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 p-4 space-y-3 relative z-10">
          <div>
            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors mb-1.5 leading-tight">
              {activity.ten_hd}
            </h3>
            {activity.loai_hd?.ten_loai_hd && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-200">
                <Calendar className="h-3 w-3" />
                {activity.loai_hd.ten_loai_hd}
              </span>
            )}
          </div>

          {activity.nguoi_tao && (
            <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-1 ring-white">
                {activity.nguoi_tao.ho_ten?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{activity.nguoi_tao.ho_ten || 'Không rõ tên'}</p>
                {activity.nguoi_tao.sinh_vien?.lop?.ten_lop && (
                  <p className="text-xs text-gray-600 truncate">Lớp: {activity.nguoi_tao.sinh_vien.lop.ten_lop}</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-1.5 text-xs">
            {activity.ngay_bd && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-900 font-medium">{formatDate(activity.ngay_bd)}</span>
              </div>
            )}
            {activity.dia_diem && (
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600 truncate">{activity.dia_diem}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 pt-0 mt-auto flex gap-2">
          {viewMode === 'pending' && activity.trang_thai === 'cho_duyet' ? (
            <>
              <button
                onClick={() => onApprove?.(activity.id)}
                disabled={!isWritable}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Duyệt
              </button>
              <button
                onClick={() => onReject?.(activity.id)}
                disabled={!isWritable}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="h-3.5 w-3.5" />
                Từ chối
              </button>
            </>
          ) : (
            <button
              onClick={() => onViewDetail?.(activity)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Eye className="h-3.5 w-3.5" />
              Chi tiết
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


