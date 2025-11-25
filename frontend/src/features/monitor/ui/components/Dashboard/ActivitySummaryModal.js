import React from 'react';
import { X, Calendar, MapPin, Award, CheckCircle } from 'lucide-react';

/**
 * ActivitySummaryModal Component - Modal tóm tắt hoạt động
 */
export default function ActivitySummaryModal({ 
  isOpen, 
  activity, 
  onClose, 
  formatNumber 
}) {
  if (!isOpen || !activity) return null;

  const activityData = activity.activity || activity.hoat_dong || activity;
  const act = activityData || activity;
  const activityName = act.ten_hd || act.name || activityData?.ten_hd || activityData?.name || activity.ten_hd || activity.name || 'Hoạt động';
  const description = act.mo_ta || act.description || activityData?.mo_ta || activityData?.description || activity.mo_ta || activity.description || 'Không có mô tả';
  const startDate = act.ngay_bd || activityData?.ngay_bd || activity.ngay_bd || activity.hoat_dong?.ngay_bd;
  const endDate = act.ngay_kt || activityData?.ngay_kt || activity.ngay_kt || activity.hoat_dong?.ngay_kt;
  const location = act.dia_diem || activityData?.dia_diem || activity.dia_diem || activity.hoat_dong?.dia_diem || activity.location;
  const points = act.diem_rl || activityData?.diem_rl || activity.diem_rl || activity.hoat_dong?.diem_rl || act.diem || activityData?.diem || 0;
  const status = (activity.trang_thai_dk || activity.status || '').toLowerCase();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white border-4 border-black rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-gray-900">Tóm tắt hoạt động</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="h-5 w-5 text-gray-700" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-black text-gray-900 mb-2">{activityName}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Ngày bắt đầu</p>
                  <p className="text-sm font-bold text-gray-900">
                    {startDate ? new Date(startDate).toLocaleDateString('vi-VN') : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Ngày kết thúc</p>
                  <p className="text-sm font-bold text-gray-900">
                    {endDate ? new Date(endDate).toLocaleDateString('vi-VN') : 'N/A'}
                  </p>
                </div>
              </div>
              {location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Địa điểm</p>
                    <p className="text-sm font-bold text-gray-900">{location}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Điểm rèn luyện</p>
                  <p className="text-sm font-bold text-gray-900">{formatNumber(points)} điểm</p>
                </div>
              </div>
              {status && (
                <div className="flex items-center gap-2 col-span-2">
                  <CheckCircle className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Trạng thái</p>
                    <p className="text-sm font-bold text-gray-900">
                      {status === 'cho_duyet' || status === 'pending' ? 'Chờ duyệt' : 
                       status === 'da_duyet' || status === 'approved' ? 'Đã duyệt' : 
                       status === 'da_tham_gia' || status === 'participated' ? 'Đã tham gia' : 
                       status === 'tu_choi' || status === 'rejected' ? 'Bị từ chối' : status}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button 
              onClick={onClose} 
              className="bg-black text-white px-6 py-2 rounded-lg font-black text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

