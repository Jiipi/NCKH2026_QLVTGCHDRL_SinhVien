import React from 'react';
import {
  Calendar, MapPin, Users, Clock, Eye, UserPlus, Trophy, AlertCircle
} from 'lucide-react';
import { getActivityImage } from '../../../shared/lib/activityImages';

const parseDateSafe = (d) => {
  try { return d ? new Date(d) : null; } catch (_) { return null; }
};

// Component to display the status of the activity (e.g., 'Đã mở', 'Chờ duyệt')
const ActivityStatusBadge = ({ activity }) => {
    const registrationStatusConfig = {
      'cho_duyet': { text: 'text-amber-700', dot: 'bg-amber-400', label: 'Chờ duyệt' },
      'da_duyet': { text: 'text-emerald-700', dot: 'bg-emerald-400', label: 'Đã duyệt' },
      'tu_choi': { text: 'text-rose-700', dot: 'bg-rose-400', label: 'Từ chối' },
      'da_tham_gia': { text: 'text-blue-700', dot: 'bg-blue-400', label: 'Đã tham gia' }
    };

    const activityStatusConfig = {
      'cho_duyet': { text: 'text-gray-700', dot: 'bg-gray-400', label: 'Chờ duyệt' },
      'da_duyet': { text: 'text-green-700', dot: 'bg-green-400', label: 'Đã mở' },
      'tu_choi': { text: 'text-red-700', dot: 'bg-red-400', label: 'Từ chối' },
      'ket_thuc': { text: 'text-slate-700', dot: 'bg-slate-400', label: 'Kết thúc' }
    };

    const status = activity.is_registered && activity.registration_status
      ? registrationStatusConfig[activity.registration_status]
      : activityStatusConfig[activity.trang_thai];

    if (!status) return null;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-white/95 backdrop-blur-sm ${status.text} shadow-md`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
            {status.label}
        </span>
    );
};

export function ActivityCard({ activity, mode = 'grid', onRegister, onViewDetail, isWritable, role }) {
  const startDate = parseDateSafe(activity.ngay_bd) || new Date();
  const endDate = parseDateSafe(activity.ngay_kt) || startDate;
  const now = new Date();
  const isPast = endDate < now;
  const deadline = activity.han_dk ? parseDateSafe(activity.han_dk) : null;
  const isDeadlinePast = deadline ? (deadline.getTime() < now.getTime()) : false;
  const isAfterStart = now.getTime() >= startDate.getTime();

  const canRegister = activity.trang_thai === 'da_duyet' && 
                      !isPast && 
                      !isDeadlinePast && 
                      !isAfterStart && 
                      (!activity.is_registered || activity.registration_status === 'tu_choi') && 
                      role !== 'giang_vien' && 
                      role !== 'teacher' && 
                      isWritable;

  const activityType = activity.loai_hd?.ten_loai_hd || 'Chưa phân loại';

  if (mode === 'list') {
    return (
        <div className="group relative bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all duration-200">
            <div className="flex items-stretch gap-4 p-4">
                <div className="relative w-36 h-28 flex-shrink-0 rounded-lg overflow-hidden">
                    <img 
                        src={getActivityImage(activity.hinh_anh, activity.loai_hd?.ten_loai_hd)} 
                        alt={activity.ten_hd}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                        <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {activity.ten_hd || 'Hoạt động'}
                        </h3>
                        <div className="flex items-center gap-2 my-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-200">
                                <Calendar className="h-3 w-3" />
                                {activityType}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                            <div className="flex items-start gap-1.5"><Clock className="h-4 w-4 text-gray-400 mt-0.5" /><p>{startDate.toLocaleDateString('vi-VN')}</p></div>
                            <div className="flex items-start gap-1.5"><MapPin className="h-4 w-4 text-gray-400 mt-0.5" /><p>{activity.dia_diem || 'N/A'}</p></div>
                            <div className="flex items-start gap-1.5"><Users className="h-4 w-4 text-gray-400 mt-0.5" /><p>{activity.don_vi_to_chuc || 'N/A'}</p></div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col justify-center gap-2 flex-shrink-0">
                    {canRegister && (
                        <button onClick={() => onRegister(activity.id, activity.ten_hd)} className="flex items-center justify-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm shadow-md hover:shadow-lg transition-all">
                            <UserPlus className="h-4 w-4" />
                            <span>{activity.registration_status === 'tu_choi' ? 'ĐK lại' : 'Đăng ký'}</span>
                        </button>
                    )}
                    <button onClick={() => onViewDetail(activity.id)} className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm shadow-md hover:shadow-lg transition-all">
                        <Eye className="h-4 w-4" />
                        <span>Chi tiết</span>
                    </button>
                </div>
            </div>
        </div>
    );
  }

  // GRID MODE
  return (
    <div className="group relative h-full bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col">
        <div className="relative w-full h-36 overflow-hidden">
            <img 
                src={getActivityImage(activity.hinh_anh, activity.loai_hd?.ten_loai_hd)} 
                alt={activity.ten_hd}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                <ActivityStatusBadge activity={activity} />
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/95 text-white shadow-md text-xs font-bold">
                    <Trophy className="h-3 w-3" />
                    +{activity.diem_rl || 0}
                </span>
            </div>
        </div>
        <div className="flex-1 p-4 space-y-3">
            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                {activity.ten_hd || 'Hoạt động'}
            </h3>
            <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-gray-400" /><p>{startDate.toLocaleDateString('vi-VN')}</p></div>
                <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-gray-400" /><p>{activity.dia_diem || 'N/A'}</p></div>
            </div>
            {(isDeadlinePast || isAfterStart) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200 w-fit">
                    <AlertCircle className="h-3 w-3" />
                    Hết hạn ĐK
                </span>
            )}
        </div>
        <div className="p-3 pt-0 mt-auto flex gap-2">
            {canRegister && (
                <button onClick={() => onRegister(activity.id, activity.ten_hd)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg font-medium text-xs shadow-md hover:shadow-lg transition-all">
                    <UserPlus className="h-3.5 w-3.5" />
                    {activity.registration_status === 'tu_choi' ? 'ĐK lại' : 'Đăng ký'}
                </button>
            )}
            <button onClick={() => onViewDetail(activity.id)} className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg font-medium text-xs shadow-md hover:shadow-lg transition-all`}>
                <Eye className="h-3.5 w-3.5" />
                Chi tiết
            </button>
        </div>
    </div>
  );
}
