import React from 'react';
import { Trophy } from 'lucide-react';

function formatStatus(status) {
  const normalized = (status || '').toLowerCase();
  if (['da_tham_gia', 'da_dien_ra', 'participated', 'attended'].includes(normalized)) return 'Đã tham gia';
  if (['da_duyet', 'approved'].includes(normalized)) return 'Đã duyệt';
  if (['cho_duyet', 'pending'].includes(normalized)) return 'Chờ duyệt';
  return 'Đã tham gia';
}

export default function ScoreCard({ activity }) {
  const date = activity.ngay_bd ? new Date(activity.ngay_bd) : new Date();
  const formattedDate = date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'numeric', year: 'numeric' });
  const activityType = activity.loai || activity.loai_hd?.ten_loai_hd || activity.ten_loai || activity.category || 'Hoạt động';
  const activityName = activity.ten_hd || activity.name || 'Hoạt động';
  const points = activity.diem || activity.diem_rl || activity.points || 0;
  const statusText = formatStatus(activity.trang_thai || activity.trang_thai_dk || activity.status);

  return (
    <div className="bg-green-50 border border-green-100 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Trophy className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">{activityName}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="truncate">{activityType}</span>
              <span className="text-gray-400">•</span>
              <span className="flex-shrink-0">{formattedDate}</span>
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold text-gray-900 mb-1">+{points} điểm</div>
          <div className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            {statusText}
          </div>
        </div>
      </div>
    </div>
  );
}

