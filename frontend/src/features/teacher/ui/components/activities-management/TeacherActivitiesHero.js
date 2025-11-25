import React from 'react';
import { Activity, Tag, Plus, Sparkles, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function TeacherActivitiesHero({
  activeTab,
  onTabChange,
  stats
}) {
  const safeStats = {
    total: stats?.total || 0,
    pending: stats?.pending || 0,
    approved: stats?.approved || 0,
    rejected: stats?.rejected || 0,
    types: stats?.types || 0
  };

  return (
    <div className="relative min-h-[260px] mb-6" data-ref="teacher-activities-hero">
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 2px, transparent 2px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 2px, transparent 2px)`,
            backgroundSize: '50px 50px'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      <div className="absolute top-10 right-16 w-20 h-20 border-4 border-white/30 rotate-45 animate-bounce-slow" />
      <div className="absolute bottom-10 left-16 w-16 h-16 bg-yellow-400/20 rounded-full animate-pulse" />
      <div className="absolute top-1/2 left-1/3 w-12 h-12 border-4 border-pink-300/40 rounded-full" />

      <div className="relative z-10 p-6 sm:p-8">
        <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-400 blur-xl opacity-50 animate-pulse" />
                <div className="relative bg-black text-indigo-300 px-4 py-2 font-black text-xs sm:text-sm tracking-wider transform -rotate-2 border-2 border-indigo-300 shadow-lg flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  QUẢN LÝ HOẠT ĐỘNG
                </div>
              </div>
              <div className="h-8 w-1 bg-white/40" />
              <span className="text-white/90 font-bold text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse" />
                {safeStats.total} HOẠT ĐỘNG
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onTabChange?.('activities')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all duration-300 ${
                  activeTab === 'activities'
                    ? 'bg-pink-400 text-black shadow-lg'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                <Activity className="h-4 w-4" />
                Hoạt động
              </button>
              <button
                onClick={() => onTabChange?.('types')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all duration-300 ${
                  activeTab === 'types'
                    ? 'bg-purple-400 text-black shadow-lg'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                <Tag className="h-4 w-4" />
                Loại hoạt động ({safeStats.types})
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-3 leading-tight tracking-tight">
              Điều phối hoạt động <br className="hidden sm:block" />
              <span className="inline-flex items-center gap-2 text-pink-200">
                rèn luyện
                <Plus className="h-6 w-6 text-pink-200" />
              </span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg font-medium max-w-3xl leading-relaxed">
              Theo dõi, phê duyệt và tối ưu tất cả hoạt động của lớp với hệ thống báo cáo trực quan.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Activity}
              label="Tổng hoạt động"
              value={safeStats.total}
              className="bg-cyan-400"
            />
            <StatCard
              icon={Clock}
              label="Chờ duyệt"
              value={safeStats.pending}
              className="bg-yellow-400"
            />
            <StatCard
              icon={CheckCircle}
              label="Đã duyệt"
              value={safeStats.approved}
              className="bg-green-400"
            />
            <StatCard
              icon={XCircle}
              label="Từ chối"
              value={safeStats.rejected}
              className="bg-red-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, className }) {
  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl" />
      <div className={`relative ${className} border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1`}>
        <Icon className="h-5 w-5 text-black mb-2" />
        <p className="text-3xl font-black text-black">{value}</p>
        <p className="text-xs font-black text-black/70 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}


