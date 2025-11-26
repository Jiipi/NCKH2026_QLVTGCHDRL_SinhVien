import React from 'react';
import { Clock, CheckCircle, XCircle, UserCheck } from 'lucide-react';

export default function RegistrationApprovalsHeroInline({ stats }) {
  return (
    <div className="relative min-h-[280px]">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }}></div>
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute top-10 right-20 w-20 h-20 border-4 border-white/30 rotate-45 animate-bounce-slow"></div>
      <div className="absolute bottom-10 left-16 w-16 h-16 bg-yellow-400/20 rounded-full animate-pulse"></div>
      <div className="absolute top-1/2 left-1/3 w-12 h-12 border-4 border-pink-300/40 rounded-full animate-spin-slow"></div>

      {/* Main Content Container with Glassmorphism */}
      <div className="relative z-10 p-8">
        <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-2xl p-8 shadow-2xl">
          
          {/* Top Bar with Badge */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-400 blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-black text-indigo-400 px-4 py-2 font-black text-sm tracking-wider transform -rotate-2 shadow-lg border-2 border-indigo-400">
                  ✓ PHÊ DUYỆT
                </div>
              </div>
              <div className="h-8 w-1 bg-white/40"></div>
              <div className="text-white/90 font-bold text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                  {stats.total} ĐĂNG KÝ
                </div>
              </div>
            </div>
          </div>

          {/* Main Title Section */}
          <div className="mb-8">
            <h1 className="text-6xl lg:text-7xl font-black text-white mb-4 leading-none tracking-tight">
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">P</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">H</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ê</span>
              <span className="inline-block mx-2">•</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">D</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">U</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Y</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ệ</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">T</span>
              <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10 text-indigo-300 drop-shadow-[0_0_30px_rgba(165,180,252,0.5)]">
                  ĐĂNG KÝ
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-4 bg-indigo-300/30 blur-sm"></div>
              </span>
            </h1>
            
            <p className="text-white/80 text-xl font-medium max-w-2xl leading-relaxed">
              Quản lý và phê duyệt đăng ký tham gia hoạt động của sinh viên
            </p>
          </div>

          {/* Stats Bar with Brutalist Cards - 4 cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Card 1 - Pending */}
            <div className="group relative">
              <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
              <div className="relative bg-yellow-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                <Clock className="h-6 w-6 text-black mb-2" />
                <p className="text-3xl font-black text-black">{stats.pending}</p>
                <p className="text-xs font-black text-black/70 uppercase tracking-wider">CHỜ DUYỆT</p>
              </div>
            </div>

            {/* Card 2 - Approved */}
            <div className="group relative">
              <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
              <div className="relative bg-emerald-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                <CheckCircle className="h-6 w-6 text-black mb-2" />
                <p className="text-3xl font-black text-black">{stats.approved}</p>
                <p className="text-xs font-black text-black/70 uppercase tracking-wider">ĐÃ DUYỆT</p>
              </div>
            </div>

            {/* Card 3 - Joined (ĐÃ THAM GIA) */}
            <div className="group relative">
              <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
              <div className="relative bg-cyan-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                <UserCheck className="h-6 w-6 text-black mb-2" />
                <p className="text-3xl font-black text-black">{stats.joined || 0}</p>
                <p className="text-xs font-black text-black/70 uppercase tracking-wider">ĐÃ THAM GIA</p>
              </div>
            </div>

            {/* Card 4 - Rejected */}
            <div className="group relative">
              <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
              <div className="relative bg-rose-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                <XCircle className="h-6 w-6 text-black mb-2" />
                <p className="text-3xl font-black text-black">{stats.rejected}</p>
                <p className="text-xs font-black text-black/70 uppercase tracking-wider">TỪ CHỐI</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes grid-move {
          0% { background-position: 0 0; }
          100% { background-position: 50px 50px; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0) rotate(45deg); }
          50% { transform: translateY(-20px) rotate(45deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}

