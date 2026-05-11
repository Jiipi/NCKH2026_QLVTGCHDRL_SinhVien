import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUp, ArrowDown, BookOpen, QrCode, User, LayoutDashboard } from 'lucide-react';
import { useAppStore } from '../../../shared/store';
import { normalizeRole } from '../../../shared/lib/role';
import sessionStorageManager from '../../../shared/api/sessionStorageManager';

export default function ModernFooter() {
  const [isAtTop, setIsAtTop] = React.useState(true);
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const [container, setContainer] = React.useState<HTMLElement | Window | null>(null);
  const location = useLocation();
  const storeRole = useAppStore(s => s.role);
  const session = sessionStorageManager.getSession();
  const sessionUser = session?.user as any;
  const role = normalizeRole(storeRole || session?.role || sessionUser?.vai_tro?.ten_vt || sessionUser?.role || sessionUser?.roleCode);
  const isMonitor = role === 'LOP_TRUONG';
  const hideScrollToggle = location.pathname.includes('/qr-scanner');

  React.useEffect(() => {
    const el = btnRef.current ? btnRef.current.closest('main') as HTMLElement | null : null;
    setContainer(el || window);

    const getMetrics = () => {
      if (el) {
        const nearTop = el.scrollTop < 100;
        const nearBottom = (el.scrollTop + el.clientHeight) >= (el.scrollHeight - 100);
        if (nearTop) setIsAtTop(true);
        else if (nearBottom) setIsAtTop(false);
      } else {
        const nearTop = window.scrollY < 100;
        const nearBottom = (window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 100);
        if (nearTop) setIsAtTop(true);
        else if (nearBottom) setIsAtTop(false);
      }
    };

    const target = el || window;
    target.addEventListener('scroll', getMetrics, { passive: true });
    getMetrics();
    return () => target.removeEventListener('scroll', getMetrics);
  }, [location.pathname]);

  const handleScrollToggle = () => {
    const target = container || window;
    if (!isAtTop) {
      target.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target === window) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } else {
      target.scrollTo({ top: (target as HTMLElement).scrollHeight, behavior: 'smooth' });
    }
  };

  const currentYear = new Date().getFullYear();
  const links = isMonitor ? [
    { label: 'Tổng quan lớp', to: '/monitor', icon: LayoutDashboard },
    { label: 'Hoạt động lớp', to: '/monitor/activities', icon: BookOpen },
    { label: 'Điểm danh QR', to: '/monitor/qr-scanner', icon: QrCode },
    { label: 'Hồ sơ', to: '/monitor/my-profile', icon: User }
  ] : [
    { label: 'Tổng quan', to: role === 'ADMIN' ? '/admin' : role === 'GIANG_VIEN' ? '/teacher' : '/student', icon: LayoutDashboard },
    { label: 'Hoạt động', to: role === 'GIANG_VIEN' ? '/teacher/activities' : role === 'ADMIN' ? '/admin/activities' : '/student/activities', icon: BookOpen },
    { label: 'Điểm danh QR', to: '/student/qr-scanner', icon: QrCode },
    { label: 'Hồ sơ', to: role === 'GIANG_VIEN' ? '/teacher/profile' : role === 'ADMIN' ? '/admin/profile' : '/student/profile', icon: User }
  ];

  return (
    <footer className="mt-auto border-t border-white/60 bg-white/60 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55">
      <div className="mx-auto px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
              © {currentYear} Đại học Đà Lạt — Hệ thống Quản lý Rèn luyện Sinh viên
            </p>
            <p className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">
              Không gian thao tác học thuật, gọn nhẹ và nhất quán theo từng vai trò.
            </p>
          </div>

          <nav className="flex flex-wrap gap-2">
            {links.map(({ label, to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 ${location.pathname === to || (to !== '/student' && to !== '/monitor' && location.pathname.startsWith(to))
                  ? 'border-indigo-200/80 bg-indigo-50/80 text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-200'
                  : 'border-white/60 bg-white/45 text-slate-500 hover:bg-white/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {!hideScrollToggle && (
        <button
          ref={btnRef}
          onClick={handleScrollToggle}
          className="fixed bottom-4 right-4 z-50 rounded-2xl border border-white/60 bg-white/80 p-3 text-slate-700 shadow-lg shadow-slate-900/10 backdrop-blur-2xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-200 sm:bottom-6 sm:right-6"
          aria-label={isAtTop ? 'Xuống cuối trang' : 'Lên đầu trang'}
        >
          {isAtTop ? <ArrowDown className="h-5 w-5" /> : <ArrowUp className="h-5 w-5" />}
        </button>
      )}
    </footer>
  );
}
