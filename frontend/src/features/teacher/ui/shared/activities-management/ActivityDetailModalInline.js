import React from 'react';
import { X, Calendar, MapPin, Award, Users, Clock, FileText, Download, Info } from 'lucide-react';
import { getActivityImage, getDefaultActivityImage } from '../../../../../shared/lib/activityImages';
import resolveAssetUrl from '../../../../../shared/lib/assetUrl';
import ActivityImageSlideshow from '../../../../../shared/components/ActivityImageSlideshow';

// Get gradient based on activity type
const getTypeGradient = (type) => {
  const gradients = {
    'Tình nguyện': 'from-emerald-400 to-green-600',
    'Thể thao': 'from-blue-400 to-indigo-600',
    'Văn nghệ': 'from-amber-400 to-orange-600',
    'Học thuật': 'from-purple-400 to-violet-600',
    'Đoàn - Hội': 'from-red-400 to-rose-600',
    'Kỹ năng mềm': 'from-teal-400 to-cyan-600',
  };
  return gradients[type] || 'from-gray-400 to-slate-600';
};

export default function ActivityDetailModalInline({
  activity,
  isOpen,
  onClose,
  getStatusLabel
}) {
  if (!isOpen || !activity) return null;

  const start = activity?.ngay_bd ? new Date(activity.ngay_bd) : null;
  const end = activity?.ngay_kt ? new Date(activity.ngay_kt) : null;
  const deadline = activity?.han_dk ? new Date(activity.han_dk) : null;
  const now = new Date();
  const isDeadlinePast = deadline ? deadline < now : false;

  const typeGradient = getTypeGradient(activity.loai_hd?.ten_loai_hd);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">Chi tiết hoạt động</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Activity Image with Slideshow */}
            <div className="w-full h-64 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
              <ActivityImageSlideshow
                images={activity.hinh_anh}
                activityType={activity.loai_hd?.ten_loai_hd}
                alt={activity.ten_hd}
                className="w-full h-full object-cover"
                showDots={true}
                dotsPosition="bottom"
              />
            </div>

            {/* Title */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{activity.ten_hd || 'Chưa có tên'}</h3>
              {activity.mo_ta && (
                <p className="text-gray-600 leading-relaxed">{activity.mo_ta}</p>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              {start && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Ngày bắt đầu</p>
                    <p className="text-base text-gray-900">{start.toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              )}

              {/* End Date */}
              {end && (
                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <Calendar className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Ngày kết thúc</p>
                    <p className="text-base text-gray-900">{end.toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              )}

              {/* Location */}
              {activity.dia_diem && (
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                  <MapPin className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Địa điểm</p>
                    <p className="text-base text-gray-900">{activity.dia_diem}</p>
                  </div>
                </div>
              )}

              {/* Points */}
              {activity.diem_rl !== undefined && (
                <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                  <Award className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Điểm rèn luyện</p>
                    <p className="text-base text-gray-900">{activity.diem_rl || 0} điểm</p>
                  </div>
                </div>
              )}

              {/* Max Participants */}
              {activity.sl_toi_da !== undefined && (
                <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <Users className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Số lượng tối đa</p>
                    <p className="text-base text-gray-900">{activity.sl_toi_da || 0} người</p>
                  </div>
                </div>
              )}

              {/* Registration Deadline */}
              {deadline && (
                <div className={`flex items-start gap-3 p-4 rounded-xl border ${
                  isDeadlinePast 
                    ? 'bg-red-50 border-red-100' 
                    : 'bg-amber-50 border-amber-100'
                }`}>
                  <Clock className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                    isDeadlinePast ? 'text-red-600' : 'text-amber-600'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Hạn đăng ký</p>
                    <p className="text-base text-gray-900">{deadline.toLocaleDateString('vi-VN')}</p>
                    {isDeadlinePast && (
                      <p className="text-xs text-red-600 mt-1">Đã hết hạn</p>
                    )}
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <Info className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Trạng thái</p>
                  <p className="text-base text-gray-900">{getStatusLabel(activity.trang_thai)}</p>
                </div>
              </div>

              {/* Activity Type */}
              <div className="flex items-start gap-3 p-4 bg-violet-50 rounded-xl border border-violet-100">
                <FileText className="h-5 w-5 text-violet-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Loại hoạt động</p>
                  <p className="text-base text-gray-900">{activity.loai_hd?.ten_loai_hd || 'Không xác định'}</p>
                </div>
              </div>
            </div>

            {/* Attachments */}
            {activity.tep_dinh_kem && Array.isArray(activity.tep_dinh_kem) && activity.tep_dinh_kem.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  Tài liệu đính kèm
                </h4>
                <div className="grid gap-2">
                  {activity.tep_dinh_kem.map((file, idx) => {
                    const fileUrl = typeof file === 'string' ? file : (file?.url || file?.path || '');
                    const fileName = typeof file === 'string' 
                      ? file.split('/').pop() 
                      : (file?.originalName || file?.filename || file?.name || `Tài liệu ${idx + 1}`);
                    return (
                      <a
                        key={idx}
                        href={resolveAssetUrl(fileUrl)}
                        download={fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                      >
                        <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <span className="flex-1 text-gray-700 truncate">{fileName}</span>
                        <Download className="h-4 w-4 text-gray-400" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Creator Info */}
            {activity.nguoi_tao && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Người tạo</p>
                <p className="text-gray-900 font-medium">
                  {activity.nguoi_tao?.ho_ten || activity.nguoi_tao?.email || 'Không xác định'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

