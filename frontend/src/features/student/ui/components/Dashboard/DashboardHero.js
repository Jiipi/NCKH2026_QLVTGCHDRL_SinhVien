import React from 'react';
import {
  Sparkles,
  Filter,
  Calendar,
  Clock,
  Trophy,
  Star,
  Target
} from 'lucide-react';
import SemesterFilter from '../../../../../widgets/semester/ui/SemesterSwitcher';

export default function DashboardHero({
  summary,
  userProfile,
  studentInfo,
  classification,
  semester,
  onSemesterChange,
  loading,
  formatNumber = (value) => value
}) {
  const safeSummary = summary || {};
  const safeClassification = classification || {};
  const safeStudent = studentInfo || {};
  const safeProfile = userProfile || {};

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="relative">
                <svg
                  className="absolute inset-0 w-20 h-20 -rotate-90 transform -translate-x-2 -translate-y-2"
                  viewBox="0 0 80 80"
                >
                  <circle cx="40" cy="40" r="36" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={String(2 * Math.PI * 36)}
                    strokeDashoffset={String(2 * Math.PI * 36 * (1 - (safeSummary.progress || 0) / 100))}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="50%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 border-4 border-white flex items-center justify-center shadow-lg overflow-hidden">
                  {(safeProfile.anh_dai_dien || safeProfile.avatar) ? (
                    <img
                      src={safeProfile.anh_dai_dien || safeProfile.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const next = e.target.nextSibling;
                        if (next) next.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span
                    className={`text-2xl font-black text-white ${(safeProfile.anh_dai_dien || safeProfile.avatar) ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}
                  >
                    {(safeProfile.ho_ten || safeProfile.name || 'DV')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                </div>
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full z-10 shadow-sm"></div>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2 mb-1">
                  Xin chào, {(safeProfile.ho_ten || safeProfile.name || 'Sinh viên')}!
                  <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
                </h1>
                <p className="text-gray-600 text-sm mb-2">Chào mừng bạn quay trở lại với hệ thống điểm rèn luyện</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`px-4 py-1.5 rounded-full text-sm font-black border-2 ${safeClassification.bg || ''} ${safeClassification.color || ''} ${safeClassification.border || ''}`}
                  >
                    {safeClassification.text || 'Đang cập nhật'}
                  </span>
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 border border-blue-300">
                    {safeStudent.mssv || safeProfile.mssv || safeProfile.ma_sv || 'N/A'}
                  </span>
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-700 border border-purple-300">
                    {safeStudent.ten_lop || safeProfile.lop || safeProfile.ten_lop || 'N/A'}
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
                <div className="bg-white rounded-xl p-3 border-2 border-black shadow-lg">
                  <label className="block text-xs font-black text-gray-700 mb-1.5">Học kỳ</label>
                  <SemesterFilter value={semester ?? ''} onChange={onSemesterChange} />
                </div>
              </div>
            </div>
          )}
        </div>

        {!loading && (
          <div className="space-y-4">
            <div className="group relative">
              <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
              <div className="relative bg-gradient-to-br from-pink-400 via-purple-500 to-purple-600 border-4 border-black p-3 rounded-xl transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
                <p className="text-white/90 font-black text-[10px] uppercase tracking-wider mb-1">TỔNG ĐIỂM RÈN LUYỆN</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-4xl font-black text-white">{formatNumber(safeSummary.totalPoints ?? 0)}</p>
                  <p className="text-sm font-bold text-white/70">/100</p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(safeSummary.progress || 0, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-white font-black text-lg ml-2">
                    <span className="text-[10px] font-bold text-white/80">TIẾN ĐỘ </span>
                    {formatNumber(safeSummary.progress ?? 0)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                icon={Calendar}
                label="THAM GIA"
                value={formatNumber(safeSummary.activitiesJoined ?? 0)}
                subValue="HOẠT ĐỘNG"
                bg="bg-yellow-400"
              />
              <MetricCard
                icon={Clock}
                label="SẮP TỚI"
                value={formatNumber(safeSummary.activitiesUpcoming ?? 0)}
                subValue="HOẠT ĐỘNG"
                bg="bg-pink-400"
              />
              <MetricCard
                icon={Trophy}
                label="HẠNG LỚP"
                value={`${formatNumber(safeSummary.classRank ?? '-')} / ${formatNumber(safeSummary.totalStudents ?? '-')}`}
                subValue="HẠNG LỚP"
                bg="bg-blue-400"
                contentColor="text-white"
              />
              <MetricCard
                icon={Target}
                label={safeSummary.goalPoints > 0 ? 'MỤC TIÊU' : 'KẾT QUẢ'}
                value={safeSummary.goalPoints > 0 ? formatNumber(safeSummary.goalPoints) : '🎉'}
                subValue={safeSummary.goalPoints > 0 ? safeSummary.goalText : 'ĐÃ ĐẠT XUẤT SẮC'}
                bg="bg-green-400"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, subValue, bg, contentColor }) {
  const textColor = contentColor || 'text-black';

  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
      <div
        className={`relative ${bg} border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col`}
      >
        <div className="flex items-center justify-between mb-2">
          <Icon className={`w-5 h-5 ${textColor}`} />
          <div className="bg-black text-white px-2 py-0.5 rounded-md font-black text-[9px] uppercase tracking-wider">{label}</div>
        </div>
        <p className={`text-3xl font-black ${textColor} mb-0.5`}>{value}</p>
        {subValue && (
          <p className={`text-[10px] font-black uppercase tracking-wider ${contentColor ? 'text-white/80' : 'text-black/70'}`}>
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
}

