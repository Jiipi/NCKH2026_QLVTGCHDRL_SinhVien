import React from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  AlertCircle,
  UserX,
  QrCode,
  Eye,
  Trophy,
  FileText,
  CalendarClock,
  CalendarCheck,
  CalendarX
} from 'lucide-react';
import { getActivityImage, getActivityImages } from '../../../../../shared/lib/activityImages';
import ActivityImageSlideshow from '../../../../../shared/components/ActivityImageSlideshow';

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
    gradient: 'from-amber-400 to-orange-500',
    label: 'Chờ phê duyệt'
  },
  approved: {
    icon: CheckCircle,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    dot: 'bg-emerald-400',
    gradient: 'from-emerald-400 to-green-500',
    label: 'Đã duyệt'
  },
  joined: {
    icon: Trophy,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    dot: 'bg-blue-400',
    gradient: 'from-blue-400 to-indigo-500',
    label: 'Đã tham gia'
  },
  rejected: {
    icon: XCircle,
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    dot: 'bg-rose-400',
    gradient: 'from-rose-400 to-red-500',
    label: 'Bị từ chối'
  }
};

export default function MyActivityCard({
  activity,
  status,
  mode = 'grid',
  onViewDetail,
  onShowQr,
  onCancel,
  canShowQr,
  isWritable
}) {
  const activityData = activity.hoat_dong || activity;
  const startDate = activityData.ngay_bd ? new Date(activityData.ngay_bd) : null;
  const endDate = activityData.ngay_kt ? new Date(activityData.ngay_kt) : null;
  const deadlineDate = activityData.han_dk ? new Date(activityData.han_dk) : null;
  const registrationDate = activity.ngay_dang_ky ? new Date(activity.ngay_dang_ky) : null;
  const approvalDate = activity.ngay_duyet ? new Date(activity.ngay_duyet) : null;
  const now = new Date();
  const isDeadlinePast = deadlineDate ? deadlineDate < now : false;
  const normalizedStatus = status || 'pending';
  const config = STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;

  const statusLabel = config.label;
  const pointsValue = activityData.diem_rl || activityData.diem || 0;

  const handleViewDetail = () => {
    if (onViewDetail) {
      onViewDetail(activityData.id || activity.hd_id);
    }
  };

  const handleShowQr = () => {
    if (onShowQr) {
      onShowQr(activityData.id || activity.hd_id, activityData.ten_hd || activityData.name || 'Hoạt động');
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel(activity.id || activity.registration_id || activity.hd_id, activityData.ten_hd || activityData.name);
    }
  };

  if (mode === 'list') {
    return (
      <div className="group relative">
        <div
          className={`absolute inset-0 bg-gradient-to-r ${config.gradient} rounded-xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-200`}
        ></div>
        <div className={`relative bg-white border-2 ${config.border} rounded-xl hover:shadow-lg transition-all duration-200`}>
          <div className="flex items-stretch gap-4 p-4">
            <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
              <ActivityImageSlideshow
                images={activityData.hinh_anh}
                activityType={activityData.loai || activityData.loai_hd?.ten_loai_hd}
                alt={activityData.ten_hd || activityData.name || 'Hoạt động'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                showDots={true}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
              <div className="absolute top-2 left-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-white/90 backdrop-blur-sm ${config.text} shadow-sm`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
                  {statusLabel}
                </span>
              </div>
              <div className="absolute bottom-2 left-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/90 backdrop-blur-sm text-white shadow-sm text-xs font-bold">
                  <Trophy className="h-3 w-3" />
                  +{pointsValue}
                </span>
              </div>
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
                  {activityData.ten_hd || activityData.name || 'Hoạt động'}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-600 truncate">
                      {typeof activityData.loai === 'string'
                        ? activityData.loai
                        : activityData.loai?.name || activityData.loai_hd?.ten_loai_hd || 'Chưa phân loại'}
                    </span>
                  </div>
                  {startDate && (
                    <div className="flex items-center gap-1.5">
                      <CalendarClock className="h-3.5 w-3.5 text-blue-500" />
                      <span className="text-gray-900 font-medium">
                        BĐ: {startDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}, {startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  {endDate && (
                    <div className="flex items-center gap-1.5">
                      <CalendarCheck className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-gray-900 font-medium">
                        KT: {endDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}, {endDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  {deadlineDate && (
                    <div className="flex items-center gap-1.5">
                      <CalendarX className={`h-3.5 w-3.5 ${isDeadlinePast ? 'text-red-500' : 'text-orange-500'}`} />
                      <span className={`font-medium ${isDeadlinePast ? 'text-red-600' : 'text-gray-900'}`}>
                        Hạn ĐK: {deadlineDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}, {deadlineDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  {activityData.dia_diem && (
                    <div className="flex items-center gap-1.5 col-span-2">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-600 truncate">{activityData.dia_diem}</span>
                    </div>
                  )}
                </div>
                {normalizedStatus === 'rejected' && activity.ly_do_tu_choi && (
                  <div className="flex items-start gap-1.5 mt-2 px-2 py-1 bg-red-50 border border-red-200 rounded-md">
                    <AlertCircle className="h-3.5 w-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-red-600 line-clamp-1">{activity.ly_do_tu_choi}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-center gap-2 flex-shrink-0">
              <PrimaryButton onClick={handleViewDetail} icon={Eye} label="Chi tiết" />
              {normalizedStatus === 'approved' && canShowQr && (
                <PrimaryButton onClick={handleShowQr} icon={QrCode} label="QR" variant="success" />
              )}
              {normalizedStatus === 'pending' && (
                <SecondaryButton
                  onClick={handleCancel}
                  icon={UserX}
                  label="Hủy"
                  disabled={!isWritable}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative h-full">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${config.gradient} rounded-xl blur opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
      ></div>
      <div className="relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-purple-300 transition-all duration-300 flex flex-col h-full">
        <div className="relative w-full h-36 overflow-hidden">
          <ActivityImageSlideshow
            images={activityData.hinh_anh}
            activityType={activityData.loai || activityData.loai_hd?.ten_loai_hd}
            alt={activityData.ten_hd || activityData.name || 'Hoạt động'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            showDots={true}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-white/95 backdrop-blur-sm ${config.text} shadow-md`}>
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
              {statusLabel}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/95 backdrop-blur-sm text-white shadow-md text-xs font-bold">
              <Trophy className="h-3 w-3" />
              +{pointsValue}
            </span>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors mb-1.5 leading-tight">
              {activityData.ten_hd || activityData.name || 'Hoạt động'}
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-200">
              <Calendar className="h-3 w-3" />
              {typeof activityData.loai === 'string'
                ? activityData.loai
                : activityData.loai?.name || activityData.loai_hd?.ten_loai_hd || 'Chưa phân loại'}
            </span>
          </div>
          <div className="space-y-1.5">
            {startDate && (
              <div className="flex items-center gap-1.5 text-xs">
                <CalendarClock className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-900">
                    Bắt đầu: {startDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}, {startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )}
            {endDate && (
              <div className="flex items-center gap-1.5 text-xs">
                <CalendarCheck className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-900">
                    Kết thúc: {endDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}, {endDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )}
            {deadlineDate && (
              <div className="flex items-center gap-1.5 text-xs">
                <CalendarX className={`h-3.5 w-3.5 flex-shrink-0 ${isDeadlinePast ? 'text-red-500' : 'text-orange-500'}`} />
                <div className="flex-1 min-w-0">
                  <span className={`font-medium ${isDeadlinePast ? 'text-red-600' : 'text-gray-900'}`}>
                    Hạn ĐK: {deadlineDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}, {deadlineDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
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
            {(normalizedStatus === 'approved' || normalizedStatus === 'joined') && approvalDate && (
              <div className="flex items-center gap-1.5 text-xs">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700 truncate">Duyệt: {approvalDate.toLocaleDateString('vi-VN')}</span>
              </div>
            )}
            {normalizedStatus === 'rejected' && activity.ly_do_tu_choi && (
              <div className="flex items-start gap-1 p-2 bg-red-50 border border-red-200 rounded text-xs">
                <AlertCircle className="h-3 w-3 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-red-600 line-clamp-2">{activity.ly_do_tu_choi}</span>
              </div>
            )}
          </div>
        </div>
        <div className="p-3 pt-0 mt-auto flex gap-2">
          <button
            onClick={handleViewDetail}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Eye className="h-3.5 w-3.5" />
            Chi tiết
          </button>
          {normalizedStatus === 'approved' && canShowQr && (
            <button
              onClick={handleShowQr}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200"
            >
              <QrCode className="h-3.5 w-3.5" />
              QR
            </button>
          )}
          {normalizedStatus === 'pending' && (
            <button
              onClick={handleCancel}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs shadow-md transition-all duration-200 ${
                isWritable
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
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

function PrimaryButton({ onClick, icon: Icon, label, variant = 'primary' }) {
  const variantClasses =
    variant === 'success'
      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700';

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px] ${variantClasses}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function SecondaryButton({ onClick, icon: Icon, label, disabled }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm shadow-md transition-all duration-200 whitespace-nowrap min-w-[90px] ${
        disabled
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 hover:shadow-lg'
      }`}
      disabled={disabled}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

