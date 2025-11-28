import React from 'react';
import { Sparkles, Filter } from 'lucide-react';
import { SemesterClosureWidget } from '../../../../../shared/components/semester';
import { SemesterFilter } from '../../../../../shared/components/common';

export default function MonitorHeroSection({
  userProfile,
  monitorName,
  classification,
  monitorPoints,
  summary,
  totalStudents,
  progressPercent,
  totalPointsProgress,
  semester,
  onSemesterChange,
  loading
}) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <svg className="absolute inset-0 w-20 h-20 -rotate-90 transform -translate-x-2 -translate-y-2" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" fill="none" stroke="#e5e7eb" strokeWidth="4" />
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="url(#monitorGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 36}`}
                strokeDashoffset={`${2 * Math.PI * 36 * (1 - progressPercent / 100)}`}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="monitorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>

            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 border-4 border-white flex items-center justify-center shadow-lg overflow-hidden">
              {userProfile?.anh_dai_dien || userProfile?.avatar ? (
                <img
                  src={userProfile?.anh_dai_dien || userProfile?.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <span
                className={`text-2xl font-black text-white ${(userProfile?.anh_dai_dien || userProfile?.avatar) ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}
              >
                {(monitorName || 'LT').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>

            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full z-10 shadow-sm"></div>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2 mb-1">
              Xin chào, {monitorName}!
              <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
            </h1>
            <p className="text-gray-600 text-sm mb-2">Chào mừng bạn quay trở lại với hệ thống điểm rèn luyện</p>

            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-4 py-1.5 rounded-full text-sm font-black border-2 ${classification.bg} ${classification.color} ${classification.border}`}>
                {classification.text} • {monitorPoints} điểm
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-700 border border-purple-300">
                {summary?.className || 'N/A'}
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 border border-blue-300">
                {totalStudents} sinh viên
              </span>
            </div>
          </div>
        </div>
      </div>

      {!loading && (
        <div className="group relative">
          <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-3xl"></div>
          <div className="relative bg-gradient-to-br from-cyan-400 to-blue-500 border-4 border-black p-4 rounded-3xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-5 w-5 text-black font-bold" />
              <h3 className="text-base font-black text-black uppercase tracking-wider">BỘ LỌC HỌC KỲ</h3>
            </div>

            <div className="bg-white rounded-xl p-3 border-2 border-black shadow-lg mb-3">
              <SemesterFilter value={semester} onChange={onSemesterChange} label="" />
            </div>

            <div className="bg-white/90 rounded-xl p-3 border-2 border-black">
              <SemesterClosureWidget
                compact
                enableSoftLock={false}
                enableHardLock={false}
                allowProposeWithoutClass={true}
                className="!p-0 !bg-transparent !border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

