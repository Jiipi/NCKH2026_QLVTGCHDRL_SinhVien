import React from 'react';
import { Users, CheckCircle, AlertCircle } from 'lucide-react';

export default function DashboardRegistrationCard({ registration, onApprove, onReject }) {
  if (!registration) return null;

  const student = registration.sinh_vien || {};
  const activity = registration.hoat_dong || {};

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200" data-ref="dashboard-registration-card">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{activity.ten_hd || 'Hoạt động không xác định'}</h4>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{student.ho_ten || 'N/A'}</span>
            <span className="text-gray-400">•</span>
            <span className="font-mono text-xs">{student.mssv}</span>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-yellow-100 text-yellow-800 border-yellow-200">
          Chờ duyệt
        </span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onApprove?.(registration)}
          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
        >
          <CheckCircle className="w-4 h-4" />
          Phê duyệt
        </button>
        <button
          onClick={() => onReject?.(registration)}
          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
        >
          <AlertCircle className="w-4 h-4" />
          Từ chối
        </button>
      </div>
    </div>
  );
}


