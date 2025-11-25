import React, { useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications } from '../../model/hooks/useNotifications';
import { useDropdown } from '../../../shared/hooks/useDropdown';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'warning': return '⚠️';
    case 'success': return '✅';
    case 'info':
    default: return 'ℹ️';
  }
};

export const NotificationBell = () => {
  const { 
    notifications, unreadCount, loadNotifications, 
    openDetail, detail, closeDetail, markAllAsRead 
  } = useNotifications();
  const { isOpen, toggle, dropdownRef } = useDropdown();

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        onClick={toggle}
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Thông báo</h3>
            {notifications.length > 0 && (
              <button
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                onClick={markAllAsRead}
              >
                <CheckCheck size={14} />
                Đọc tất cả
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Không có thông báo nào</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${notification.unread ? 'bg-blue-50' : ''}`}
                  onClick={() => openDetail(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-lg mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1">
                      <h4 className={`text-sm font-medium ${notification.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                      <span className="text-xs text-gray-500 mt-2 block">{notification.time}</span>
                    </div>
                    {notification.unread && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Detail Modal/Popup could be rendered here or globally */}
      {detail && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={closeDetail}>
           <div className="absolute right-4 top-20 w-96 bg-white rounded-lg shadow-xl border border-gray-200 p-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{detail.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{detail.time} • {detail.sender}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600" onClick={closeDetail}>✕</button>
                </div>
                <p className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">{detail.message}</p>
                {detail.activity && (
                  <div className="mt-3 p-3 bg-gray-50 rounded border">
                    <div className="text-sm font-medium text-gray-800">Hoạt động liên quan</div>
                    <div className="text-sm text-gray-700 mt-1">{detail.activity.ten_hd}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {detail.activity.dia_diem || '—'} • {detail.activity.ngay_bd ? new Date(detail.activity.ngay_bd).toLocaleString('vi-VN') : ''}
                    </div>
                    <div className="text-xs text-green-700 mt-1">+{Number(detail.activity.diem_rl || 0)} điểm</div>
                  </div>
                )}
              </div>
        </div>
      )}
    </div>
  );
};
