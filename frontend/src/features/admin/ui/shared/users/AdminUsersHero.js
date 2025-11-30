import React from 'react';
import { Shield, UserPlus, Users, Activity, Lock, LayoutGrid } from 'lucide-react';

export default function AdminUsersHero({
  totalAccounts = 0,
  liveSessions = 0,
  lockedAccounts = 0,
  roleCounts = { admin: 0, teacher: 0, classMonitor: 0, student: 0 },
  onCreateClick
}) {
  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          animation: 'admin-users-grid 20s linear infinite'
        }}
      />
      <div
        className="absolute top-8 right-16 w-24 h-24 border-4 border-white/20 rounded-2xl rotate-12"
        style={{ animation: 'admin-users-float 4s ease-in-out infinite' }}
      />
      <div
        className="absolute bottom-8 left-12 w-16 h-16 bg-yellow-400/30 rounded-full"
        style={{ animation: 'admin-users-float 3s ease-in-out infinite 0.5s' }}
      />
      <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-cyan-400/40 rotate-45" />

      <div className="relative z-10 p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 rounded-lg" />
              <div className="relative bg-white border-2 border-black px-4 py-2 rounded-lg flex items-center gap-2 transform transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
                <Shield className="w-5 h-5 text-violet-600" />
                <span className="font-black text-sm text-gray-900 tracking-wide">NEO ADMIN</span>
              </div>
            </div>
            <div className="hidden sm:block h-6 w-px bg-white/30" />
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full border border-white/20">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-sm font-semibold">{totalAccounts} tài khoản</span>
            </div>
          </div>

          <button onClick={onCreateClick} className="group relative inline-flex items-center">
            <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 rounded-xl transition-transform group-hover:translate-x-1.5 group-hover:translate-y-1.5" />
            <div className="relative flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-black rounded-xl font-bold text-gray-900 transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
              <UserPlus className="w-5 h-5" />
              <span>Thêm tài khoản</span>
            </div>
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-3">
            Quản lý tài khoản
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-pink-200 to-cyan-200">
              TẬP TRUNG
            </span>
          </h1>
          <p className="text-white/80 text-base sm:text-lg font-medium max-w-2xl leading-relaxed">
            Theo dõi hoạt động đăng nhập, trạng thái khóa/kích hoạt và phân bổ vai trò cho toàn bộ hệ thống.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <HeroCard
            icon={<Users className="w-5 h-5 text-amber-700" />}
            value={totalAccounts}
            label="Tổng tài khoản"
            gradient="from-amber-100 to-yellow-50"
          />
          <HeroCard
            icon={<Activity className="w-5 h-5 text-emerald-700" />}
            value={liveSessions}
            label="Phiên hoạt động"
            gradient="from-emerald-100 to-green-50"
          />
          <HeroCard
            icon={<Lock className="w-5 h-5 text-rose-700" />}
            value={lockedAccounts}
            label="Bị khóa"
            gradient="from-rose-100 to-pink-50"
          />
          <HeroCard
            icon={<LayoutGrid className="w-5 h-5 text-sky-700" />}
            value={`${roleCounts.admin}/${roleCounts.teacher}/${roleCounts.classMonitor}/${roleCounts.student}`}
            label="Admin • GV • LT • SV"
            gradient="from-sky-100 to-cyan-50"
            isCompact
          />
        </div>
      </div>

      <style>{`
        @keyframes admin-users-grid {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        @keyframes admin-users-float {
          0%, 100% { transform: translateY(0px) rotate(12deg); }
          50% { transform: translateY(-10px) rotate(12deg); }
        }
        .admin-users-card {
          border-width: 3px;
        }
      `}</style>
    </div>
  );
}

function HeroCard({ icon, value, label, gradient, isCompact }) {
  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-black translate-x-1.5 translate-y-1.5 rounded-2xl transition-transform group-hover:translate-x-2 group-hover:translate-y-2" />
      <div
        className={`relative bg-gradient-to-br ${gradient} admin-users-card border-black p-4 rounded-2xl transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5`}
      >
        <div className="flex items-center gap-2 mb-2">{icon}</div>
        <p className={`font-black text-gray-900 ${isCompact ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl'}`}>
          {value}
        </p>
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}









