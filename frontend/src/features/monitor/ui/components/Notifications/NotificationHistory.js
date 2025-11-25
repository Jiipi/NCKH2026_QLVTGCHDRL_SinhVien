import React from 'react';
import { Clock } from 'lucide-react';
import NotificationHistoryItem from './NotificationHistoryItem';

/**
 * NotificationHistory Component - Lịch sử gửi thông báo
 */
export default function NotificationHistory({ 
  sentHistory, 
  onNotificationClick 
}) {
  if (!sentHistory || sentHistory.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-5 w-5 text-indigo-600" />
        <h3 className="text-xl font-semibold text-gray-900">Lịch sử gửi</h3>
      </div>
      <div className="space-y-3">
        {sentHistory.map((item) => (
          <NotificationHistoryItem
            key={item.id}
            notification={item}
            onClick={() => onNotificationClick(item)}
          />
        ))}
      </div>
    </div>
  );
}

