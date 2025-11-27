import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Clock, MapPin, Award, Eye, Trophy, XCircle, AlertCircle } from 'lucide-react';
import { getActivityImage, getActivityImages } from '../../../../../shared/lib/activityImages';

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
  handleCancel,
  isWritable
}) {
  const activity = registration.hoat_dong || {};
  
  // Get all available images with fallback logic
  const allImages = useMemo(() => {
    const images = getActivityImages(activity.hinh_anh, activity.loai_hd?.ten_loai_hd);
    return images.length > 0 ? images : [getActivityImage(null, activity.loai_hd?.ten_loai_hd)];
  }, [activity.hinh_anh, activity.loai_hd?.ten_loai_hd]);

  // State to track current image index
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Reset image index when activity changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [activity.id]);
  
  // Get current image URL
  const currentImageUrl = allImages[currentImageIndex] || allImages[0];
  
  // Handle image error - try next image
  const handleImageError = (e) => {
    if (currentImageIndex < allImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      const defaultImage = getActivityImage(null, activity.loai_hd?.ten_loai_hd);
      e.target.src = defaultImage;
    }
  };
  
  const canCancel = registration.trang_thai_dk === 'cho_duyet';
  const canShowQR = registration.trang_thai_dk === 'da_duyet';

  if (displayViewMode === 'list') {
    return (
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-200"></div>
        <div className="relative bg-white border-2 border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200">
          <div className="flex items-stretch gap-4 p-4">
            <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
              <img src={currentImageUrl} alt={activity.ten_hd} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={handleImageError} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
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
                <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2">{activity.ten_hd}</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-600 truncate">{activity.loai_hd?.ten_loai_hd || activity.loai || 'Chưa phân loại'}</span>
                  </div>
                  {activity.ngay_bd && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-900 font-medium">{formatDate(activity.ngay_bd)}</span>
                    </div>
                  )}
                  {activity.dia_diem && (
                    <div className="flex items-center gap-1.5 col-span-2">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-600 truncate">{activity.dia_diem}</span>
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
      <div className="relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col h-full">
        <div className="relative w-full h-36 overflow-hidden">
          <img src={currentImageUrl} alt={activity.ten_hd} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" onError={handleImageError} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
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
            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors mb-1.5 leading-tight">{activity.ten_hd}</h3>
            {activity.loai_hd?.ten_loai_hd && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-200">
                <Calendar className="h-3 w-3" />{activity.loai_hd.ten_loai_hd}
              </span>
            )}
          </div>
          <div className="space-y-1.5">
            {activity.ngay_bd && (
              <div className="flex items-center gap-1.5 text-xs">
                <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-900 font-medium">{formatDate(activity.ngay_bd)}</span>
              </div>
            )}
            {activity.dia_diem && (
              <div className="flex items-center gap-1.5 text-xs">
                <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600 truncate">{activity.dia_diem}</span>
              </div>
            )}
            {registration.ngay_dang_ky && (
              <div className="flex items-center gap-1.5 text-xs">
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-gray-600 truncate">ĐK: {formatDate(registration.ngay_dang_ky)}</span>
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
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Eye className="h-3.5 w-3.5" />Chi tiết
          </button>
          {canShowQR && (
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

