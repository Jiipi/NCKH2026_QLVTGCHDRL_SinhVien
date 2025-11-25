import React from 'react';
import { UserCheck, UserX, Users, ClipboardList } from 'lucide-react';

export default function RegistrationApprovalsHero({ counts, total, selectedCount }) {
  const safeCounts = {
    cho_duyet: counts?.cho_duyet || 0,
    da_duyet: counts?.da_duyet || 0,
    tu_choi: counts?.tu_choi || 0,
    da_tham_gia: counts?.da_tham_gia || 0
  };

  return (
    <div className="relative mb-6 rounded-3xl overflow-hidden" data-ref="registration-approvals-hero">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600" />
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

      <div className="relative z-10 px-6 sm:px-10 py-8 sm:py-10">
        <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-1">
                Quản lý đăng ký
              </p>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Phê duyệt tham gia hoạt động
              </h1>
            </div>
            <div className="bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 border border-white/20">
              <ClipboardList className="h-4 w-4" />
              Đang chọn: {selectedCount}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              label="Tổng đăng ký"
              value={total || safeCounts.cho_duyet + safeCounts.da_duyet + safeCounts.tu_choi + safeCounts.da_tham_gia}
              className="bg-white/15"
            />
            <StatCard
              icon={UserCheck}
              label="Chờ duyệt"
              value={safeCounts.cho_duyet}
              className="bg-yellow-400"
            />
            <StatCard
              icon={UserCheck}
              label="Đã duyệt"
              value={safeCounts.da_duyet}
              className="bg-green-400"
            />
            <StatCard
              icon={UserX}
              label="Từ chối"
              value={safeCounts.tu_choi}
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
      <div className="absolute inset-0 bg-black/40 transform translate-x-2 translate-y-2 rounded-2xl" />
      <div className={`relative ${className} text-black border border-black/10 rounded-2xl px-4 py-5 flex flex-col gap-1`}>
        <Icon className="h-5 w-5" />
        <span className="text-3xl font-black">{value}</span>
        <span className="text-xs font-semibold uppercase tracking-widest text-black/60">{label}</span>
      </div>
    </div>
  );
}


