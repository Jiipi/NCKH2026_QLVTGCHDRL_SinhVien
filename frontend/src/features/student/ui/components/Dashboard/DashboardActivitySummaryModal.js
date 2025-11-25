import React from 'react';
import { Calendar, MapPin, Award, CheckCircle, X } from 'lucide-react';

export default function DashboardActivitySummaryModal({
  visible,
  activity,
  onClose = () => {},
  formatNumber = (value) => value
}) {
  if (!visible || !activity) {
    return null;
  }

  const activityData = activity.activity || activity.hoat_dong || activity;
  const activityName =
    activityData?.ten_hd ||
    activityData?.name ||
    activity.ten_hd ||
    activity.name ||
    'Hoạt động';
  const description =
    activityData?.mo_ta ||
    activityData?.description ||
    activity.mo_ta ||
    activity.description ||
    'Không có mô tả';
  const startDate = activityData?.ngay_bd || activity.ngay_bd || activity.hoat_dong?.ngay_bd;
  const endDate = activityData?.ngay_kt || activity.ngay_kt || activity.hoat_dong?.ngay_kt;
  const location = activityData?.dia_diem || activity.dia_diem || activity.hoat_dong?.dia_diem || activity.location;
  const points =
    activityData?.diem_rl ||
    activity.diem_rl ||
    activity.hoat_dong?.diem_rl ||
    activityData?.diem ||
    0;
  const status = (activity.trang_thai_dk || activity.status || '').toLowerCase();

  const statusText = (() => {
    if (status === 'cho_duyet' || status === 'pending') return 'Chờ duyệt';
    if (status === 'da_duyet' || status === 'approved') return 'Đã duyệt';
    if (status === 'da_tham_gia' || status === 'participated') return 'Đã tham gia';
    if (status === 'tu_choi' || status === 'rejected') return 'Bị từ chối';
    return status || 'Không xác định';
  })();

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border-4 border-black rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
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
              <InfoRow
                icon={Calendar}
                label="Ngày bắt đầu"
                value={startDate ? new Date(startDate).toLocaleDateString('vi-VN') : 'N/A'}
              />
              <InfoRow
                icon={Calendar}
                label="Ngày kết thúc"
                value={endDate ? new Date(endDate).toLocaleDateString('vi-VN') : 'N/A'}
              />
              {location && <InfoRow icon={MapPin} label="Địa điểm" value={location} />}
              <InfoRow
                icon={Award}
                label="Điểm rèn luyện"
                value={`${formatNumber(points)} điểm`}
              />
              {status && (
                <InfoRow
                  icon={CheckCircle}
                  label="Trạng thái"
                  value={statusText}
                  className="col-span-2"
                />
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

function InfoRow({ icon: Icon, label, value, className }) {
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <Icon className="h-4 w-4 text-gray-600" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

