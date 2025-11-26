import React from 'react';
import { Calendar, MapPin, Users, Award, Eye, CheckCircle, XCircle } from 'lucide-react';
import { getActivityImage } from '../../../shared/lib/activityImages';
import { getStatusColor } from '../utils/activityUiHelpers';

export const TeacherActivityList = ({ activities, onViewDetails, onApprove, onReject, isProcessing, isWritable }) => {
  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const statusInfo = getStatusColor(activity.trang_thai);
        const registeredCount = activity.registrationCount ?? activity.so_dang_ky ?? activity._count?.dang_ky_hd ?? 0;
        const capacity = activity.sl_toi_da ?? activity.so_luong_toi_da ?? 0;
        return (
          <div 
            key={activity.id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col md:flex-row bg-white"
          >
            {/* Activity Image */}
            <div className="relative w-full md:w-48 h-40 md:h-auto flex-shrink-0">
              <img 
                src={getActivityImage(activity.hinh_anh, activity.loai_hd?.ten_loai_hd)}
                alt={activity.ten_hd}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 p-4 flex flex-col md:flex-row justify-between items-start">
              <div className="flex-1 mb-4 md:mb-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {activity.ten_hd || 'Chưa có tên'}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
                    {statusInfo.label}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-3 text-sm line-clamp-2">{activity.mo_ta || 'Không có mô tả'}</p>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2" title="Địa điểm">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className='truncate'>{activity.dia_diem || 'Chưa có'}</span>
                  </div>
                  <div className="flex items-center gap-2" title="Thời gian">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>{activity.ngay_bd ? new Date(activity.ngay_bd).toLocaleDateString('vi-VN') : 'Chưa có'}</span>
                  </div>
                  <div className="flex items-center gap-2" title="Số lượng">
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span>{registeredCount} / {capacity || '∞'}</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-green-600" title="Điểm rèn luyện">
                    <Award className="h-4 w-4 flex-shrink-0" />
                    <span>{activity.diem_rl || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 md:ml-4 flex-shrink-0 self-start md:self-center">
                <button
                  onClick={() => onViewDetails(activity)}
                  className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm font-semibold"
                >
                  <Eye className="h-4 w-4" />
                  Chi tiết
                </button>
                
                {activity.trang_thai === 'cho_duyet' && isWritable && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onApprove(activity.id)}
                      disabled={isProcessing}
                      className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Duyệt
                    </button>
                    <button
                      onClick={() => onReject(activity.id)}
                      disabled={isProcessing}
                      className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="h-4 w-4" />
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
