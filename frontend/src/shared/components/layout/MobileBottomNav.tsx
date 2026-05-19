import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, BookOpen, Home, QrCode, User } from 'lucide-react';
import { normalizeRole } from '../../lib/role';
import { useAppStore } from '../../store';
import sessionStorageManager from '../../api/sessionStorageManager';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  badgeKey?: 'notifications';
}

interface MobileBottomNavProps {
  unreadCount?: number;
}

export default function MobileBottomNav({ unreadCount = 0 }: MobileBottomNavProps) {
  const location = useLocation();
  const storeRole = useAppStore(s => s.role);
  const session = sessionStorageManager.getSession();
  const sessionUser = session?.user as { vai_tro?: { ten_vt?: string }; role?: string; roleCode?: string } | undefined;
  const role = normalizeRole(
    storeRole || session?.role || sessionUser?.vai_tro?.ten_vt || sessionUser?.role || sessionUser?.roleCode
  );

  const isAdmin = role === 'ADMIN';
  const isTeacher = role === 'GIANG_VIEN';
  const isMonitor = role === 'LOP_TRUONG';

  const items: NavItem[] = (() => {
    if (isAdmin) {
      return [
        { to: '/admin', label: 'Trang chủ', icon: Home },
        { to: '/admin/activities', label: 'Hoạt động', icon: BookOpen },
        { to: '/admin/qr-attendance', label: 'Điểm danh', icon: QrCode },
        { to: '/admin/notifications', label: 'Thông báo', icon: Bell, badgeKey: 'notifications' },
        { to: '/admin/profile', label: 'Hồ sơ', icon: User },
      ];
    }
    if (isTeacher) {
      return [
        { to: '/teacher', label: 'Trang chủ', icon: Home },
        { to: '/teacher/activities', label: 'Hoạt động', icon: BookOpen },
        { to: '/teacher/approve', label: 'Duyệt', icon: QrCode },
        { to: '/teacher/notifications', label: 'Thông báo', icon: Bell, badgeKey: 'notifications' },
        { to: '/teacher/profile', label: 'Hồ sơ', icon: User },
      ];
    }
    if (isMonitor) {
      return [
        { to: '/monitor', label: 'Trang chủ', icon: Home },
        { to: '/monitor/activities', label: 'Hoạt động', icon: BookOpen },
        { to: '/monitor/qr-scanner', label: 'Điểm danh', icon: QrCode },
        { to: '/monitor/notifications', label: 'Thông báo', icon: Bell, badgeKey: 'notifications' },
        { to: '/monitor/my-profile', label: 'Hồ sơ', icon: User },
      ];
    }
    return [
      { to: '/student', label: 'Trang chủ', icon: Home },
      { to: '/student/activities', label: 'Hoạt động', icon: BookOpen },
      { to: '/student/qr-scanner', label: 'Điểm danh', icon: QrCode },
      { to: '/student/my-certificates', label: 'Chứng chỉ', icon: Bell },
      { to: '/student/profile', label: 'Hồ sơ', icon: User },
    ];
  })();

  const isActive = (to: string) => {
    if (to === '/admin' || to === '/teacher' || to === '/monitor' || to === '/student') {
      return location.pathname === to;
    }
    return location.pathname === to || location.pathname.startsWith(to + '/');
  };

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-white/60 bg-white/85 backdrop-blur-2xl shadow-[0_-8px_30px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-950/85 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Mobile navigation"
    >
      <ul className="flex items-stretch justify-between px-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          const showBadge = item.badgeKey === 'notifications' && unreadCount > 0;
          return (
            <li key={item.to} className="flex-1">
              <Link
                to={item.to}
                className={`relative flex h-14 flex-col items-center justify-center gap-0.5 px-1 transition-colors ${
                  active
                    ? 'text-indigo-600 dark:text-indigo-300'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <span className="relative">
                  <Icon className={`h-5 w-5 ${active ? 'stroke-[2.4]' : ''}`} />
                  {showBadge && (
                    <span className="absolute -right-2 -top-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </span>
                <span className={`text-[10px] font-bold leading-none ${active ? '' : 'opacity-80'}`}>{item.label}</span>
                {active && (
                  <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
