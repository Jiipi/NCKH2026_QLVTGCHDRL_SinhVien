import React from 'react';
import { Clock, CheckCircle, Trophy, Award } from 'lucide-react';

/**
 * MyActivitiesHeader Component - Header với neo-brutalism design
 */
export default function MyActivitiesHeader({ totalActivities, myRegistrations, totalPoints }) {
  return (
    <div className="relative min-h-[280px]">
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-purple-600 to-blue-600"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }}></div>
      </div>
      <div className="absolute top-10 right-20 w-20 h-20 border-4 border-white/30 rotate-45 animate-bounce-slow"></div>
      <div className="absolute bottom-10 left-16 w-16 h-16 bg-yellow-400/20 rounded-full animate-pulse"></div>
      <div className="absolute top-1/2 left-1/3 w-12 h-12 border-4 border-pink-300/40 rounded-full animate-spin-slow"></div>
      <div className="relative z-10 p-8">
        <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-black text-yellow-400 px-4 py-2 font-black text-sm tracking-wider transform -rotate-2 shadow-lg border-2 border-yellow-400">
                  ⭐ CỦA TÔI
                </div>
              </div>
              <div className="h-8 w-1 bg-white/40"></div>
              <div className="text-white/90 font-bold text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  {totalActivities} HOẠT ĐỘNG
                </div>
              </div>
            </div>
          </div>
          <div className="mb-8">
            <h1 className="text-6xl lg:text-7xl font-black text-white mb-4 leading-none tracking-tight">
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">H</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">O</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ạ</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">T</span>
              <span className="inline-block mx-2">•</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Đ</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ộ</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">N</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">G</span>
              <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10 text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]">
                  CỦA TÔI
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-4 bg-yellow-400/30 blur-sm"></div>
              </span>
            </h1>
            <p className="text-white/80 text-xl font-medium max-w-2xl leading-relaxed">
              Theo dõi, quản lý và chinh phục các hoạt động rèn luyện bạn đã đăng ký
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="group relative">
              <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
              <div className="relative bg-yellow-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                <Clock className="h-6 w-6 text-black mb-2" />
                <p className="text-3xl font-black text-black">{myRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length}</p>
                <p className="text-xs font-black text-black/70 uppercase tracking-wider">CHỜ DUYỆT</p>
              </div>
            </div>
            <div className="group relative">
              <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
              <div className="relative bg-green-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                <CheckCircle className="h-6 w-6 text-black mb-2" />
                <p className="text-3xl font-black text-black">{myRegistrations.filter(r => r.trang_thai_dk === 'da_duyet').length}</p>
                <p className="text-xs font-black text-black/70 uppercase tracking-wider">ĐÃ DUYỆT</p>
              </div>
            </div>
            <div className="group relative">
              <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
              <div className="relative bg-blue-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                <Trophy className="h-6 w-6 text-black mb-2" />
                <p className="text-3xl font-black text-black">{myRegistrations.filter(r => r.trang_thai_dk === 'da_tham_gia').length}</p>
                <p className="text-xs font-black text-black/70 uppercase tracking-wider">HOÀN THÀNH</p>
              </div>
            </div>
            <div className="group relative">
              <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
              <div className="relative bg-purple-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                <Award className="h-6 w-6 text-black mb-2" />
                <p className="text-3xl font-black text-black">{totalPoints.toFixed(1)}</p>
                <p className="text-xs font-black text-black/70 uppercase tracking-wider">TỔNG ĐIỂM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes grid-move { 0% { transform: translateY(0); } 100% { transform: translateY(50px); } }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0) rotate(45deg); } 50% { transform: translateY(-20px) rotate(45deg); } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}} />
    </div>
  );
}

