import React from 'react';
import { GraduationCap } from 'lucide-react';

/**
 * EmptyState - Reusable empty state component
 */
export default function EmptyState({ 
  icon: Icon = GraduationCap,
  title = 'Không có dữ liệu',
  message = 'Chưa có thông tin để hiển thị'
}) {
  return (
    <div className="p-8">
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
        <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-500 mb-2">{title}</h3>
        <p className="text-gray-400">{message}</p>
      </div>
    </div>
  );
}

