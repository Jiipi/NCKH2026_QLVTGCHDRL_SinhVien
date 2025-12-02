import React from 'react';
import { Calendar, Users, Clock, Eye, CheckCircle, XCircle, Award, CalendarClock, CalendarCheck, CalendarX, MapPin } from 'lucide-react';
import ActivityImageSlideshow from '../../../../../shared/components/ActivityImageSlideshow';

export default function ActivityApprovalListItem({
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
    <div className="group relative" data-ref="teacher-approval-list-item">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-200" />
      <div className="relative bg-white border-2 border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200">
        <div className="flex items-stretch gap-4 p-4">
          <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
            <ActivityImageSlideshow
              images={activity.hinh_anh}
              activityType={activity.loai_hd?.ten_loai_hd}
              alt={activity.ten_hd}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              showDots={true}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <div className="absolute top-2 left-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusClass}`}>
                {statusLabel}
              </span>
            </div>
            {activity.diem_rl && (
              <div className="absolute bottom-2 left-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/90 backdrop-blur-sm text-white shadow-sm text-xs font-bold">
                  <Award className="h-3 w-3" />+{activity.diem_rl}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2">
                {activity.ten_hd}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-gray-600 truncate">{activity.loai_hd?.ten_loai_hd || 'Chưa phân loại'}</span>
                </div>
                {activity.ngay_bd && (
                  <div className="flex items-center gap-1.5">
                    <CalendarClock className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-gray-900 font-medium">
                      BĐ: {new Date(activity.ngay_bd).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}, {new Date(activity.ngay_bd).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
                {activity.ngay_kt && (
                  <div className="flex items-center gap-1.5">
                    <CalendarCheck className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-gray-900 font-medium">
                      KT: {new Date(activity.ngay_kt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}, {new Date(activity.ngay_kt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
                {activity.han_dk && (
                  <div className="flex items-center gap-1.5">
                    <CalendarX className={`h-3.5 w-3.5 ${new Date(activity.han_dk) < new Date() ? 'text-red-500' : 'text-orange-500'}`} />
                    <span className={`font-medium ${new Date(activity.han_dk) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                      Hạn ĐK: {new Date(activity.han_dk).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}, {new Date(activity.han_dk).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
                {activity.nguoi_tao && (
                  <div className="flex items-center gap-1.5 col-span-2">
                    <Users className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-600 truncate">
                      {activity.nguoi_tao.ho_ten}
                      {activity.nguoi_tao.sinh_vien?.lop?.ten_lop && ` - ${activity.nguoi_tao.sinh_vien.lop.ten_lop}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-2 flex-shrink-0">
            {viewMode === 'pending' && activity.trang_thai === 'cho_duyet' ? (
              <>
                <button
                  onClick={() => onApprove?.(activity.id)}
                  disabled={!isWritable}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="h-4 w-4" />
                  Duyệt
                </button>
                <button
                  onClick={() => onReject?.(activity.id)}
                  disabled={!isWritable}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="h-4 w-4" />
                  Từ chối
                </button>
              </>
            ) : (
              <button
                onClick={() => onViewDetail?.(activity)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px]"
              >
                <Eye className="h-4 w-4" />
                Chi tiết
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


