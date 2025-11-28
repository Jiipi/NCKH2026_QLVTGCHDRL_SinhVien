import React from 'react';
import { Eye, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { getUserAvatar } from '../../../../../shared/lib/avatar';
import { getBestActivityImage } from '../../../../../shared/lib/activityImages';
import { getStatusColor, getStatusText, getStatusIcon } from './registrationUtils';

export default function AdminRegistrationCard({ 
  registration, 
  viewMode, 
  isSelected, 
  onToggleSelect, 
  onViewActivity, 
  onApprove, 
  onReject 
}) {
  const status = registration.trang_thai_dk || registration.trang_thai;
  const activity = registration.hoat_dong;
  const student = registration.sinh_vien;

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="flex">
        <div className="w-48 h-48 flex-shrink-0 relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          <img
            src={getBestActivityImage(activity)}
            alt={activity?.ten_hd}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/200x200?text=No+Image'; }}
          />
          {viewMode === 'pending' && (
            <div className="absolute top-2 left-2">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onToggleSelect}
                className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
            </div>
          )}
        </div>

        <div className="flex-1 p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{activity?.ten_hd}</h3>
              <p className="text-sm text-gray-500 font-mono">{activity?.ma_hd}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(status)}`}>
              {getStatusIcon(status)}
              {getStatusText(status)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {(() => {
                  const avatar = getUserAvatar(student?.nguoi_dung);
                  return avatar.hasValidAvatar ? (
                    <img src={avatar.src} alt={avatar.alt} className="w-10 h-10 rounded-full object-cover border-2 border-orange-200" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold border-2 border-orange-200">
                      {avatar.fallback}
                    </div>
                  );
                })()}
                <div>
                  <p className="font-medium text-gray-900 text-sm">{student?.nguoi_dung?.ho_ten}</p>
                  <p className="text-xs text-gray-500 font-mono">{student?.mssv || student?.ma_sv}</p>
                </div>
              </div>
              <p className="text-xs text-gray-600"><span className="font-medium">Lớp:</span> {student?.lop?.ten_lop || student?.lop || 'N/A'}</p>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span className="text-xs">{registration.ngay_dang_ky || registration.ngay_dk ? new Date(registration.ngay_dang_ky || registration.ngay_dk).toLocaleDateString('vi-VN') : 'N/A'}</span>
              </div>
              {registration.ngay_duyet && (
                <div className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs">Duyệt: {new Date(registration.ngay_duyet).toLocaleDateString('vi-VN')}</span>
                </div>
              )}
            </div>
          </div>

          {registration.ly_do_dk && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-700 mb-1">Lý do đăng ký:</p>
              <p className="text-sm text-gray-600 line-clamp-2">{registration.ly_do_dk}</p>
            </div>
          )}

          {registration.ly_do_tu_choi && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs font-medium text-red-700 mb-1">Lý do từ chối:</p>
              <p className="text-sm text-red-600">{registration.ly_do_tu_choi}</p>
            </div>
          )}

          <div className="flex gap-2 pt-3 border-t">
            <button 
              onClick={() => onViewActivity(activity)} 
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium shadow-md"
            >
              <Eye className="w-4 h-4" /> Xem hoạt động
            </button>
            {status === 'cho_duyet' && (
              <>
                <button 
                  onClick={() => onApprove(registration.id)} 
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium shadow-md"
                >
                  <CheckCircle className="w-4 h-4" /> Phê duyệt
                </button>
                <button 
                  onClick={() => onReject(registration.id)} 
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium shadow-md"
                >
                  <XCircle className="w-4 h-4" /> Từ chối
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

