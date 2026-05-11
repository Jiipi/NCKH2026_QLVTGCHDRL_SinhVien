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
  Lock,
  CalendarClock,
  CalendarCheck,
  CalendarX,
  LucideIcon
} from 'lucide-react';
import ActivityImageSlideshow from '../../../../../shared/components/ActivityImageSlideshow';
import { Activity } from '../../../types';

interface StatusConfig {
  bg: string;
  border: string;
  text: string;
  dot: string;
}

interface ActivityMeta {
  startDate: Date;
  endDate: Date;
  deadline: Date | null;
  status: StatusConfig;
  timeStatus: string;
  timeStatusColor: string;
  activityType: string;
  isOpen: boolean;
  isDeadlinePast: boolean;
}

interface AdminActivitiesCardProps {
  activity: Activity;
  mode?: 'grid' | 'list';
  onViewDetail: (id: string) => void;
  onEdit: (activity: Activity) => void;
  onDelete: (id: string, name?: string) => void;
  onApprove: (id: string, name?: string) => void;
  onReject: (id: string, name?: string) => void;
  isWritable?: boolean;
}

interface ActionButtonProps {
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  gradient?: string;
  variant?: 'outline' | 'danger';
  fullWidth?: boolean;
  disabled?: boolean;
  disabledTitle?: string;
}

interface InfoRowProps {
  icon: LucideIcon;
  label?: string | null;
  subLabel?: string;
}

const statusLabels: Record<string, string> = {
  cho_duyet: 'Chờ duyệt',
  da_duyet: 'Đã duyệt',
  tu_choi: 'Từ chối',
  da_huy: 'Đã hủy',
  ket_thuc: 'Kết thúc',
};

const statusConfig: Record<string, StatusConfig> = {
  cho_duyet: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-400' },
  da_duyet: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  tu_choi: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-400' },
  da_huy: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', dot: 'bg-slate-400' },
  ket_thuc: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', dot: 'bg-purple-400' },
};

export default function AdminActivitiesCard({
  activity,
  mode = 'grid',
  onViewDetail,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  isWritable = true
}: AdminActivitiesCardProps): React.ReactElement {
  const {
    startDate,
    endDate,
    deadline,
    status,
    timeStatus,
    timeStatusColor,
    activityType,
    isOpen,
    isDeadlinePast
  } = useMemo(() => buildActivityMeta(activity), [activity]);

  if (mode === 'list') {
    return (
      <div className="group relative">
        <div className="absolute inset-0 rounded-[1.5rem] bg-indigo-500/5 opacity-0 blur transition-opacity duration-200 group-hover:opacity-100"></div>
        <div className="relative rounded-[1.5rem] border border-white/60 bg-white/60 shadow-sm backdrop-blur-2xl transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200/70 hover:bg-white/75 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/60 dark:hover:bg-white/10">
          <div className="flex items-stretch gap-4 p-4">
            {/* Image */}
            <div className="relative w-40 h-32 flex-shrink-0 rounded-lg overflow-hidden">
              <ActivityImageSlideshow
                images={activity.hinh_anh}
                activityType={activity.loai_hd?.ten_loai_hd}
                alt={activity.ten_hd}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                showDots={true}
              />
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
                    {statusLabels[activity.trang_thai || ''] || activity.trang_thai}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
                    <Calendar className="h-3 w-3" />
                    {activityType}
                  </span>
                  <span className={`text-xs font-semibold ${timeStatusColor}`}>• {timeStatus}</span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {startDate && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <CalendarClock className="h-3.5 w-3.5 text-blue-500" />
                      <span className="text-gray-900 font-medium">
                        BĐ: {startDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}, {startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  {endDate && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <CalendarCheck className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-gray-900 font-medium">
                        KT: {endDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}, {endDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  {deadline && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <CalendarX className={`h-3.5 w-3.5 ${isDeadlinePast ? 'text-red-500' : 'text-orange-500'}`} />
                      <span className={`font-medium ${isDeadlinePast ? 'text-red-600' : 'text-gray-900'}`}>
                        Hạn ĐK: {deadline.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}, {deadline.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  {activity.dia_diem && (
                    <div className="flex items-center gap-1.5 text-xs col-span-2">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-600 truncate">{activity.dia_diem}</span>
                    </div>
                  )}
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
                  <ActionButton
                    onClick={() => onEdit(activity)}
                    icon={Edit}
                    label="Sửa"
                    variant="outline"
                    disabled={!isWritable}
                    disabledTitle="Không thể sửa hoạt động cho học kỳ đã đóng"
                  />
                  <ActionButton
                    onClick={() => onDelete(activity.id, activity.ten_hd)}
                    icon={Trash2}
                    label="Xóa"
                    variant="danger"
                    disabled={!isWritable}
                    disabledTitle="Không thể xóa hoạt động cho học kỳ đã đóng"
                  />
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
      <div className="absolute inset-0 rounded-[1.5rem] bg-indigo-500/5 opacity-0 blur transition-opacity duration-300 group-hover:opacity-100"></div>
      <div className={`relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border bg-white/60 shadow-sm backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/75 hover:shadow-lg dark:bg-slate-900/60 dark:hover:bg-white/10 ${
        isOpen ? 'border-emerald-200/70 dark:border-emerald-400/20' : 'border-white/60 hover:border-indigo-200/70 dark:border-white/10 dark:hover:border-indigo-400/20'
      }`}>
        {/* Image */}
        <div className="relative w-full h-40 overflow-hidden">
          <ActivityImageSlideshow
            images={activity.hinh_anh}
            activityType={activity.loai_hd?.ten_loai_hd}
            alt={activity.ten_hd}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            showDots={true}
          />
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
              {statusLabels[activity.trang_thai || ''] || activity.trang_thai}
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
            <h3 className="mb-1.5 line-clamp-2 text-sm font-bold leading-tight text-slate-950 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-300">
              {activity.ten_hd || 'Hoạt động'}
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
              <Calendar className="h-3 w-3" />
              {activityType}
            </span>
          </div>

          <div className="space-y-1.5">
            {startDate && (
              <div className="flex items-center gap-1.5 text-xs">
                <CalendarClock className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                <span className="font-medium text-gray-900">
                  Bắt đầu: {startDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}, {startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
            {endDate && (
              <div className="flex items-center gap-1.5 text-xs">
                <CalendarCheck className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                <span className="font-medium text-gray-900">
                  Kết thúc: {endDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}, {endDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
            {deadline && (
              <div className="flex items-center gap-1.5 text-xs">
                <CalendarX className={`h-3.5 w-3.5 flex-shrink-0 ${isDeadlinePast ? 'text-red-500' : 'text-orange-500'}`} />
                <span className={`font-medium ${isDeadlinePast ? 'text-red-600' : 'text-gray-900'}`}>
                  Hạn ĐK: {deadline.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}, {deadline.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
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
              <ActionButton
                onClick={() => onEdit(activity)}
                icon={Edit}
                label="Sửa"
                variant="outline"
                fullWidth
                disabled={!isWritable}
                disabledTitle="Không thể sửa hoạt động cho học kỳ đã đóng"
              />
              <ActionButton
                onClick={() => onDelete(activity.id, activity.ten_hd)}
                icon={Trash2}
                label="Xóa"
                variant="danger"
                fullWidth
                disabled={!isWritable}
                disabledTitle="Không thể xóa hoạt động cho học kỳ đã đóng"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function buildActivityMeta(activity: Activity = {} as Activity): ActivityMeta {
  const parseDateSafe = (value?: string | Date): Date | null => {
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

  const status = statusConfig[activity.trang_thai || ''] || statusConfig.da_duyet;

  const timeStatus = isPast ? 'Đã kết thúc' : isOngoing ? 'Đang diễn ra' : isUpcoming ? 'Sắp diễn ra' : 'Chưa xác định';
  const timeStatusColor = isPast ? 'text-slate-500' : isOngoing ? 'text-emerald-600' : isUpcoming ? 'text-blue-600' : 'text-slate-500';

  const isOpen = (() => {
    const dl = deadline || startDate;
    return dl && dl > now && (activity.trang_thai === 'da_duyet' || activity.trang_thai === 'cho_duyet');
  })();

  return {
    startDate,
    endDate,
    deadline,
    status,
    timeStatus,
    timeStatusColor,
    activityType: activity.loai || activity.loai_hd?.ten_loai_hd || 'Chưa phân loại',
    isOpen,
    isDeadlinePast
  };
}

function InfoRow({ icon: Icon, label, subLabel }: InfoRowProps): React.ReactElement | null {
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

function ActionButton({ onClick, icon: Icon, label, gradient, variant, fullWidth, disabled = false, disabledTitle }: ActionButtonProps): React.ReactElement {
  const baseClasses = "flex items-center justify-center gap-1.5 rounded-2xl px-3 py-2 text-sm font-bold shadow-sm transition-all duration-200 whitespace-nowrap";
  
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
        className={`${baseClasses} border border-white/60 bg-white/55 text-slate-700 backdrop-blur-xl hover:bg-white/80 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 ${fullWidth ? 'flex-1' : ''}`}
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
        className={`${baseClasses} border border-rose-200/70 bg-rose-50/70 text-rose-700 backdrop-blur-xl hover:bg-rose-100/70 hover:shadow-md dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300 ${fullWidth ? 'flex-1' : ''}`}
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
