import React, { useMemo } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  AlertCircle,
  Info,
  UserPlus,
  Eye,
  Trophy
} from 'lucide-react';
import { getActivityImage } from '../../../../../shared/lib/activityImages';

export default function ActivitiesListCard({
  activity,
  mode = 'grid',
  role,
  isWritable,
  onRegister,
  onViewDetail
}) {
  const {
    startDate,
    endDate,
    status,
    timeStatus,
    timeStatusColor,
    canRegister,
    isDeadlinePast,
    isAfterStart,
    activityType,
    registrationRejected,
    rejectionReason
  } = useMemo(() => buildActivityMeta(activity, role, isWritable), [activity, role, isWritable]);

  if (mode === 'list') {
    return (
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        <div className="relative bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all duration-200">
          <div className="flex items-stretch gap-4 p-4">
            <div className="relative w-36 h-28 flex-shrink-0 rounded-lg overflow-hidden">
              <img
                src={getActivityImage(activity.hinh_anh, activity.loai_hd?.ten_loai_hd)}
                alt={activity.ten_hd}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              <div className="absolute top-2 left-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${status.bg} ${status.text} border ${status.border} shadow-sm`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                  {status.label}
                </span>
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/90 backdrop-blur-sm text-white shadow-sm text-xs font-bold w-fit">
                  <Trophy className="h-3 w-3" />
                  +{activity.diem_rl || 0}
                </span>
              </div>
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 flex-1">
                    {activity.ten_hd || 'Hoạt động'}
                  </h3>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-200">
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

              {(isDeadlinePast || isAfterStart || registrationRejected) && (
                <div className="flex flex-col gap-1.5 mt-2">
                  {(isDeadlinePast || isAfterStart) && (
                    <Badge icon={AlertCircle} text="Đã hết hạn đăng ký" />
                  )}
                  {registrationRejected && rejectionReason && (
                    <Badge icon={Info} text={rejectionReason} />
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center gap-2 flex-shrink-0">
              {canRegister && (
                <ActionButton
                  onClick={() => onRegister(activity.id, activity.ten_hd)}
                  icon={UserPlus}
                  label={registrationRejected ? 'ĐK lại' : 'Đăng ký'}
                  gradient="from-green-600 to-emerald-600"
                />
              )}
              <ActionButton
                onClick={() => onViewDetail(activity.id)}
                icon={Eye}
                label="Chi tiết"
                gradient="from-blue-600 to-indigo-600"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl blur opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
      <div className="relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col h-full">
        <div className="relative w-full h-36 overflow-hidden">
          <img
            src={getActivityImage(activity.hinh_anh, activity.loai_hd?.ten_loai_hd)}
            alt={activity.ten_hd}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-white/95 backdrop-blur-sm ${status.text} shadow-md`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
              {status.label}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/95 backdrop-blur-sm text-white shadow-md text-xs font-bold">
              <Trophy className="h-3 w-3" />
              +{activity.diem_rl || 0}
            </span>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-1.5 leading-tight">
              {activity.ten_hd || 'Hoạt động'}
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-200">
              <Calendar className="h-3 w-3" />
              {activityType}
            </span>
          </div>

          <div className="space-y-1.5">
            <InfoRow icon={Clock} label={startDate?.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })} subLabel={startDate?.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} />
            <InfoRow icon={MapPin} label={activity.dia_diem || 'Chưa xác định'} />
          </div>

          <div className="flex flex-col gap-1">
            <span className={`text-xs font-semibold ${timeStatusColor}`}>• {timeStatus}</span>
            {(isDeadlinePast || isAfterStart) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200 w-fit">
                <AlertCircle className="h-3 w-3" />
                Hết hạn ĐK
              </span>
            )}
            {registrationRejected && rejectionReason && (
              <Badge icon={AlertCircle} text={rejectionReason} />
            )}
          </div>
        </div>

        <div className="p-3 pt-0 mt-auto flex gap-2">
          {canRegister && (
            <ActionButton
              onClick={() => onRegister(activity.id, activity.ten_hd)}
              icon={UserPlus}
              label={registrationRejected ? 'ĐK lại' : 'Đăng ký'}
              gradient="from-green-600 to-emerald-600"
              fullWidth
            />
          )}
          <ActionButton
            onClick={() => onViewDetail(activity.id)}
            icon={Eye}
            label="Chi tiết"
            gradient="from-blue-600 to-indigo-600"
            fullWidth={!canRegister}
          />
        </div>
      </div>
    </div>
  );
}

function buildActivityMeta(activity = {}, role, isWritable) {
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
  const isDeadlinePast = deadline ? deadline.getTime() < now.getTime() : false;
  const isAfterStart = now.getTime() >= startDate.getTime();

  const registrationStatusConfig = {
    cho_duyet: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-400', label: 'Chờ duyệt' },
    da_duyet: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-400', label: 'Đã duyệt' },
    tu_choi: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-400', label: 'Từ chối' },
    da_tham_gia: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-400', label: 'Đã tham gia' }
  };

  const activityStatusConfig = {
    cho_duyet: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', dot: 'bg-gray-400', label: 'Chờ duyệt' },
    da_duyet: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', dot: 'bg-green-400', label: 'Đã mở' },
    tu_choi: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-400', label: 'Từ chối' },
    ket_thuc: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', dot: 'bg-slate-400', label: 'Kết thúc' }
  };

  const status = activity.is_registered && activity.registration_status
    ? registrationStatusConfig[activity.registration_status] || activityStatusConfig.da_duyet
    : activityStatusConfig[activity.trang_thai] || activityStatusConfig.da_duyet;

  const timeStatus = isPast ? 'Đã kết thúc' : isOngoing ? 'Đang diễn ra' : isUpcoming ? 'Sắp diễn ra' : 'Chưa xác định';
  const timeStatusColor = isPast ? 'text-slate-500' : isOngoing ? 'text-emerald-600' : isUpcoming ? 'text-blue-600' : 'text-slate-500';

  const canRegister =
    activity.trang_thai === 'da_duyet' &&
    !isPast &&
    !isDeadlinePast &&
    !isAfterStart &&
    (!activity.is_registered || activity.registration_status === 'tu_choi') &&
    role !== 'giang_vien' &&
    role !== 'teacher' &&
    isWritable;

  return {
    startDate,
    endDate,
    status,
    timeStatus,
    timeStatusColor,
    canRegister,
    isDeadlinePast,
    isAfterStart,
    activityType: activity.loai || activity.loai_hd?.ten_loai_hd || 'Chưa phân loại',
    registrationRejected: activity.registration_status === 'tu_choi',
    rejectionReason: activity.rejection_reason
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

function Badge({ icon: Icon, text }) {
  return (
    <div className="flex items-start gap-1.5 px-2 py-1 bg-red-50 border border-red-200 rounded-md">
      <Icon className="h-3.5 w-3.5 text-red-600 flex-shrink-0 mt-0.5" />
      <span className="text-xs text-red-600 line-clamp-1">{text}</span>
    </div>
  );
}

function ActionButton({ onClick, icon: Icon, label, gradient, fullWidth }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[100px] bg-gradient-to-r ${gradient} text-white ${fullWidth ? 'flex-1' : ''}`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

