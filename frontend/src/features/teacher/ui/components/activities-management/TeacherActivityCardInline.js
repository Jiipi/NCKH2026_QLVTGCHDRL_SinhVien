import React from 'react';
import { Calendar, MapPin, Users, Award, CheckCircle, XCircle, Eye } from 'lucide-react';
import { getBestActivityImage } from '../../../../../shared/lib/activityImages';

export default function TeacherActivityCardInline({
  activity,
  viewMode,
  getStatusColor,
  getStatusLabel,
  getTypeColor,
  isWritable,
  onApprove,
  onReject,
  onViewDetail
}) {
  if (!activity) return null;

  const statusColor = getStatusColor(activity.trang_thai);
  const statusLabel = getStatusLabel(activity.trang_thai);
  const registeredCount = activity.registrationCount ?? activity.so_dang_ky ?? activity._count?.dang_ky_hd ?? 0;
  const capacity = activity.sl_toi_da ?? activity.so_luong_toi_da ?? 0;
  const isPending = activity.trang_thai === 'cho_duyet';
  const activityImage = getBestActivityImage(activity);
  const hasImage = activityImage && !String(activityImage).endsWith('default-activity.svg');

  if (viewMode === 'list') {
    return (
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-200"></div>
        <div className={`relative bg-white border-2 rounded-xl hover:shadow-lg transition-all duration-200 ${isPending ? 'border-amber-200 shadow-lg shadow-amber-100' : 'border-gray-200'}`}>
          <div className="flex items-stretch gap-4 p-4">
            {/* Activity Visual */}
            <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
              {hasImage ? (
                <img
                  src={activityImage}
                  alt={activity.ten_hd || 'Hoạt động'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{
                    background: `linear-gradient(135deg, ${getTypeColor(activity)} 0%, ${getTypeColor(activity)}CC 60%, ${getTypeColor(activity)}99 100%)`
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              
              {/* Status Badge */}
              <div className="absolute top-2 left-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColor}`}>
                  {statusLabel}
                </span>
              </div>
              
              {/* Points Badge */}
              {activity.diem_rl && (
                <div className="absolute bottom-2 left-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/90 backdrop-blur-sm text-white shadow-sm text-xs font-bold">
                    <Award className="h-3 w-3" />+{activity.diem_rl}
                  </span>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2">
                  {activity.ten_hd || 'Chưa có tên'}
                </h3>
                
                {/* Activity Details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {activity.loai_hd?.ten_loai_hd && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getTypeColor(activity) }}></span>
                      <span className="text-gray-700 truncate" style={{ color: getTypeColor(activity) }}>{activity.loai_hd.ten_loai_hd}</span>
                    </div>
                  )}
                  {activity.ngay_bd && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-900 font-medium">{new Date(activity.ngay_bd).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                  {activity.dia_diem && (
                    <div className="flex items-center gap-1.5 col-span-2">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-600 truncate">{activity.dia_diem}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-900 font-medium">{registeredCount} / {capacity}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col justify-center gap-2 flex-shrink-0">
              {isPending && isWritable ? (
                <>
                  <button
                    onClick={() => onApprove(activity.id)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px]"
                  >
                    <CheckCircle className="h-4 w-4" />Duyệt
                  </button>
                  <button
                    onClick={() => onReject(activity.id)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px]"
                  >
                    <XCircle className="h-4 w-4" />Từ chối
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onViewDetail(activity.id)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px]"
                >
                  <Eye className="h-4 w-4" />Chi tiết
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="group relative h-full">
      <div className={`relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col h-full ${isPending ? 'border-amber-200 shadow-lg shadow-amber-100' : ''}`}>
        {/* Activity Visual */}
        <div className="relative w-full h-36 overflow-hidden">
          {hasImage ? (
            <img
              src={activityImage}
              alt={activity.ten_hd || 'Hoạt động'}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${getTypeColor(activity)} 0%, ${getTypeColor(activity)}CC 60%, ${getTypeColor(activity)}99 100%)`
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          
          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
          
          {/* Points Badge */}
          {activity.diem_rl && (
            <div className="absolute bottom-2 right-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/95 backdrop-blur-sm text-white rounded-lg text-xs font-bold shadow-md">
                <Award className="h-3 w-3" />+{activity.diem_rl}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-3 relative z-10">
          <div>
            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors mb-1.5 leading-tight">
              {activity.ten_hd || 'Chưa có tên'}
            </h3>
            {activity.loai_hd?.ten_loai_hd && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-200">
                <Calendar className="h-3 w-3" />{activity.loai_hd.ten_loai_hd}
              </span>
            )}
          </div>

          {/* Activity Info */}
          <div className="space-y-1.5">
            {activity.ngay_bd && (
              <div className="flex items-center gap-1.5 text-xs">
                <Calendar className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-900 font-medium">{new Date(activity.ngay_bd).toLocaleDateString('vi-VN')}</span>
              </div>
            )}
            {activity.dia_diem && (
              <div className="flex items-center gap-1.5 text-xs">
                <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600 truncate">{activity.dia_diem}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs">
              <Users className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-gray-900 font-medium">{registeredCount} / {capacity} người</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 pt-0 mt-auto flex gap-2">
          {isPending && isWritable ? (
            <>
              <button
                onClick={() => onApprove(activity.id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="h-3.5 w-3.5" />Duyệt
              </button>
              <button
                onClick={() => onReject(activity.id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="h-3.5 w-3.5" />Từ chối
              </button>
            </>
          ) : (
            <button
              onClick={() => onViewDetail(activity.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Eye className="h-3.5 w-3.5" />Chi tiết
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

