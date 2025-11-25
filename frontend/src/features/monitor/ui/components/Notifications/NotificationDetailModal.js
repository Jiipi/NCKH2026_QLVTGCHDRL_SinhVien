import React from 'react';
import { MessageSquare, Users, Activity, Calendar } from 'lucide-react';

/**
 * NotificationDetailModal Component - Modal chi tiết thông báo
 */
export default function NotificationDetailModal({ 
  isOpen, 
  notification, 
  onClose 
}) {
  if (!isOpen || !notification) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Chi tiết thông báo
            </h2>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-2 block">Tiêu đề</label>
            <p className="text-lg font-bold text-gray-900">{notification.title}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-2 block">Nội dung</label>
            <p className="text-gray-800 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl border border-gray-200">
              {notification.message?.split('[Phạm vi:')[0]?.trim()}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">Phạm vi gửi</label>
              <div className={`px-4 py-2 rounded-xl font-semibold inline-flex items-center gap-2 ${
                notification.scope === 'class' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {notification.scope === 'class' ? (
                  <>
                    <Users className="h-4 w-4" />Toàn lớp
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4" />Theo hoạt động
                  </>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">Ngày gửi</label>
              <p className="text-gray-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-600" />
                {new Date(notification.date).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
          {notification.activity && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-indigo-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-600" />
                Thông tin hoạt động
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Tên hoạt động</label>
                  <p className="text-gray-900 font-medium">{notification.activity.ten_hd}</p>
                </div>
                {notification.activity.ma_hd && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Mã hoạt động</label>
                    <p className="text-gray-900 font-mono">{notification.activity.ma_hd}</p>
                  </div>
                )}
                {notification.activity.dia_diem && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Địa điểm</label>
                    <p className="text-gray-900">{notification.activity.dia_diem}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Ngày bắt đầu</label>
                    <p className="text-gray-900">{new Date(notification.activity.ngay_bd).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Ngày kết thúc</label>
                    <p className="text-gray-900">{new Date(notification.activity.ngay_kt).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
                {notification.activity.diem_rl && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Điểm rèn luyện</label>
                    <p className="font-bold text-lg text-indigo-600">{notification.activity.diem_rl} điểm</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-2 block">Người nhận</label>
            <div className="flex items-center gap-2 text-gray-900">
              <Users className="h-5 w-5 text-indigo-600" />
              <span className="font-bold text-lg">{notification.recipients} người</span>
            </div>
            {notification.recipientsList && notification.recipientsList.length > 0 && (
              <div className="mt-3 max-h-40 overflow-y-auto bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="space-y-2">
                  {notification.recipientsList.slice(0, 10).map((recipient, idx) => (
                    <div key={idx} className="text-sm text-gray-700">
                      • {recipient.ho_ten || recipient.email}
                    </div>
                  ))}
                  {notification.recipientsList.length > 10 && (
                    <div className="text-sm text-gray-500 italic">
                      ... và {notification.recipientsList.length - 10} người khác
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

