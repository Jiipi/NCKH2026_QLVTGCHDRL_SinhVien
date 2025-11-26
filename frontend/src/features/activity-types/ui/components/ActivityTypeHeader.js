import React from 'react';
import { Tag, Plus } from 'lucide-react';

export default function ActivityTypeHeader({ onCreateClick, loading, totalCount = 0 }) {
  return (
    <div className="relative min-h-[280px]">
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            animation: 'grid-move 20s linear infinite'
          }}
        ></div>
      </div>

      <div className="absolute top-10 right-20 w-20 h-20 border-4 border-white/30 rotate-45 animate-bounce-slow"></div>
      <div className="absolute bottom-10 left-16 w-16 h-16 bg-yellow-400/20 rounded-full animate-pulse"></div>
      <div className="absolute top-1/2 left-1/3 w-12 h-12 border-4 border-pink-300/40 rounded-full animate-spin-slow"></div>

      <div className="relative z-10 p-8">
        <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-400 blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-black text-indigo-400 px-4 py-2 font-black text-sm tracking-wider transform -rotate-2 shadow-lg border-2 border-indigo-400">
                  🏷️ LOẠI HOẠT ĐỘNG
                </div>
              </div>
              <div className="h-8 w-1 bg-white/40"></div>
              <div className="text-white/90 font-bold text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-300 rounded-full animate-pulse"></div>
                  {totalCount} loại
                </div>
              </div>
            </div>
            <button
              onClick={onCreateClick}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-300 shadow-xl hover:shadow-white/50 hover:scale-105 font-bold disabled:opacity-50"
            >
              <Plus className="h-5 w-5" />
              Tạo mới
            </button>
          </div>

          <div className="mb-8">
            <h1 className="text-5xl lg:text-6xl font-black text-white mb-4 leading-none tracking-tight">
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Q</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">U</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ả</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">N</span>
              <span className="inline-block mx-2">•</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">L</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ý</span>
              <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10 text-pink-200 drop-shadow-[0_0_30px_rgba(251,207,232,0.5)]">
                  HOẠT ĐỘNG
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-4 bg-pink-400/30 blur-sm"></div>
              </span>
            </h1>

            <p className="text-white/80 text-xl font-medium max-w-2xl leading-relaxed">
              Tạo và quản lý danh mục hoạt động rèn luyện - phân loại, cấu hình điểm số và màu sắc
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes grid-move { 0% { transform: translateY(0); } 100% { transform: translateY(50px); } }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0) rotate(45deg); } 50% { transform: translateY(-20px) rotate(45deg); } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}</style>
    </div>
  );
}
