import React from 'react';
import { BarChart3, TrendingUp, FileText, Sparkles } from 'lucide-react';

export default function AdminReportsHeader({ stats = {} }) {
  const safeStats = {
    total: stats?.total || 0,
    pending: stats?.pending || 0,
    approved: stats?.approved || 0,
    rejected: stats?.rejected || 0
  };

  return (
    <div className="relative mb-6 rounded-3xl overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 2px, transparent 2px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 2px, transparent 2px)`,
            backgroundSize: '50px 50px',
            animation: 'grid-move 20s linear infinite'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Geometric decorations */}
      <div className="absolute top-8 right-12 w-20 h-20 border-4 border-white/20 transform rotate-45 animate-bounce-slow" />
      <div className="absolute bottom-10 left-16 w-16 h-16 bg-yellow-400/20 rounded-full blur-sm animate-pulse" />
      <div className="absolute top-1/2 right-1/4 w-12 h-12 border-4 border-purple-300/30 rounded-full animate-spin-slow" />
      <div className="absolute top-20 left-1/3 w-8 h-8 bg-pink-400/30 transform rotate-12" />

      <div className="relative z-10 px-6 sm:px-10 py-8 sm:py-12">
        <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Top badge */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-400 blur-lg opacity-50" />
                <div className="relative bg-black text-purple-300 px-4 py-2 font-black text-xs sm:text-sm tracking-wider transform -rotate-2 border-2 border-purple-300 shadow-lg">
                  📊 BÁO CÁO HỆ THỐNG
                </div>
              </div>
              <div className="h-8 w-1 bg-white/40" />
              <div className="text-white/90 font-bold text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  THỐNG KÊ TỔNG QUAN
                </div>
              </div>
            </div>
          </div>

          {/* Main title */}
          <div className="mb-8">
            <h1 className="text-5xl lg:text-6xl font-black text-white mb-4 leading-none tracking-tight">
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">B</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Á</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">O</span>
              <span className="inline-block mx-2">•</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">C</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Á</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">O</span>
              <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10 text-purple-300 drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                  HỆ THỐNG
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-4 bg-purple-400/30 blur-sm" />
              </span>
            </h1>

            <p className="text-white/80 text-xl font-medium max-w-2xl leading-relaxed">
              Thống kê tổng quan hoạt động và đăng ký trong hệ thống
            </p>
          </div>

          {/* Neo-brutalism Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <NeoStatCard icon={BarChart3} label="TỔNG SỐ" value={safeStats.total} className="bg-cyan-400" />
            <NeoStatCard icon={Sparkles} label="CHỜ DUYỆT" value={safeStats.pending} className="bg-yellow-400" />
            <NeoStatCard icon={TrendingUp} label="ĐÃ DUYỆT" value={safeStats.approved} className="bg-green-400" />
            <NeoStatCard icon={FileText} label="TỪ CHỐI" value={safeStats.rejected} className="bg-red-400" />
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes grid-move {
            0% { transform: translateY(0); }
            100% { transform: translateY(50px); }
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0) rotate(45deg); }
            50% { transform: translateY(-20px) rotate(45deg); }
          }
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
          .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        `}
      </style>
    </div>
  );
}

function NeoStatCard({ icon: Icon, label, value, className }) {
  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl" />
      <div className={`relative ${className} border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1`}>
        <Icon className="h-6 w-6 text-black mb-2" />
        <p className="text-3xl font-black text-black">{value}</p>
        <p className="text-xs font-black text-black/70 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

