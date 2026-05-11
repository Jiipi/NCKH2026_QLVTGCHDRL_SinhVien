import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { getUserAvatar, getAvatarGradient } from '../../../../../shared/lib/avatar';

export default function AdminDashboardHero({ userProfile }) {
  const adminName = userProfile?.ho_ten || userProfile?.name || 'Quản trị viên';
  const avatar = getUserAvatar(userProfile);
  const adminInitials = avatar.fallback || 'QT';
  const [avatarError, setAvatarError] = useState(false);
  const showAvatar = avatar.hasValidAvatar && !avatarError;

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20 sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(129,140,248,0.16),transparent_30%),radial-gradient(circle_at_100%_0%,rgba(245,158,11,0.12),transparent_28%)]" />
      <div className="relative z-10 flex items-center gap-4">
        <div className="relative flex-shrink-0 rounded-[1.75rem] border border-white/70 bg-white/55 p-2 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <div className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${getAvatarGradient(adminName)} shadow-lg`}>
            {showAvatar ? (
              <img
                src={avatar.src!}
                alt={avatar.alt}
                className="h-full w-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-2xl font-black text-white">
                {adminInitials}
              </span>
            )}
          </div>
          <div className="absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-white bg-emerald-500 shadow-sm dark:border-slate-950" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-300">Không gian quản trị</p>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-3xl">
            Xin chào, {adminName}!
            <Shield className="h-6 w-6 text-amber-500 dark:text-amber-300" />
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">Theo dõi vận hành hệ thống, phê duyệt đăng ký và quản lý dữ liệu rèn luyện tập trung.</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-indigo-200/70 bg-indigo-50/70 px-4 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-300">
              Quản trị viên
            </span>
            <span className="rounded-full border border-amber-200/70 bg-amber-50/70 px-4 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
              Toàn quyền hệ thống
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

