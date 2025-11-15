import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Clock, Users, Award, UserPlus, Eye, AlertCircle, CheckCircle, Info } from 'lucide-react';
import http from '../../../shared/api/http';
import { useNotification } from '../../../contexts/NotificationContext';
import { getActivityImage, getDefaultActivityImage } from '../../../shared/lib/activityImages';

export default function ActivityDetailModal({ activityId, isOpen, onClose }) {
  const { showSuccess, showError, confirm } = useNotification();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get current user role (robust across shapes), always UPPERCASE
  const getCurrentUserRole = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        // Try multiple shapes: string, object.ten_vt, or other common fields
        let roleValue = null;
        if (typeof user?.vai_tro === 'string') {
          roleValue = user.vai_tro;
        } else if (user?.vai_tro && typeof user.vai_tro === 'object' && user.vai_tro.ten_vt) {
          roleValue = user.vai_tro.ten_vt;
        } else if (user?.ten_vt) {
          roleValue = user.ten_vt;
        } else if (user?.role) {
          roleValue = user.role;
        }
        const normalized = String(roleValue || '').toUpperCase().trim();
        // Debug once for verification (can be removed later)
        console.debug('ActivityDetailModal role:', normalized);
        return normalized || null;
      }
    } catch (err) {
      console.error('Error parsing user from localStorage:', err);
    }
    return null;
  };

  const userRole = getCurrentUserRole();

  useEffect(() => {
    if (isOpen && activityId) {
      loadActivityDetail();
    } else {
      // Reset data when modal closes
      setData(null);
      setError('');
    }
  }, [isOpen, activityId]);

  async function loadActivityDetail() {
    if (loading) return; // Prevent multiple simultaneous requests
    setLoading(true);
    setError('');
    try {
      const res = await http.get(`/activities/${activityId}`);
      setData(res.data?.data || null);
    } catch (err) {
      setError('Không thể tải chi tiết hoạt động');
      console.error('Load activity detail error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    if (!data) return;
    
    const confirmed = await confirm({
      title: 'Xác nhận đăng ký',
      message: `Bạn có chắc muốn đăng ký tham gia "${data.ten_hd}"?`,
      confirmText: 'Đăng ký',
      cancelText: 'Hủy'
    });
    
    if (!confirmed) return;
    
    try {
      const res = await http.post(`/activities/${activityId}/register`);
      if (res.data?.success) {
        showSuccess('Đăng ký thành công', 'Thành công', 12000);
        // Reload data to update registration status
        loadActivityDetail();
      } else {
        showSuccess(res.data?.message || 'Đăng ký thành công', 'Thông báo', 10000);
        loadActivityDetail();
      }
    } catch (err) {
      const firstValidation = err?.response?.data?.errors?.[0]?.message;
      const errorMsg = firstValidation || err?.response?.data?.message || err?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      showError(errorMsg);
    }
  }

  if (!isOpen) return null;

  const start = data?.ngay_bd ? new Date(data.ngay_bd) : null;
  const end = data?.ngay_kt ? new Date(data.ngay_kt) : null;
  const deadline = data?.han_dk ? new Date(data.han_dk) : null;
  const now = new Date();
  
  const withinTime = start && end ? (start <= now && end >= now) || start > now : true;
  const isDeadlinePast = deadline ? deadline < now : false;
  
  // Determine if user can register
  const isRegistered = data?.isRegistered || false;
  const canRegister = userRole === 'SINH VIÊN' && !isRegistered && withinTime && !isDeadlinePast;

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
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {data && !loading && !error && (
            <div className="space-y-6">
              {/* Activity Image */}
              <div className="w-full h-64 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
                <img
                  src={getActivityImage(data.hinh_anh, data.loai_hd?.ten_loai_hd)}
                  alt={data.ten_hd}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = getDefaultActivityImage(data.loai_hd?.ten_loai_hd);
                  }}
                />
              </div>

              {/* Title */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{data.ten_hd}</h3>
                {data.mo_ta && (
                  <p className="text-gray-600 leading-relaxed">{data.mo_ta}</p>
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
                {data.dia_diem && (
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                    <MapPin className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Địa điểm</p>
                      <p className="text-base text-gray-900">{data.dia_diem}</p>
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

                {/* Participants */}
                {data.so_luong_tg !== undefined && (
                  <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <Users className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Số lượng tham gia</p>
                      <p className="text-base text-gray-900">{data.so_luong_tg} người</p>
                    </div>
                  </div>
                )}

                {/* Points */}
                {data.diem_rl !== undefined && (
                  <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                    <Award className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Điểm rèn luyện</p>
                      <p className="text-base text-gray-900">{data.diem_rl} điểm</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Registration Status */}
              {isRegistered && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-700">
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">Bạn đã đăng ký hoạt động này</span>
                </div>
              )}

              {/* Info Message for non-students */}
              {userRole !== 'SINH VIÊN' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3 text-blue-700">
                  <Info className="h-5 w-5 flex-shrink-0" />
                  <span>Chỉ sinh viên mới có thể đăng ký tham gia hoạt động</span>
                </div>
              )}

              {/* Deadline passed message */}
              {userRole === 'SINH VIÊN' && !isRegistered && isDeadlinePast && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>Hạn đăng ký đã hết. Không thể đăng ký hoạt động này.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Đóng
          </button>
          
          {canRegister && (
            <button
              onClick={handleRegister}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <UserPlus className="h-5 w-5" />
              Đăng ký tham gia
            </button>
          )}
          
          {isRegistered && (
            <button
              disabled
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg cursor-not-allowed font-medium flex items-center gap-2"
            >
              <CheckCircle className="h-5 w-5" />
              Đã đăng ký
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
