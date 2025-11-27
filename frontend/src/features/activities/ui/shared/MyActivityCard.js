import React, { useState, useMemo, useEffect } from 'react';
import {
  Clock, CheckCircle, XCircle, Calendar, MapPin, Trophy, Eye, UserX, QrCode, FileText
} from 'lucide-react';
import { getActivityImage, getActivityImages } from '../../../shared/lib/activityImages';

const statusConfig = {
  'pending': { 
    icon: Clock, 
    bg: 'bg-amber-50', 
    border: 'border-amber-200', 
    text: 'text-amber-700', 
    dot: 'bg-amber-400',
    gradient: 'from-amber-400 to-orange-500',
    label: 'Chờ phê duyệt' 
  },
  'approved': { 
    icon: CheckCircle, 
    bg: 'bg-emerald-50', 
    border: 'border-emerald-200', 
    text: 'text-emerald-700', 
    dot: 'bg-emerald-400',
    gradient: 'from-emerald-400 to-green-500',
    label: 'Đã duyệt' 
  },
  'joined': { 
    icon: Trophy, 
    bg: 'bg-blue-50', 
    border: 'border-blue-200', 
    text: 'text-blue-700', 
    dot: 'bg-blue-400',
    gradient: 'from-blue-400 to-indigo-500',
    label: 'Đã tham gia' 
  },
  'rejected': { 
    icon: XCircle, 
    bg: 'bg-rose-50', 
    border: 'border-rose-200', 
    text: 'text-rose-700', 
    dot: 'bg-rose-400',
    gradient: 'from-rose-400 to-red-500',
    label: 'Bị từ chối' 
  }
};

export function MyActivityCard({ 
  activityRegistration, 
  status, 
  mode = 'grid', 
  onViewDetail, 
  onShowQR, 
  onCancel, 
  isWritable, 
  canShowQR 
}) {
  const activityData = activityRegistration.hoat_dong || activityRegistration;
  const startDate = activityData.ngay_bd ? new Date(activityData.ngay_bd) : null;
  const registrationDate = activityRegistration.ngay_dang_ky ? new Date(activityRegistration.ngay_dang_ky) : null;
  const approvalDate = activityRegistration.ngay_duyet ? new Date(activityRegistration.ngay_duyet) : null;

  const config = statusConfig[status] || statusConfig['pending'];

  // Get all available images with fallback logic
  const allImages = useMemo(() => {
    const images = getActivityImages(activityData.hinh_anh, activityData.loai_hd?.ten_loai_hd);
    return images.length > 0 ? images : [getActivityImage(null, activityData.loai_hd?.ten_loai_hd)];
  }, [activityData.hinh_anh, activityData.loai_hd?.ten_loai_hd]);

  // State to track current image index
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Reset image index when activity changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [activityData.id]);
  
  // Get current image URL
  const currentImageUrl = allImages[currentImageIndex] || allImages[0];
  
  // Handle image error - try next image
  const handleImageError = (e) => {
    if (currentImageIndex < allImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      const defaultImage = getActivityImage(null, activityData.loai_hd?.ten_loai_hd);
      e.target.src = defaultImage;
    }
  };

  // LIST MODE - Compact horizontal layout
  if (mode === 'list') {
    return (
      <div className="group relative">
        <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} rounded-xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-200`}></div>
        <div className={`relative bg-white border-2 ${config.border} rounded-xl hover:shadow-lg transition-all duration-200`}>
          <div className="flex items-stretch gap-4 p-4">
            <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
              <img 
                src={currentImageUrl}
                alt={activityData.ten_hd || 'Hoạt động'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              <div className="absolute top-2 left-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-white/90 backdrop-blur-sm ${config.text} shadow-sm`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
                  {config.label}
                </span>
              </div>
              <div className="absolute bottom-2 left-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/90 backdrop-blur-sm text-white shadow-sm text-xs font-bold">
                  <Trophy className="h-3 w-3" />
                  +{activityData.diem_rl || 0}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
                  {activityData.ten_hd || 'Hoạt động'}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-600 truncate">
                      {activityData.loai_hd?.ten_loai_hd || 'Chưa phân loại'}
                    </span>
                  </div>
                  {startDate && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-900 font-medium">{startDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</span>
                    </div>
                  )}
                  {activityData.dia_diem && (
                    <div className="flex items-center gap-1.5 col-span-2">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-600 truncate">{activityData.dia_diem}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-2 flex-shrink-0">
              <button
                onClick={() => onViewDetail(activityData.id)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px]"
              >
                <Eye className="h-4 w-4" />
                Chi tiết
              </button>
              {(status === 'approved' || status === 'joined') && canShowQR && (
                <button
                  onClick={() => onShowQR(activityData.id, activityData.ten_hd)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px]"
                >
                  <QrCode className="h-4 w-4" />
                  QR
                </button>
              )}
              {status === 'pending' && (
                <button
                  onClick={() => onCancel(activityRegistration.id, activityData.ten_hd)}
                  className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm shadow-md transition-all duration-200 whitespace-nowrap min-w-[90px] ${isWritable ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  disabled={!isWritable}
                >
                  <UserX className="h-4 w-4" />
                  Hủy
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // GRID MODE
  return (
    <div className="group relative h-full">
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} rounded-xl blur opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
      <div className={`relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-purple-300 transition-all duration-300 flex flex-col h-full`}>
        <div className="relative w-full h-36 overflow-hidden">
          <img
            src={currentImageUrl}
            alt={activityData.ten_hd || 'Hoạt động'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-white/95 backdrop-blur-sm ${config.text} shadow-md`}>
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
              {config.label}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/95 backdrop-blur-sm text-white shadow-md text-xs font-bold">
              <Trophy className="h-3 w-3" />
              +{activityData.diem_rl || 0}
            </span>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors mb-1.5 leading-tight">
              {activityData.ten_hd || 'Hoạt động'}
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-200">
              <Calendar className="h-3 w-3" />
              {activityData.loai_hd?.ten_loai_hd || 'Chưa phân loại'}
            </span>
          </div>
          <div className="space-y-1.5">
            {startDate && (
              <div className="flex items-center gap-1.5 text-xs">
                <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{startDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                  <p className="text-gray-500">{startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            )}
            {activityData.dia_diem && (
              <div className="flex items-center gap-1.5 text-xs">
                <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600 truncate">{activityData.dia_diem}</span>
              </div>
            )}
            {registrationDate && (
              <div className="flex items-center gap-1.5 text-xs">
                <FileText className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-gray-600 truncate">ĐK: {registrationDate.toLocaleDateString('vi-VN')}</span>
              </div>
            )}
          </div>
        </div>
        <div className="p-3 pt-0 mt-auto flex gap-2">
          <button
            onClick={() => onViewDetail(activityData.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Eye className="h-3.5 w-3.5" />
            Chi tiết
          </button>
          {(status === 'approved' || status === 'joined') && canShowQR && (
            <button
              onClick={() => onShowQR(activityData.id, activityData.ten_hd)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200"
            >
              <QrCode className="h-3.5 w-3.5" />
              QR
            </button>
          )}
          {status === 'pending' && (
            <button
              onClick={() => onCancel(activityRegistration.id, activityData.ten_hd)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs shadow-md transition-all duration-200 ${isWritable ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              disabled={!isWritable}
            >
              <UserX className="h-3.5 w-3.5" />
              Hủy
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

