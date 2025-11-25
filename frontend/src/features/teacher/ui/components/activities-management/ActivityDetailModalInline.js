import React from 'react';
import { XCircle } from 'lucide-react';

export default function ActivityDetailModalInline({
  activity,
  isOpen,
  onClose,
  getStatusLabel
}) {
  if (!isOpen || !activity) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Chi tiết hoạt động</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên hoạt động</label>
            <p className="text-gray-900">{activity.ten_hd || 'Chưa có tên'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <p className="text-gray-900">{activity.mo_ta || 'Không có mô tả'}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm</label>
              <p className="text-gray-900">{activity.dia_diem || 'Chưa có địa điểm'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng tối đa</label>
              <p className="text-gray-900">{activity.sl_toi_da || 0} người</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian bắt đầu</label>
              <p className="text-gray-900">
                {activity.ngay_bd ? new Date(activity.ngay_bd).toLocaleString('vi-VN') : 'Chưa có thời gian'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian kết thúc</label>
              <p className="text-gray-900">
                {activity.ngay_kt ? new Date(activity.ngay_kt).toLocaleString('vi-VN') : 'Chưa có thời gian'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Điểm rèn luyện</label>
              <p className="text-gray-900">{activity.diem_rl || 0} điểm</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <p className="text-gray-900">{getStatusLabel(activity.trang_thai)}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Người tạo</label>
              <p className="text-gray-900">
                {activity.nguoi_tao?.ho_ten || activity.nguoi_tao?.email || 'Không xác định'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại hoạt động</label>
              <p className="text-gray-900">
                {activity.loai_hd?.ten_loai_hd || 'Không xác định'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
              <p className="text-gray-900">
                {activity.ngay_tao ? new Date(activity.ngay_tao).toLocaleString('vi-VN') : 'Không xác định'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hạn đăng ký</label>
              <p className="text-gray-900">
                {activity.han_dk ? new Date(activity.han_dk).toLocaleString('vi-VN') : 'Không giới hạn'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

