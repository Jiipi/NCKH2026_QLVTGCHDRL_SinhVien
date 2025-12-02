import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Clock, MapPin, Award, Eye, Edit, Trash2, QrCode, Users, UserPlus, Sparkles, CalendarClock, CalendarCheck, CalendarX } from 'lucide-react';
import { getActivityImage, getActivityImages } from '../../../../../shared/lib/activityImages';
import resolveAssetUrl from '../../../../../shared/lib/assetUrl';
import ActivityImageSlideshow from '../../../../../shared/components/ActivityImageSlideshow';

// Get gradient based on activity type
const getTypeGradient = (activityType) => {
  if (!activityType) return 'from-indigo-500 via-purple-500 to-pink-500';
  const type = activityType.toLowerCase();
  if (type.includes('tình nguyện') || type.includes('tinh nguyen') || type.includes('volunteer')) {
    return 'from-emerald-500 via-green-500 to-teal-500';
  }
  if (type.includes('thể thao') || type.includes('the thao') || type.includes('sport')) {
    return 'from-blue-500 via-cyan-500 to-teal-500';
  }
  if (type.includes('văn hóa') || type.includes('van hoa') || type.includes('văn nghệ')) {
    return 'from-orange-500 via-amber-500 to-yellow-500';
  }
  if (type.includes('học thuật') || type.includes('hoc thuat') || type.includes('khoa học')) {
    return 'from-violet-500 via-purple-500 to-fuchsia-500';
  }
  if (type.includes('đoàn') || type.includes('hội')) {
    return 'from-red-500 via-rose-500 to-pink-500';
  }
  if (type.includes('kỹ năng')) {
    return 'from-teal-500 via-cyan-500 to-blue-500';
  }
  return 'from-indigo-500 via-purple-500 to-pink-500';
};

/**
 * ActivityCard Component - Hiển thị thẻ hoạt động
 * Hỗ trợ 2 chế độ: list và grid
 */
export default function ActivityCard({ 
  activity, 
  displayViewMode, 
  statusFilter, 
  statusLabels, 
  statusColors, 
  isWritable,
  formatDate,
  getDisplayStatus,
  onViewDetails,
  onEdit,
  onDelete,
  onShowQR,
  onRegister
}) {
  const now = new Date();
  const deadline = activity.han_dk ? new Date(activity.han_dk) : null;
  const startDate = activity.ngay_bd ? new Date(activity.ngay_bd) : null;
  const endDate = activity.ngay_kt ? new Date(activity.ngay_kt) : null;
  const isPast = endDate ? (endDate < now) : false;
  const isUpcoming = startDate ? (startDate > now) : false;
  const isOngoing = startDate && endDate ? (startDate <= now && endDate >= now) : false;
  const isDeadlinePast = deadline ? deadline < now : false;
  const isAfterStart = startDate ? (now.getTime() >= startDate.getTime()) : false;
  const capacity = activity.so_luong_toi_da ?? activity.sl_toi_da ?? null;
  const registeredCount = activity.registrationCount ?? activity.so_dang_ky ?? activity._count?.dang_ky_hd ?? null;
  const isFull = capacity !== null && registeredCount !== null ? Number(registeredCount) >= Number(capacity) : false;
  const canRegister = activity.trang_thai === 'da_duyet' && !isPast && !isDeadlinePast 
    && (!activity.is_registered || activity.registration_status === 'tu_choi') && !isFull;
  const isRegistrationOpen = canRegister;
  
  const displayStatus = getDisplayStatus(activity);
  const typeGradient = getTypeGradient(activity.loai_hd?.ten_loai_hd);
  
  // LIST MODE - Compact horizontal layout
  if (displayViewMode === 'list') {
    return (
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-200"></div>
        
        <div className="relative bg-white border-2 border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200">
          <div className="flex items-stretch gap-4 p-4">
            {/* Compact Image */}
            <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
              <ActivityImageSlideshow
                images={activity.hinh_anh}
                activityType={activity.loai_hd?.ten_loai_hd}
                alt={activity.ten_hd}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                showDots={true}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
              <div className="absolute top-2 left-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors[displayStatus]}`}>
                  {statusLabels[displayStatus]}
                </span>
              </div>
              {activity.diem_rl && (
                <div className="absolute bottom-2 left-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/90 backdrop-blur-sm text-white shadow-sm text-xs font-bold">
                    <Award className="h-3 w-3" />
                    +{activity.diem_rl}
                  </span>
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2">
                  {activity.ten_hd}
                </h3>
                
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-600 truncate">
                      {activity.loai_hd?.ten_loai_hd || 'Chưa phân loại'}
                    </span>
                  </div>
                  {/* Thời gian bắt đầu */}
                  {activity.ngay_bd && (
                    <div className="flex items-center gap-1.5">
                      <CalendarClock className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-gray-900 font-medium">
                        {new Date(activity.ngay_bd).toLocaleString('vi-VN', {
                          day: '2-digit', month: '2-digit',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                  {/* Thời gian kết thúc */}
                  {activity.ngay_kt && (
                    <div className="flex items-center gap-1.5">
                      <CalendarCheck className="h-3.5 w-3.5 text-blue-500" />
                      <span className="text-gray-600">KT:</span>
                      <span className="text-gray-900 font-medium">
                        {new Date(activity.ngay_kt).toLocaleString('vi-VN', {
                          day: '2-digit', month: '2-digit',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                  {/* Hạn đăng ký */}
                  {activity.han_dk && (
                    <div className="flex items-center gap-1.5">
                      <CalendarX className="h-3.5 w-3.5 text-orange-500" />
                      <span className="text-gray-600">Hạn:</span>
                      <span className={`font-medium ${isDeadlinePast ? 'text-red-600' : 'text-gray-900'}`}>
                        {new Date(activity.han_dk).toLocaleString('vi-VN', {
                          day: '2-digit', month: '2-digit',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                  {activity.dia_diem && (
                    <div className="flex items-center gap-1.5 col-span-2">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-600 truncate">{activity.dia_diem}</span>
                    </div>
                  )}
                  {activity.registrationCount !== undefined && (
                    <div className="flex items-center gap-1.5 col-span-2">
                      <Users className="h-3.5 w-3.5 text-indigo-500" />
                      <span className="text-gray-600">
                        {activity.registrationCount || 0} đăng ký
                        {activity.so_luong_toi_da && ` / ${activity.so_luong_toi_da} tối đa`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col justify-center gap-2 flex-shrink-0">
              {statusFilter === 'co_san' && isRegistrationOpen && (
                <button
                  onClick={() => onRegister(activity.id, activity.ten_hd)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[110px]"
                  title="Đăng ký hoạt động"
                >
                  <UserPlus className="h-4 w-4" />
                  Đăng ký
                </button>
              )}
              <button
                onClick={() => onViewDetails(activity)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px]"
              >
                <Eye className="h-4 w-4" />
                Chi tiết
              </button>
              
              {/* Tab "Có sẵn" - KHÔNG hiển thị QR/Sửa/Xóa */}
              {statusFilter !== 'co_san' && displayStatus === 'da_duyet' && (
                <button
                  onClick={() => onShowQR(activity)}
                  disabled={!isWritable}
                  className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm shadow-md transition-all duration-200 whitespace-nowrap min-w-[90px] ${isWritable ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600 hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  title="QR Code"
                >
                  <QrCode className="h-4 w-4" />
                  QR
                </button>
              )}
              
              {statusFilter !== 'co_san' && displayStatus === 'cho_duyet' && (
                <button
                  onClick={() => onEdit(activity)}
                  disabled={!isWritable}
                  className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm shadow-md transition-all duration-200 whitespace-nowrap min-w-[90px] ${isWritable ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white hover:from-amber-500 hover:to-orange-500 hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  title="Chỉnh sửa"
                >
                  <Edit className="h-4 w-4" />
                  Sửa
                </button>
              )}
              
              {statusFilter !== 'co_san' && displayStatus === 'cho_duyet' && (
                <button
                  onClick={() => onDelete(activity)}
                  disabled={!isWritable}
                  className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm shadow-md transition-all duration-200 whitespace-nowrap min-w-[90px] ${isWritable ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  title="Xóa"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // GRID MODE - Compact vertical layout
  // ✅ Tab "Có sẵn" sử dụng thiết kế giống sinh viên với header gradient
  if (statusFilter === 'co_san') {
    return (
      <div className="group relative h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl blur opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
        
        <div className="relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col h-full">
          {/* Header với ảnh hoặc gradient background - Giống sinh viên */}
          <div className="relative h-24 overflow-hidden">
            <ActivityImageSlideshow
              images={activity.hinh_anh}
              activityType={activity.loai_hd?.ten_loai_hd}
              alt={activity.ten_hd}
              className="w-full h-full object-cover"
              showDots={true}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            
            {/* Status badge - Top left */}
            <div className="absolute top-2 left-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-white/95 backdrop-blur-sm text-emerald-700 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {displayStatus === 'da_duyet' ? 'Đã mở' : (statusLabels[displayStatus] || 'Đã mở')}
              </span>
            </div>
            
            {/* Points badge - Top right */}
            {activity.diem_rl && (
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/95 backdrop-blur-sm text-white shadow-md text-xs font-bold">
                  <Award className="h-3 w-3" />
                  +{activity.diem_rl}
                </span>
              </div>
            )}
          </div>

          {/* Content - White background */}
          <div className="flex-1 p-4 space-y-3">
            {/* Activity Title */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-1.5 leading-tight">
                {activity.ten_hd}
              </h3>
              {activity.loai_hd?.ten_loai_hd && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-200">
                  <Calendar className="h-3 w-3" />
                  {activity.loai_hd.ten_loai_hd}
                </span>
              )}
            </div>

            {/* Meta Info */}
            <div className="space-y-1.5">
              {/* Thời gian bắt đầu */}
              {activity.ngay_bd && (
                <div className="flex items-center gap-1.5 text-xs">
                  <CalendarClock className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                  <span className="text-gray-600">Bắt đầu:</span>
                  <span className="text-gray-900 font-medium">
                    {new Date(activity.ngay_bd).toLocaleString('vi-VN', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              )}

              {/* Thời gian kết thúc */}
              {activity.ngay_kt && (
                <div className="flex items-center gap-1.5 text-xs">
                  <CalendarCheck className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                  <span className="text-gray-600">Kết thúc:</span>
                  <span className="text-gray-900 font-medium">
                    {new Date(activity.ngay_kt).toLocaleString('vi-VN', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              )}

              {/* Hạn đăng ký */}
              {activity.han_dk && (
                <div className="flex items-center gap-1.5 text-xs">
                  <CalendarX className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
                  <span className="text-gray-600">Hạn ĐK:</span>
                  <span className={`font-medium ${isDeadlinePast ? 'text-red-600' : 'text-gray-900'}`}>
                    {new Date(activity.han_dk).toLocaleString('vi-VN', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
              
              {activity.dia_diem && (
                <div className="flex items-center gap-1.5 text-xs">
                  <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 truncate">{activity.dia_diem}</span>
                </div>
              )}
            </div>

            {/* Status & Time */}
            <div className="flex flex-col gap-1">
              <span className={`text-xs font-semibold ${
                isPast ? 'text-slate-500' : isOngoing ? 'text-emerald-600' : isUpcoming ? 'text-blue-600' : 'text-slate-500'
              }`}>
                • {isPast ? 'Đã kết thúc' : isOngoing ? 'Đang diễn ra' : isUpcoming ? 'Sắp diễn ra' : 'Chưa xác định'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-3 pt-0 mt-auto flex gap-2">
            {canRegister && (
              <button
                onClick={() => onRegister(activity.id, activity.ten_hd)}
                disabled={!isWritable}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs shadow-md transition-all duration-200 ${isWritable ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                title={activity.registration_status === 'tu_choi' ? 'Đăng ký lại' : 'Đăng ký'}
              >
                <UserPlus className="h-3.5 w-3.5" />
                {activity.registration_status === 'tu_choi' ? 'ĐK lại' : 'Đăng ký'}
              </button>
            )}
            <button
              onClick={() => onViewDetails(activity)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200 ${canRegister ? '' : 'flex-1'}`}
            >
              <Eye className="h-3.5 w-3.5" />
              Chi tiết
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // GRID MODE - Compact vertical layout cho các tab khác
  return (
    <div className={`group relative h-full bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col ${
      isRegistrationOpen ? 'border-emerald-200 shadow-lg shadow-emerald-100' : ''
    }`}>
      {/* Activity Image - Compact */}
      <div className="relative w-full h-36 overflow-hidden">
        <ActivityImageSlideshow
          images={activity.hinh_anh}
          activityType={activity.loai_hd?.ten_loai_hd}
          alt={activity.ten_hd}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
          showDots={true}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none"></div>
        
        {/* Status Badge on Image - Compact */}
        <div className="absolute top-2 left-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors[displayStatus]}`}>
            {statusLabels[displayStatus]}
          </span>
        </div>
        
        {/* Points Badge on Image - Compact */}
        {activity.diem_rl && (
          <div className="absolute bottom-2 right-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/95 backdrop-blur-sm text-white rounded-lg text-xs font-bold shadow-md">
              <Award className="h-3 w-3" />
              +{activity.diem_rl}
            </span>
          </div>
        )}
        
        {/* Featured badge for open registration */}
        {isRegistrationOpen && (
          <div className="absolute bottom-2 left-2">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-1 rounded-lg shadow-lg flex items-center gap-1 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 animate-pulse" />
              <span className="text-xs font-bold">Mở ĐK</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 p-4 space-y-3 relative z-10">
        {/* Header - Compact */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors mb-1.5 leading-tight">
            {activity.ten_hd}
          </h3>
          
          {/* Category tag - Compact */}
          {activity.loai_hd?.ten_loai_hd && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-200">
              <Calendar className="h-3 w-3" />
              {activity.loai_hd.ten_loai_hd}
            </span>
          )}
        </div>

        {/* Compact Meta Info */}
        <div className="space-y-1.5">
          {/* Thời gian bắt đầu */}
          {activity.ngay_bd && (
            <div className="flex items-center gap-1.5 text-xs">
              <CalendarClock className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
              <span className="text-gray-600">Bắt đầu:</span>
              <span className="text-gray-900 font-medium">
                {new Date(activity.ngay_bd).toLocaleString('vi-VN', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
          )}

          {/* Thời gian kết thúc */}
          {activity.ngay_kt && (
            <div className="flex items-center gap-1.5 text-xs">
              <CalendarCheck className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
              <span className="text-gray-600">Kết thúc:</span>
              <span className="text-gray-900 font-medium">
                {new Date(activity.ngay_kt).toLocaleString('vi-VN', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
          )}

          {/* Hạn đăng ký */}
          {activity.han_dk && (
            <div className="flex items-center gap-1.5 text-xs">
              <CalendarX className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
              <span className="text-gray-600">Hạn ĐK:</span>
              <span className={`font-medium ${isDeadlinePast ? 'text-red-600' : 'text-gray-900'}`}>
                {new Date(activity.han_dk).toLocaleString('vi-VN', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
          )}

          {activity.dia_diem && (
            <div className="flex items-center gap-1.5 text-xs">
              <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600 truncate">{activity.dia_diem}</span>
            </div>
          )}

          {activity.diem_rl && (
            <div className="flex items-center gap-1.5 text-xs">
              <Award className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
              <span className="text-gray-900 font-medium">+{activity.diem_rl} điểm</span>
            </div>
          )}

          {activity.registrationCount !== undefined && (
            <div className="flex items-center gap-1.5 text-xs">
              <Users className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
              <span className="text-gray-600">
                {activity.registrationCount || 0} đăng ký
                {activity.so_luong_toi_da && ` / ${activity.so_luong_toi_da} tối đa`}
              </span>
            </div>
          )}
        </div>

        {/* Compact Actions */}
        <div className="p-3 pt-0 mt-auto flex gap-2">
          <button
            onClick={() => onViewDetails(activity)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Eye className="h-3.5 w-3.5" />
            Chi tiết
          </button>
          
          {/* Tab khác - Hiển thị QR/Sửa/Xóa */}
          {statusFilter !== 'co_san' && displayStatus === 'da_duyet' && (
            <button
              onClick={() => onShowQR(activity)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs shadow-md transition-all duration-200 ${isWritable ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600 hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              disabled={!isWritable}
              title="QR Code"
            >
              <QrCode className="h-3.5 w-3.5" />
            </button>
          )}
          
          {/* Chỉ cho phép sửa khi trạng thái "Chờ duyệt" và KHÔNG phải tab "Có sẵn" */}
          {statusFilter !== 'co_san' && displayStatus === 'cho_duyet' && (
            <button
              onClick={() => onEdit(activity)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs shadow-md transition-all duration-200 ${isWritable ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white hover:from-amber-500 hover:to-orange-500 hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              disabled={!isWritable}
              title="Chỉnh sửa"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
          )}
          
          {/* Chỉ cho phép xóa khi trạng thái "Chờ duyệt" và KHÔNG phải tab "Có sẵn" */}
          {statusFilter !== 'co_san' && displayStatus === 'cho_duyet' && (
            <button
              onClick={() => onDelete(activity)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs shadow-md transition-all duration-200 ${isWritable ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              disabled={!isWritable}
              title="Xóa vĩnh viễn"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

