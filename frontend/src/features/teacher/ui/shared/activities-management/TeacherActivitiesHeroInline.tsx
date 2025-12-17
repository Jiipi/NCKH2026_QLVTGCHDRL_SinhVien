import React from 'react';
import { Activity, Tag, Plus } from 'lucide-react';

export default function TeacherActivitiesHeroInline({
  activeTab,
  onTabChange,
  stats,
  activityTypesCount
}) {
  return (
    <div className="relative min-h-[280px]">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute top-10 right-20 w-20 h-20 border-4 border-white/30 rotate-45 animate-bounce"></div>
      <div className="absolute bottom-10 left-16 w-16 h-16 bg-yellow-400/20 rounded-full animate-pulse"></div>
      <div className="absolute top-1/2 left-1/3 w-12 h-12 border-4 border-pink-300/40 rounded-full"></div>

      {/* Main Content Container with Glassmorphism */}
      <div className="relative z-10 p-8">
        <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-2xl p-8 shadow-2xl">
          
          {/* Top Bar with Badge */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-400 blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-black text-indigo-400 px-4 py-2 font-black text-sm tracking-wider transform -rotate-2 shadow-lg border-2 border-indigo-400">
                  ⚡ QUẢN LÝ
                </div>
              </div>
              <div className="h-8 w-1 bg-white/40"></div>
              <div className="text-white/90 font-bold text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                  {activeTab === 'activities' ? `${stats?.total || 0} HOẠT ĐỘNG` : `${activityTypesCount || 0} LOẠI`}
                </div>
              </div>
            </div>
            {activeTab === 'types' && (
              <button
                onClick={() => {
                  // Trigger modal in ActivityTypesManagementPage
                  const event = new CustomEvent('openActivityTypeModal');
                  window.dispatchEvent(event);
                }}
                className="group flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-300 shadow-xl hover:shadow-white/50 hover:scale-105 font-bold"
              >
                <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                Thêm mới
              </button>
            )}
          </div>

          {/* Main Title Section */}
          <div className="mb-6">
            <h1 className="text-5xl lg:text-6xl font-black text-white mb-4 leading-none tracking-tight">
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">D</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">A</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">N</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">H</span>
              <span className="inline-block mx-2">•</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">M</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ụ</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">C</span>
              <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10 text-pink-300 drop-shadow-[0_0_30px_rgba(249,168,212,0.5)]">
                  HOẠT ĐỘNG
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-4 bg-pink-300/30 blur-sm"></div>
              </span>
            </h1>
            
            <p className="text-white/80 text-lg font-medium max-w-2xl leading-relaxed">
              Xem và quản lý tất cả các hoạt động rèn luyện
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => onTabChange('activities')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform ${
                activeTab === 'activities'
                  ? 'bg-pink-400 text-black scale-105 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
              }`}
            >
              <Activity className="h-5 w-5" />
              Danh sách hoạt động
            </button>
            <button
              onClick={() => onTabChange('types')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform ${
                activeTab === 'types'
                  ? 'bg-purple-400 text-black scale-105 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
              }`}
            >
              <Tag className="h-5 w-5" />
              Loại hoạt động
            </button>
          </div>

          {/* Stats Bar with Brutalist Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1 - Activities Stats */}
            <div className="group relative">
              <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
              <div className="relative border-4 border-black bg-white p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1 hover:bg-pink-100">
                <Activity className="h-6 w-6 text-black mb-2" />
                <p className="text-3xl font-black text-black">{stats?.total || 0}</p>
                <p className="text-xs font-black text-black/70 uppercase tracking-wider">TỔNG HOẠT ĐỘNG</p>
              </div>
            </div>

            {/* Card 2 - Types Stats */}
            <div className="group relative">
              <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
              <div className="relative border-4 border-black bg-white p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1 hover:bg-purple-100">
                <Tag className="h-6 w-6 text-black mb-2" />
                <p className="text-3xl font-black text-black">{activityTypesCount || 0}</p>
                <p className="text-xs font-black text-black/70 uppercase tracking-wider">LOẠI HOẠT ĐỘNG</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0) rotate(45deg); }
          50% { transform: translateY(-20px) rotate(45deg); }
        }
        .animate-bounce {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

