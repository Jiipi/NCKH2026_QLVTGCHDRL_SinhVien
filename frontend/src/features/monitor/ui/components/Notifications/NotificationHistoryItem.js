import React from 'react';
import { Calendar, Users, Activity, CheckCircle } from 'lucide-react';

/**
 * NotificationHistoryItem Component - Item trong lịch sử gửi thông báo
 */
export default function NotificationHistoryItem({ notification, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        {/* Icon badge */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
          notification.scope === 'class'
            ? 'bg-indigo-100 text-indigo-600'
            : 'bg-green-100 text-green-600'
        }`}>
          {notification.scope === 'class' ? (
            <Users className="h-5 w-5" />
          ) : (
            <Activity className="h-5 w-5" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-base mb-2 group-hover:text-indigo-600 transition-colors">
            {notification.title}
          </p>
          <div className="flex items-center flex-wrap gap-3">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(notification.date).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Users className="h-4 w-4" />
              {notification.recipients} người nhận
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${
              notification.scope === 'class'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {notification.scope === 'class' ? 'Toàn lớp' : 'Hoạt động'}
            </span>
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-md text-xs font-medium border border-green-200">
          <CheckCircle className="h-3.5 w-3.5" />
          Đã gửi
        </div>
      </div>
    </div>
  );
}

