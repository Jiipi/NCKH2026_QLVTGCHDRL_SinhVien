import React from 'react';
import { Calendar, Clock, MapPin, Award, Eye, Trophy, XCircle, AlertCircle, CalendarClock, CalendarCheck, CalendarX, Camera } from 'lucide-react';
import { getActivityImage, getActivityImages } from '../../../../../shared/lib/activityImages';
import ActivityImageSlideshow from '../../../../../shared/components/ActivityImageSlideshow';

/**
 * MyActivityCard Component - Card hiển thị hoạt động của tôi
 */
export default function MyActivityCard({
  registration,
  displayViewMode,
  formatDate,
  getStatusBadge,
  handleViewDetail,
  handleShowQR,
  handleFaceAttendance,
  handleCancel,
  isWritable
}) {
  const activity = registration.hoat_dong || {};
  
  const canCancel = registration.trang_thai_dk === 'cho_duyet';
  const canShowQR = registration.trang_thai_dk === 'da_duyet';

  if (displayViewMode === 'list') {
    return (
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-200"></div>
        <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/65 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-xl dark:border-white/10 dark:bg-slate-950/50">
          <div className="flex items-stretch gap-4 p-4">
            <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
              <ActivityImageSlideshow
                images={activity.hinh_anh}
                activityType={activity.loai_hd?.ten_loai_hd}
                alt={activity.ten_hd}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                showDots={true}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
              <div className="absolute top-2 left-2">{getStatusBadge(registration.trang_thai_dk)}</div>
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
                <h3 className="mb-2 line-clamp-1 text-base font-bold text-slate-950 transition-colors group-hover:text-indigo-600 dark:text-white">{activity.ten_hd}</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <span className="truncate text-slate-600 dark:text-slate-300">{activity.loai_hd?.ten_loai_hd || activity.loai || 'Chưa phân loại'}</span>
                  </div>
                  {activity.ngay_bd && (
                    <div className="flex items-center gap-1.5">
                      <CalendarClock className="h-3.5 w-3.5 text-blue-500" />
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        BĐ: {new Date(activity.ngay_bd).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}, {new Date(activity.ngay_bd).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  {activity.ngay_kt && (
                    <div className="flex items-center gap-1.5">
                      <CalendarCheck className="h-3.5 w-3.5 text-green-500" />
                      <span className="font-medium text-slate-900 dark:text-slate-100">
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
                  {activity.dia_diem && (
                    <div className="flex items-center gap-1.5 col-span-2">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      <span className="truncate text-slate-600 dark:text-slate-300">{activity.dia_diem}</span>
                    </div>
                  )}
                </div>
                {registration.trang_thai_dk === 'tu_choi' && registration.ly_do_tu_choi && (
                  <div className="flex items-start gap-1.5 mt-2 px-2 py-1 bg-red-50 border border-red-200 rounded-md">
                    <AlertCircle className="h-3.5 w-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-red-600 line-clamp-1">{registration.ly_do_tu_choi}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col justify-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleViewDetail(activity.id)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px]"
              >
                <Eye className="h-4 w-4" />Chi tiết
              </button>
              {canShowQR && (
                <>
                  <button
                    onClick={() => handleShowQR(activity.id, activity.ten_hd)}
                    disabled={!isWritable}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm shadow-md transition-all duration-200 whitespace-nowrap min-w-[90px] ${
                      isWritable
                        ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600 hover:shadow-lg'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Trophy className="h-4 w-4" />QR
                  </button>
                  <button
                    onClick={() => handleFaceAttendance?.(activity.id)}
                    disabled={!isWritable}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm shadow-md transition-all duration-200 whitespace-nowrap min-w-[90px] ${
                      isWritable
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Camera className="h-4 w-4" />Mặt
                  </button>
                </>
              )}
              {canCancel && (
                <button
                  onClick={() => handleCancel(registration.id, activity.ten_hd)}
                  disabled={!isWritable}
                  className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm shadow-md transition-all duration-200 whitespace-nowrap min-w-[90px] ${
                    isWritable
                      ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 hover:shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <XCircle className="h-4 w-4" />Hủy
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="group relative h-full">
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/65 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/80 hover:shadow-xl dark:border-white/10 dark:bg-slate-950/50">
        <div className="relative w-full h-36 overflow-hidden">
          <ActivityImageSlideshow
            images={activity.hinh_anh}
            activityType={activity.loai_hd?.ten_loai_hd}
            alt={activity.ten_hd}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
            showDots={true}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none"></div>
          <div className="absolute top-2 left-2">{getStatusBadge(registration.trang_thai_dk)}</div>
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
            <h3 className="mb-1.5 line-clamp-2 text-sm font-bold leading-tight text-slate-950 transition-colors group-hover:text-indigo-600 dark:text-white">{activity.ten_hd}</h3>
            {activity.loai_hd?.ten_loai_hd && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full border border-indigo-200/70 bg-indigo-50/70 text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-300">
                <Calendar className="h-3 w-3" />{activity.loai_hd.ten_loai_hd}
              </span>
            )}
          </div>
          <div className="space-y-1.5">
            {activity.ngay_bd && (
              <div className="flex items-center gap-1.5 text-xs">
                <CalendarClock className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                <span className="font-medium text-gray-900">
                  Bắt đầu: {new Date(activity.ngay_bd).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}, {new Date(activity.ngay_bd).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
            {activity.ngay_kt && (
              <div className="flex items-center gap-1.5 text-xs">
                <CalendarCheck className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                <span className="font-medium text-gray-900">
                  Kết thúc: {new Date(activity.ngay_kt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}, {new Date(activity.ngay_kt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
            {activity.han_dk && (
              <div className="flex items-center gap-1.5 text-xs">
                <CalendarX className={`h-3.5 w-3.5 flex-shrink-0 ${new Date(activity.han_dk) < new Date() ? 'text-red-500' : 'text-orange-500'}`} />
                <span className={`font-medium ${new Date(activity.han_dk) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                  Hạn ĐK: {new Date(activity.han_dk).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}, {new Date(activity.han_dk).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
            {activity.dia_diem && (
              <div className="flex items-center gap-1.5 text-xs">
                <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="truncate text-slate-600 dark:text-slate-300">{activity.dia_diem}</span>
              </div>
            )}
            {registration.ngay_dang_ky && (
              <div className="flex items-center gap-1.5 text-xs">
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                <span className="truncate text-slate-600 dark:text-slate-300">ĐK: {formatDate(registration.ngay_dang_ky)}</span>
              </div>
            )}
            {registration.trang_thai_dk === 'tu_choi' && registration.ly_do_tu_choi && (
              <div className="flex items-start gap-1 p-2 bg-red-50 border border-red-200 rounded text-xs">
                <AlertCircle className="h-3 w-3 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-red-600 line-clamp-2">{registration.ly_do_tu_choi}</span>
              </div>
            )}
          </div>
        </div>
        <div className="p-3 pt-0 mt-auto flex gap-2">
          <button 
            onClick={() => handleViewDetail(activity.id)} 
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-500/20 transition-all duration-200 hover:-translate-y-0.5 dark:from-white dark:via-indigo-100 dark:to-white dark:text-slate-950"
          >
            <Eye className="h-3.5 w-3.5" />Chi tiết
          </button>
          {canShowQR && (
            <>
              <button
                onClick={() => handleShowQR(activity.id, activity.ten_hd)}
                disabled={!isWritable}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs shadow-md transition-all duration-200 ${
                  isWritable
                    ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600 hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Trophy className="h-3.5 w-3.5" />QR
              </button>
              <button
                onClick={() => handleFaceAttendance?.(activity.id)}
                disabled={!isWritable}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs shadow-md transition-all duration-200 ${
                  isWritable
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Camera className="h-3.5 w-3.5" />Mặt
              </button>
            </>
          )}
          {canCancel && (
            <button 
              onClick={() => handleCancel(registration.id, activity.ten_hd)} 
              disabled={!isWritable} 
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs shadow-md transition-all duration-200 ${
                isWritable 
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 hover:shadow-lg' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <XCircle className="h-3.5 w-3.5" />Hủy
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

