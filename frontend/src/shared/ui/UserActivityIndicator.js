/**
 * UserActivityIndicator Component
 * Display user online/offline status with session tracking
 */

import React from 'react';
import { Circle } from 'lucide-react';

export function UserActivityIndicator({ 
  isActive, 
  size = 'sm', 
  showLabel = false,
  className = '' 
}) {
  const sizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const dotSize = sizeClasses[size] || sizeClasses.sm;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="relative inline-flex">
        <Circle 
          className={`${dotSize} ${isActive ? 'text-green-500 fill-green-500' : 'text-gray-400 fill-gray-400'}`}
        />
        {isActive && (
          <span className={`absolute inline-flex ${dotSize} rounded-full bg-green-400 opacity-75 animate-ping`}></span>
        )}
      </span>
      {showLabel && (
        <span className={`text-xs font-medium ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
          {isActive ? 'Đang hoạt động' : 'Không hoạt động'}
        </span>
      )}
    </div>
  );
}

export function UserStatusBadge({ isActive, size = 'default', className = '' }) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    default: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  const badgeSize = sizeClasses[size] || sizeClasses.default;

  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 rounded-full font-semibold
        ${badgeSize}
        ${isActive 
          ? 'bg-green-100 text-green-700 border border-green-200' 
          : 'bg-gray-100 text-gray-600 border border-gray-200'
        }
        ${className}
      `}
    >
      <Circle 
        className={`w-2 h-2 ${isActive ? 'text-green-500 fill-green-500' : 'text-gray-400 fill-gray-400'}`}
      />
      {isActive ? 'Đang hoạt động' : 'Không hoạt động'}
    </span>
  );
}

export function LastSeenIndicator({ lastActivity, className = '' }) {
  if (!lastActivity) {
    return <span className={`text-xs text-gray-500 ${className}`}>Chưa có hoạt động</span>;
  }

  const now = new Date();
  const last = new Date(lastActivity);
  const diffMs = now - last;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  let timeText = '';
  if (diffMins < 1) {
    timeText = 'Vừa xong';
  } else if (diffMins < 60) {
    timeText = `${diffMins} phút trước`;
  } else if (diffHours < 24) {
    timeText = `${diffHours} giờ trước`;
  } else {
    timeText = `${diffDays} ngày trước`;
  }

  return (
    <span className={`text-xs text-gray-500 ${className}`}>
      {timeText}
    </span>
  );
}

export default UserActivityIndicator;
