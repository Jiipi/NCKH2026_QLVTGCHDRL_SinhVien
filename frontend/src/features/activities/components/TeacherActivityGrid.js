import React from 'react';
import { Calendar, MapPin, Users, Award, Eye, CheckCircle, XCircle } from 'lucide-react';
import { getActivityImage } from '../../../shared/lib/activityImages';
import { getStatusColor } from '../utils/activityUiHelpers';

export const TeacherActivityGrid = ({ activities, onViewDetails, onApprove, onReject, isProcessing, isWritable }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {activities.map((activity) => {
        const statusInfo = getStatusColor(activity.trang_thai);
        const registeredCount = activity.registrationCount ?? activity.so_dang_ky ?? activity._count?.dang_ky_hd ?? 0;
        const capacity = activity.sl_toi_da ?? activity.so_luong_toi_da ?? 0;
        return (
          <div key={activity.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col bg-white">
            <div className="relative w-full h-40 group">
              <img 
                src={getActivityImage(activity.hinh_anh, activity.loai_hd?.ten_loai_hd)}
                alt={activity.ten_hd}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
                {statusInfo.label}
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-2 h-12">{activity.ten_hd || 'Chưa có tên'}</h3>
              <div className="space-y-2 text-sm text-gray-600 mb-3 flex-1">
                <div className="flex items-center gap-2" title="Thời gian bắt đầu">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{activity.ngay_bd ? new Date(activity.ngay_bd).toLocaleDateString('vi-VN') : 'Chưa có'}</span>
                </div>
                <div className="flex items-center gap-2" title="Địa điểm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="truncate">{activity.dia_diem || 'Chưa có'}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="inline-flex items-center gap-1 text-gray-700" title="Số lượng đăng ký">
                    <Users className="h-4 w-4 text-gray-400" />{registeredCount} / {capacity || '∞'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-green-600 font-medium" title="Điểm rèn luyện">
                    <Award className="h-4 w-4" />{activity.diem_rl || 0}
                  </span>
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => onViewDetails(activity)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                >
                  <Eye className="h-4 w-4" />
                  Chi tiết
                </button>
                {activity.trang_thai === 'cho_duyet' && isWritable && (
                  <>
                    <button
                      onClick={() => onApprove(activity.id)}
                      disabled={isProcessing}
                      className='p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed'
                      title="Phê duyệt"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onReject(activity.id)}
                      disabled={isProcessing}
                      className='p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed'
                      title="Từ chối"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
