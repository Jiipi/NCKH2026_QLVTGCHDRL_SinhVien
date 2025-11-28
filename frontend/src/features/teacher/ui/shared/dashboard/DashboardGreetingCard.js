import React from 'react';
import { Zap } from 'lucide-react';
import { getUserAvatar, getAvatarGradient } from '../../../../../shared/lib/avatar';

export default function DashboardGreetingCard({
  teacherName,
  teacherInitials,
  teacherProfile,
  classes = [],
  selectedClassId,
  onClassChange
}) {
  const avatar = teacherProfile ? getUserAvatar(teacherProfile) : null;
  const displayInitials = teacherInitials || 'GV';
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6" data-ref="dashboard-greeting-card">
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <svg className="absolute inset-0 w-20 h-20 -rotate-90 -translate-x-2 -translate-y-2" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="none" stroke="#e5e7eb" strokeWidth="4" />
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="url(#teacherGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 36}`}
              strokeDashoffset="0"
            />
            <defs>
              <linearGradient id="teacherGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getAvatarGradient(teacherName || 'Giảng viên')} border-4 border-white flex items-center justify-center shadow-lg overflow-hidden`}>
            {avatar?.hasValidAvatar ? (
              <img
                src={avatar.src}
                alt={avatar.alt}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const next = e.target.nextSibling;
                  if (next) next.style.display = 'flex';
                }}
              />
            ) : null}
            <span className={`text-2xl font-black text-white ${avatar?.hasValidAvatar ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
              {displayInitials}
            </span>
          </div>
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm" />
        </div>

        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2 mb-1">
            Xin chào, {teacherName || 'Giảng viên'}!
            <Zap className="h-5 w-5 text-yellow-400 animate-pulse" />
          </h1>
          <p className="text-gray-600 text-sm mb-2">Chào mừng bạn quay trở lại với hệ thống điểm rèn luyện</p>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-4 py-1.5 rounded-full text-sm font-black border-2 bg-blue-50 text-blue-700 border-blue-300">
              Giảng viên
            </span>
            {classes.length > 0 && (
              <select
                value={selectedClassId || ''}
                onChange={(e) => onClassChange?.(e.target.value || null)}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-700 border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {classes.map((clazz) => (
                  <option key={clazz.id} value={clazz.id}>
                    {clazz.ten_lop || clazz.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


