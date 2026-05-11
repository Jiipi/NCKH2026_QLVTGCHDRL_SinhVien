import React from 'react';
import { BookOpen, Heart, Shield, Award, Star } from 'lucide-react';

function formatStatus(status) {
  const normalized = (status || '').toLowerCase();
  if (['da_tham_gia', 'da_dien_ra', 'participated', 'attended'].includes(normalized)) return 'Đã tham gia';
  if (['da_duyet', 'approved'].includes(normalized)) return 'Đã duyệt';
  if (['cho_duyet', 'pending'].includes(normalized)) return 'Chờ duyệt';
  return 'Đã tham gia';
}

function getTypeConfig(type: string) {
  const t = (type || '').toLowerCase();
  if (t.includes('học') || t.includes('hoc')) return {
    icon: BookOpen,
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    badgeBg: 'bg-blue-100 dark:bg-blue-900/40',
    badgeText: 'text-blue-700 dark:text-blue-300'
  };
  if (t.includes('tình nguyện') || t.includes('tinh nguyen') || t.includes('từ thiện')) return {
    icon: Heart,
    bg: 'bg-rose-50 dark:bg-rose-900/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
    badgeBg: 'bg-rose-100 dark:bg-rose-900/40',
    badgeText: 'text-rose-700 dark:text-rose-300'
  };
  if (t.includes('kỹ năng') || t.includes('ky nang')) return {
    icon: Star,
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/40',
    badgeText: 'text-amber-700 dark:text-amber-300'
  };
  if (t.includes('nội quy') || t.includes('noi quy') || t.includes('công dân')) return {
    icon: Shield,
    bg: 'bg-purple-50 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    badgeBg: 'bg-purple-100 dark:bg-purple-900/40',
    badgeText: 'text-purple-700 dark:text-purple-300'
  };
  return {
    icon: Award,
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    badgeText: 'text-emerald-700 dark:text-emerald-300'
  };
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'Đã tham gia': return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300';
    case 'Đã duyệt': return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300';
    case 'Chờ duyệt': return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300';
    default: return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
  }
}

export default function ScoreCard({ activity }) {
  const date = activity.ngay_bd ? new Date(activity.ngay_bd) : new Date();
  const formattedDate = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const activityType = activity.loai || activity.loai_hd?.ten_loai_hd || activity.ten_loai || activity.category || 'Hoạt động';
  const activityName = activity.ten_hd || activity.name || 'Hoạt động';
  const points = activity.diem || activity.diem_rl || activity.points || 0;
  const statusText = formatStatus(activity.trang_thai || activity.trang_thai_dk || activity.status);
  const typeConfig = getTypeConfig(activityType);
  const Icon = typeConfig.icon;

  return (
    <div className="group bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className={`w-11 h-11 ${typeConfig.bg} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
            <Icon className={`h-5 w-5 ${typeConfig.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1 truncate">{activityName}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeConfig.badgeBg} ${typeConfig.badgeText}`}>
                {activityType}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">{formattedDate}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(statusText)}`}>
                {statusText}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-bold">
            +{points}
          </span>
        </div>
      </div>
    </div>
  );
}
