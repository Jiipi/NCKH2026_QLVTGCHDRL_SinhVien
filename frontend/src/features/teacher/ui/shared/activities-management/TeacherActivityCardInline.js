import React, { useMemo } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Trophy,
  Sparkles,
  Lock
} from 'lucide-react';
import { getActivityImage } from '../../../../../shared/lib/activityImages';

const statusLabels = {
  cho_duyet: 'Chờ duyệt',
  da_duyet: 'Đã duyệt',
  tu_choi: 'Từ chối',
  da_huy: 'Đã hủy',
  ket_thuc: 'Kết thúc',
};

const statusConfig = {
  cho_duyet: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-400' },
  da_duyet: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  tu_choi: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-400' },
  da_huy: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', dot: 'bg-slate-400' },
  ket_thuc: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', dot: 'bg-purple-400' },
};

// Check if it's a real uploaded image (not SVG default)
const isRealImage = (url) => {
  if (!url) return false;
  const urlStr = String(url);
  // Check if it's a default SVG file
  const isDefaultSvg = urlStr.includes('/images/activity-') || 
                       urlStr.includes('/images/default-activity') ||
                       (urlStr.endsWith('.svg') && urlStr.includes('/images/'));
  // Real image = not a default SVG
  return !isDefaultSvg;
};

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

export default function TeacherActivityCardInline({
  activity,
  viewMode,
  isWritable,
  onApprove,
  onReject,
  onViewDetail,
  onEdit,
  onDelete
}) {
  const {
    startDate,
    endDate,
    status,
    timeStatus,
    timeStatusColor,
    activityType,
    isOpen
  } = useMemo(() => buildActivityMeta(activity), [activity]);

  const activityImage = getActivityImage(activity?.hinh_anh, activity?.loai_hd?.ten_loai_hd);
  const hasRealImage = isRealImage(activityImage);
  const typeGradient = getTypeGradient(activity?.loai_hd?.ten_loai_hd);

  if (!activity) return null;

  if (viewMode === 'list') {
    return (
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        <div className="relative bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-indigo-300 transition-all duration-200">
          <div className="flex items-stretch gap-4 p-4">
            {/* Image */}
            <div className={`relative w-40 h-32 flex-shrink-0 rounded-lg overflow-hidden ${!hasRealImage ? `bg-gradient-to-br ${typeGradient}` : ''}`}>
              {hasRealImage && (
                <img
                  src={activityImage}
                  alt={activity.ten_hd}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              {isOpen && (
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-bold shadow-sm">
                    <Sparkles className="h-3 w-3" />
                    Đang mở ĐK
                  </span>
                </div>
              )}
              <div className="absolute bottom-2 left-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/90 backdrop-blur-sm text-white shadow-sm text-xs font-bold">
                  <Trophy className="h-3 w-3" />
                  +{activity.diem_rl || 0}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 flex-1">
                    {activity.ten_hd || 'Hoạt động'}
                  </h3>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${status.bg} ${status.text} border ${status.border} whitespace-nowrap`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                    {statusLabels[activity.trang_thai] || activity.trang_thai}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
                    <Calendar className="h-3 w-3" />
                    {activityType}
                  </span>
                  <span className={`text-xs font-semibold ${timeStatusColor}`}>• {timeStatus}</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <InfoRow icon={Clock} label={startDate?.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} subLabel={startDate?.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} />
                  <InfoRow icon={MapPin} label={activity.dia_diem || 'Chưa xác định'} />
                  <InfoRow icon={Users} label={activity.don_vi_to_chuc || 'Nhà trường'} />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col justify-center gap-2 flex-shrink-0">
              <ActionButton
                onClick={() => onViewDetail(activity.id)}
                icon={Eye}
                label="Xem"
                gradient="from-indigo-600 to-purple-600"
              />
              {activity.trang_thai === 'cho_duyet' ? (
                <>
                  <ActionButton
                    onClick={() => onApprove(activity.id, activity.ten_hd)}
                    icon={CheckCircle}
                    label="Duyệt"
                    gradient="from-emerald-600 to-teal-600"
                    disabled={!isWritable}
                    disabledTitle="Không thể duyệt hoạt động cho học kỳ đã đóng"
                  />
                  <ActionButton
                    onClick={() => onReject(activity.id, activity.ten_hd)}
                    icon={XCircle}
                    label="Từ chối"
                    gradient="from-rose-600 to-red-600"
                    disabled={!isWritable}
                    disabledTitle="Không thể từ chối hoạt động cho học kỳ đã đóng"
                  />
                </>
              ) : (
                <>
                  {onEdit && (
                    <ActionButton
                      onClick={() => onEdit(activity)}
                      icon={Edit}
                      label="Sửa"
                      variant="outline"
                      disabled={!isWritable}
                      disabledTitle="Không thể sửa hoạt động cho học kỳ đã đóng"
                    />
                  )}
                  {onDelete && (
                    <ActionButton
                      onClick={() => onDelete(activity.id, activity.ten_hd)}
                      icon={Trash2}
                      label="Xóa"
                      variant="danger"
                      disabled={!isWritable}
                      disabledTitle="Không thể xóa hoạt động cho học kỳ đã đóng"
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid mode
  return (
    <div className="group relative h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
      <div className={`relative bg-white border-2 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full ${
        isOpen ? 'border-emerald-200 shadow-lg shadow-emerald-100' : 'border-gray-200 hover:border-indigo-200'
      }`}>
        {/* Image */}
        <div className={`relative w-full h-40 overflow-hidden ${!hasRealImage ? `bg-gradient-to-br ${typeGradient}` : ''}`}>
          {hasRealImage && (
            <img
              src={activityImage}
              alt={activity.ten_hd}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          
          {/* Open badge */}
          {isOpen && (
            <div className="absolute top-0 right-0">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1.5 rounded-bl-xl rounded-tr-xl shadow-lg flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                <span className="text-xs font-bold">Đang mở ĐK</span>
              </div>
            </div>
          )}
          
          {/* Status & Points */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-white/95 backdrop-blur-sm ${status.text} shadow-md`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
              {statusLabels[activity.trang_thai] || activity.trang_thai}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/95 backdrop-blur-sm text-white shadow-md text-xs font-bold">
              <Trophy className="h-3 w-3" />
              +{activity.diem_rl || 0}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors mb-1.5 leading-tight">
              {activity.ten_hd || 'Hoạt động'}
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
              <Calendar className="h-3 w-3" />
              {activityType}
            </span>
          </div>

          <div className="space-y-1.5">
            <InfoRow icon={Clock} label={startDate?.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })} subLabel={startDate?.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} />
            <InfoRow icon={MapPin} label={activity.dia_diem || 'Chưa xác định'} />
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${timeStatusColor}`}>• {timeStatus}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-3 pt-0 mt-auto">
          <div className="flex gap-2 mb-2">
            <ActionButton
              onClick={() => onViewDetail(activity.id)}
              icon={Eye}
              label="Xem"
              gradient="from-indigo-600 to-purple-600"
              fullWidth
            />
          </div>
          {activity.trang_thai === 'cho_duyet' ? (
            <div className="flex gap-2">
              <ActionButton
                onClick={() => onApprove(activity.id, activity.ten_hd)}
                icon={CheckCircle}
                label="Duyệt"
                gradient="from-emerald-600 to-teal-600"
                fullWidth
                disabled={!isWritable}
                disabledTitle="Không thể duyệt hoạt động cho học kỳ đã đóng"
              />
              <ActionButton
                onClick={() => onReject(activity.id, activity.ten_hd)}
                icon={XCircle}
                label="Từ chối"
                gradient="from-rose-600 to-red-600"
                fullWidth
                disabled={!isWritable}
                disabledTitle="Không thể từ chối hoạt động cho học kỳ đã đóng"
              />
            </div>
          ) : (
            <div className="flex gap-2">
              {onEdit && (
                <ActionButton
                  onClick={() => onEdit(activity)}
                  icon={Edit}
                  label="Sửa"
                  variant="outline"
                  fullWidth
                  disabled={!isWritable}
                  disabledTitle="Không thể sửa hoạt động cho học kỳ đã đóng"
                />
              )}
              {onDelete && (
                <ActionButton
                  onClick={() => onDelete(activity.id, activity.ten_hd)}
                  icon={Trash2}
                  label="Xóa"
                  variant="danger"
                  fullWidth
                  disabled={!isWritable}
                  disabledTitle="Không thể xóa hoạt động cho học kỳ đã đóng"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function buildActivityMeta(activity = {}) {
  const parseDateSafe = (value) => {
    try {
      return value ? new Date(value) : null;
    } catch {
      return null;
    }
  };

  const startDate = parseDateSafe(activity.ngay_bd) || new Date();
  const endDate = parseDateSafe(activity.ngay_kt) || startDate;
  const deadline = parseDateSafe(activity.han_dk);
  const now = new Date();
  const isUpcoming = startDate > now;
  const isOngoing = startDate <= now && endDate >= now;
  const isPast = endDate < now;

  const status = statusConfig[activity.trang_thai] || statusConfig.da_duyet;

  const timeStatus = isPast ? 'Đã kết thúc' : isOngoing ? 'Đang diễn ra' : isUpcoming ? 'Sắp diễn ra' : 'Chưa xác định';
  const timeStatusColor = isPast ? 'text-slate-500' : isOngoing ? 'text-emerald-600' : isUpcoming ? 'text-blue-600' : 'text-slate-500';

  const isOpen = (() => {
    const dl = deadline || startDate;
    return dl && dl > now && (activity.trang_thai === 'da_duyet' || activity.trang_thai === 'cho_duyet');
  })();

  return {
    startDate,
    endDate,
    status,
    timeStatus,
    timeStatusColor,
    activityType: activity.loai || activity.loai_hd?.ten_loai_hd || 'Chưa phân loại',
    isOpen
  };
}

function InfoRow({ icon: Icon, label, subLabel }) {
  if (!label) return null;
  return (
    <div className="flex items-start gap-1.5">
      <Icon className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
      <div className="text-xs min-w-0">
        <p className="text-gray-900 font-medium truncate">{label}</p>
        {subLabel && <p className="text-gray-500">{subLabel}</p>}
      </div>
    </div>
  );
}

function ActionButton({ onClick, icon: Icon, label, gradient, variant, fullWidth, disabled = false, disabledTitle }) {
  const baseClasses = "flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm shadow-sm transition-all duration-200 whitespace-nowrap";
  
  if (disabled) {
    return (
      <button
        disabled
        title={disabledTitle || 'Không thể thực hiện cho học kỳ đã đóng'}
        className={`${baseClasses} bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed ${fullWidth ? 'flex-1' : ''}`}
      >
        <Lock className="h-4 w-4" />
        <span>{label}</span>
      </button>
    );
  }
  
  if (variant === 'outline') {
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:shadow-md ${fullWidth ? 'flex-1' : ''}`}
      >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </button>
    );
  }
  
  if (variant === 'danger') {
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 hover:shadow-md ${fullWidth ? 'flex-1' : ''}`}
      >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} bg-gradient-to-r ${gradient} text-white hover:shadow-md ${fullWidth ? 'flex-1' : ''}`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

