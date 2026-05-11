import { Link, useNavigate, useLocation } from 'react-router-dom';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Sun,
  Moon,
  User,
  LogOut,
  HelpCircle,
  Menu,
  X,
  ChevronDown,
  QrCode,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  MapPin,
  CalendarDays,
  Sparkles,
  BookOpenCheck
} from 'lucide-react';
import http from '../../../shared/api/http';
import { useAppStore } from '../../../shared/store';
import { normalizeRole } from '../../../shared/lib/role';
import { useMultiSession } from '../../../shared/hooks/useMultiSession';
import SessionMonitor from '../../../shared/components/session/SessionMonitor';
import sessionStorageManager from '../../../shared/api/sessionStorageManager';
import { getUserAvatar, getAvatarGradient } from '../../../shared/lib/avatar';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { getCurrentSemesterValue, getSemesterLabel } from '../../../shared/lib/semester';

export default function ModernHeader({ isMobile, onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearSession } = useMultiSession();
  const [profile, setProfile] = React.useState(null);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [notificationOpen, setNotificationOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState(null);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [avatarError, setAvatarError] = React.useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [theme, setTheme] = React.useState(() => {
    return sessionStorage.getItem('theme') || 'light';
  });
  const [detail, setDetail] = React.useState(null);
  const [selectedSemester, setSelectedSemester] = React.useState(() => {
    return sessionStorage.getItem('selected_semester') || sessionStorage.getItem('backend_current_semester') || getCurrentSemesterValue(true);
  });

  const dropdownRef = React.useRef(null);
  const buttonRef = React.useRef(null);
  const notifRef = React.useRef(null);
  const searchRef = React.useRef(null);

  // Lấy role từ store
  const { user } = useAppStore();
  const storeRole = useAppStore(s => s.role);
  const tokenInStore = useAppStore(s => s.token);
  const computedRole = storeRole || profile?.vai_tro?.ten_vt || profile?.vai_tro || user?.vai_tro || user?.role || '';
  const normalizedRole = String(normalizeRole(computedRole) || computedRole).toUpperCase();

  const isAdminContext = normalizedRole === 'ADMIN' ||
    normalizedRole === 'QUẢN TRỊ VIÊN' ||
    normalizedRole === 'QUAN TRI VIEN' ||
    normalizedRole.includes('ADMIN');

  const isTeacherContext = normalizedRole === 'GIANG_VIEN' ||
    normalizedRole === 'GIẢNG_VIÊN' ||
    normalizedRole.includes('GIANG') ||
    normalizedRole.includes('GIẢNG');

  const isMonitorContext = normalizedRole === 'LOP_TRUONG' ||
    normalizedRole === 'LỚP_TRƯỞNG' ||
    normalizedRole === 'MONITOR' ||
    normalizedRole.includes('LOP') ||
    normalizedRole.includes('LỚP');

  // Theme toggle
  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    sessionStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Load profile
  React.useEffect(() => {
    const token = sessionStorageManager.getToken();
    if (token) {
      http.get('/core/profile')
        .then(response => {
          const payload = (response?.data?.data || response?.data) || null;
          setProfile(payload);
          if (payload) {
            localStorage.removeItem('profile');
            sessionStorageManager.saveSession({ token, user: payload, role: sessionStorageManager.getRole() || payload?.vai_tro?.ten_vt || payload?.role || payload?.roleCode });
          }
        })
        .catch(error => {
          console.error('Failed to load profile:', error?.response?.status);
          if (error?.response?.status === 401) {
            sessionStorageManager.clearSession();
            localStorage.removeItem('profile');
            setProfile(null);
          }
        });
      loadNotifications();
    } else {
      setProfile(null);
      localStorage.removeItem('profile');
    }
  }, []);

  // Listen for profile updates
  React.useEffect(() => {
    const handleProfileUpdate = (event) => {
      if (event.detail?.profile) {
        setProfile(event.detail.profile);
        setAvatarError(false);
        const currentSession = sessionStorageManager.getSession();
        if (currentSession) {
          sessionStorageManager.saveSession({ ...currentSession, user: event.detail.profile });
        }
      }
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [profile]);

  // Keep in sync with session events
  React.useEffect(() => {
    function sync() {
      const s = sessionStorageManager.getSession();
      if (s?.user) setProfile(s.user); else setProfile(null);
    }
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  // Handle click outside to close dropdowns
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationOpen && notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
      if (profileOpen && dropdownRef.current && buttonRef.current) {
        if (!dropdownRef.current.contains(event.target) && !buttonRef.current.contains(event.target)) {
          setProfileOpen(false);
        }
      }
      if (searchOpen && searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationOpen, profileOpen, searchOpen]);

  // Debounced search
  React.useEffect(() => {
    if (debouncedSearch && debouncedSearch.trim().length >= 2) {
      performSearch(debouncedSearch);
    } else {
      setSearchResults(null);
      setSearchOpen(false);
    }
  }, [debouncedSearch]);

  React.useEffect(() => {
    const syncSemester = (event?: Event) => {
      const changedSemester = event instanceof CustomEvent ? event.detail?.semester : null;
      setSelectedSemester(changedSemester || sessionStorage.getItem('selected_semester') || sessionStorage.getItem('backend_current_semester') || getCurrentSemesterValue(true));
    };

    window.addEventListener('semester_changed', syncSemester);
    window.addEventListener('semester_selection_changed', syncSemester);
    window.addEventListener('storage', syncSemester);
    return () => {
      window.removeEventListener('semester_changed', syncSemester);
      window.removeEventListener('semester_selection_changed', syncSemester);
      window.removeEventListener('storage', syncSemester);
    };
  }, []);

  const performSearch = async (query) => {
    try {
      setSearchLoading(true);
      const response = await http.get('/search', { params: { q: query } });
      const data = response?.data?.data || {};
      setSearchResults(data);
      setSearchOpen(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const isAuthenticated = Boolean(tokenInStore || sessionStorageManager.getToken());

  const loadNotifications = async () => {
    try {
      const response = await http.get('/core/notifications?limit=10');
      const data = response?.data?.data || response?.data || {};
      if (data.notifications && Array.isArray(data.notifications)) {
        const transformedNotifications = data.notifications.map(notification => ({
          id: notification.id,
          title: notification.title,
          message: notification.message,
          time: formatTimeAgo(notification.time),
          type: notification.type,
          unread: notification.unread
        }));
        setNotifications(transformedNotifications);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      const placeholderNotifications = [
        {
          id: 'n1',
          title: 'Cập nhật lịch hoạt động tuần này',
          message: 'Có 3 hoạt động mới được thêm vào lịch tuần này',
          time: '2 giờ trước',
          type: 'info',
          unread: true
        },
        {
          id: 'n2',
          title: 'Nhắc nhở nộp minh chứng điểm RL',
          message: 'Hạn cuối nộp minh chứng là 30/09/2025',
          time: '1 ngày trước',
          type: 'warning',
          unread: true
        }
      ];
      setNotifications(placeholderNotifications);
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle2;
      case 'info':
      default: return Info;
    }
  };

  const getHomePath = () => {
    if (isAdminContext) return '/admin';
    if (isTeacherContext) return '/teacher';
    if (isMonitorContext) return '/monitor';
    return '/student';
  };

  const getAttendancePath = () => {
    if (isMonitorContext) return '/monitor/qr-scanner';
    return '/student/qr-scanner';
  };

  const formatTimeAgo = (timestamp) => {
    try {
      const now = new Date();
      const time = new Date(timestamp);
      const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
      if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
      else if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
      else return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
    } catch (error) {
      return 'Vừa xong';
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      setNotifications(prev => prev.map(n =>
        n.id === notificationId ? { ...n, unread: false } : n
      ));
      await http.patch(`/core/notifications/${notificationId}/read`);
    } catch (error) {
      setNotifications(prev => prev.map(n =>
        n.id === notificationId ? { ...n, unread: true } : n
      ));
    }
  };

  const markAllAsRead = async () => {
    const previousNotifications = [...notifications];
    try {
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
      await http.patch('/core/notifications/mark-all-read');
    } catch (error) {
      setNotifications(previousNotifications);
    }
  };

  const openDetail = async (id) => {
    try {
      const res = await http.get(`/core/notifications/${id}`);
      const d = res?.data?.data || res?.data || null;
      if (d) {
        setDetail({
          id: d.id,
          title: d.title,
          message: d.message,
          time: formatTimeAgo(d.time),
          sender: d.sender,
          activity: d.activity
        });
      }
      await markAsRead(id);
      setNotificationOpen(false);
    } catch (e) {
      console.error('Failed to load notification detail', e);
    }
  };

  const handleLogout = async () => {
    try {
      await sessionStorageManager.sendSessionPing('logout');
    } catch (err) {
      console.warn('[Logout] Failed to notify server:', err);
    }
    try {
      clearSession();
      sessionStorageManager.clearSession();
      localStorage.removeItem('profile');
      localStorage.removeItem('tab_id_temp');
    } catch (_) { }
    setProfile(null);
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchOpen && searchResults && searchResults.total > 0) {
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const getInitials = () => {
    const name = profile?.ho_ten || profile?.ten_dn || profile?.name || profile?.email || '';
    if (!name) return 'U';
    const parts = String(name).trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  };

  const getRoleLabel = () => {
    if (isAdminContext) return 'Quản trị viên';
    if (isTeacherContext) return 'Giảng viên';
    if (isMonitorContext) return 'Lớp trưởng';
    return 'Sinh viên';
  };

  const getProfilePath = () => {
    if (isAdminContext) return '/admin/profile';
    if (isTeacherContext) return '/teacher/profile';
    if (isMonitorContext) return '/monitor/my-profile';
    return '/student/profile';
  };

  const getPageTitle = () => {
    const path = location.pathname;
    
    // Dashboard pages -> Show Greeting
    if (path === '/' || path === '/student' || path === '/monitor' || path === '/teacher' || path === '/admin') {
      return profile ? `Chào mừng trở lại, ${profile?.ho_ten || profile?.ten_dn || 'bạn'}!` : 'Trang chủ';
    }

    // Role-agnostic or specific pages
    if (path.includes('/my-activities')) return 'Hoạt động của tôi';
    if (path.includes('/activities')) return 'Khám phá hoạt động';
    if (path.includes('/scores')) return 'Điểm rèn luyện';
    if (path.includes('/qr-scanner') || path.includes('/qr')) return 'Điểm danh';
    if (path.includes('/profile') || path.includes('/my-profile')) return 'Hồ sơ cá nhân';
    if (path.includes('/verify') || path.includes('/teacher/verify')) return 'Phê duyệt hoạt động';
    if (path.includes('/manage-students') || path.includes('/students')) return 'Quản lý sinh viên';
    if (path.includes('/reports')) return 'Báo cáo & Thống kê';
    if (path.includes('/users')) return 'Quản lý người dùng';
    if (path.includes('/settings')) return 'Cài đặt hệ thống';

    return 'Hệ thống Quản lý Rèn luyện';
  };

  const pageTitle = getPageTitle();
  const semesterLabel = getSemesterLabel(selectedSemester) || profile?.nam_hoc || 'Năm học hiện tại';
  const headerStats = [
    { icon: CalendarDays, label: 'Học kỳ', value: semesterLabel },
    { icon: BookOpenCheck, label: 'Không gian', value: getRoleLabel() },
    { icon: Sparkles, label: 'Trạng thái', value: isAuthenticated ? 'Đang hoạt động' : 'Chưa đăng nhập' }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur-2xl transition-colors duration-200 dark:border-white/10 dark:bg-slate-950/75 dark:shadow-black/20">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-300/60 to-transparent dark:via-indigo-300/20" />
      <div className="w-full px-3 sm:px-5">
        <div className="relative flex h-16 items-center justify-between gap-3">
          {/* Left: Mobile menu + Greeting text */}
          <div className="flex min-w-0 items-center gap-3 lg:flex-[0_1_48%] xl:flex-[0_1_42%]">
            {/* Mobile Menu Button */}
            {isMobile && onMenuClick && (
              <button
                onClick={onMenuClick}
                className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </button>
            )}

            {/* Page Title / Greeting with Animation */}
            {profile && (
              <Link to={getHomePath()} className="group relative flex min-w-[220px] max-w-full flex-1 items-center gap-3 rounded-2xl border border-white/60 bg-white/45 px-3 py-1.5 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white/70 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
                <div className="hidden h-10 w-1 rounded-full bg-gradient-to-b from-indigo-500 via-teal-400 to-emerald-400 shadow-[0_0_20px_rgba(99,102,241,0.35)] sm:block" />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={pageTitle}
                    initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    className="min-w-0"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <motion.h2
                        className="truncate bg-[linear-gradient(110deg,#0f172a,45%,#4f46e5,55%,#0f766e,65%,#0f172a)] bg-[length:240%_100%] bg-clip-text text-[19px] font-black leading-tight tracking-[-0.025em] text-transparent antialiased dark:bg-[linear-gradient(110deg,#ffffff,45%,#c7d2fe,55%,#99f6e4,65%,#ffffff)]"
                        style={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
                        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        {pageTitle}
                      </motion.h2>
                      <span className="hidden rounded-full border border-indigo-200/70 bg-indigo-50/70 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-indigo-600 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-200 md:inline-flex">
                        {getRoleLabel()}
                      </span>
                    </div>
                    <p className="mt-0.5 hidden text-[11px] font-bold text-slate-500 dark:text-slate-400 sm:block">
                      {semesterLabel}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </Link>
            )}
          </div>

          {isAuthenticated && (
            <div className="hidden min-w-0 flex-1 items-center justify-center gap-2 xl:flex">
              {headerStats.map(({ icon: Icon, label, value }) => (
                <div key={label} className="group/stat flex min-w-fit items-center gap-2 rounded-2xl border border-white/60 bg-white/45 px-3 py-2 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white/70 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-teal-50 text-indigo-600 ring-1 ring-white/70 transition-transform group-hover/stat:scale-105 dark:from-indigo-400/10 dark:to-teal-400/10 dark:text-indigo-300 dark:ring-white/10">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="whitespace-nowrap">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">{label}</p>
                    <p className="text-xs font-black text-slate-800 dark:text-white">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Right: Actions */}
          {isAuthenticated ? (
            <div className="flex flex-shrink-0 items-center gap-2 rounded-[1.35rem] border border-white/60 bg-white/45 p-1.5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="rounded-2xl border border-transparent p-2 transition-all hover:border-white/70 hover:bg-white/70 hover:shadow-sm dark:hover:border-white/10 dark:hover:bg-white/10"
                title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                ) : (
                  <Sun className="h-5 w-5 text-slate-400" />
                )}
              </button>

              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => {
                    setNotificationOpen(!notificationOpen);
                    if (!notificationOpen) loadNotifications();
                  }}
                  className="relative rounded-xl border border-transparent p-2 transition-colors hover:border-white/60 hover:bg-white/55 dark:hover:border-white/10 dark:hover:bg-white/10"
                >
                  <Bell className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/85 dark:shadow-black/30 sm:w-96">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Thông báo</h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-semibold">
                          {unreadCount} mới
                        </span>
                      )}
                    </div>
                    <div className="max-h-[360px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                          <p className="text-sm text-slate-400">Không có thông báo nào</p>
                        </div>
                      ) : (
                        notifications.map((notification) => {
                          const NotificationIcon = getNotificationIcon(notification.type);
                          return (
                          <div
                            key={notification.id}
                            onClick={() => openDetail(notification.id)}
                            className={`p-3.5 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${notification.unread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                              }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300"><NotificationIcon className="h-4 w-4" /></div>
                              <div className="flex-1 min-w-0">
                                <h4 className={`text-sm font-medium ${notification.unread ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                  {notification.title}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                  {notification.message}
                                </p>
                                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                                  {notification.time}
                                </span>
                              </div>
                              {notification.unread && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                              )}
                            </div>
                          </div>
                          );
                        })
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
                        <button
                          onClick={markAllAsRead}
                          className="w-full text-center text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 transition-colors"
                        >
                          Đánh dấu tất cả đã đọc
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick attendance button — matches mockup "Điểm danh nhanh" */}
              <button
                onClick={() => navigate(getAttendancePath())}
                className="hidden items-center gap-2 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-4 py-2 text-xs font-black text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/10 transition-all hover:-translate-y-0.5 hover:shadow-xl dark:from-white dark:via-indigo-100 dark:to-white dark:text-slate-950 sm:inline-flex"
              >
                <QrCode className="h-3.5 w-3.5" />
                Điểm danh nhanh
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  ref={buttonRef}
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/55 p-1.5 pr-2 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white/75 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  {(() => {
                    const avatar = getUserAvatar(profile);
                    return (avatar.hasValidAvatar && !avatarError) ? (
                      <div className="h-9 w-9 overflow-hidden rounded-2xl shadow-sm ring-1 ring-white/70 dark:ring-white/10">
                        <img
                          src={avatar.src}
                          alt={avatar.alt}
                          className="w-full h-full object-cover"
                          onError={() => setAvatarError(true)}
                        />
                      </div>
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-xs font-black text-white shadow-sm ring-1 ring-white/70 dark:from-white dark:via-indigo-100 dark:to-white dark:text-slate-950 dark:ring-white/10">
                        {getInitials()}
                      </div>
                    );
                  })()}
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                      {profile?.ho_ten || profile?.ten_dn || 'User'}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {getRoleLabel()}
                    </p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/85 dark:shadow-black/30"
                  >
                    {/* Profile Header */}
                    <div className="p-4 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white dark:from-white dark:via-indigo-100 dark:to-white dark:text-slate-950">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const avatar = getUserAvatar(profile);
                          return (avatar.hasValidAvatar && !avatarError) ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/20">
                              <img src={avatar.src} alt={avatar.alt} className="w-full h-full object-cover" onError={() => setAvatarError(true)} />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                              {getInitials()}
                            </div>
                          );
                        })()}
                        <div>
                          <p className="font-semibold text-sm">{profile?.ho_ten || profile?.ten_dn}</p>
                          <p className="text-xs text-white/70 dark:text-slate-600">{profile?.email || getRoleLabel()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1.5">
                      <Link
                        to={getProfilePath()}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <User className="h-4 w-4 text-slate-400" />
                        <span>Hồ sơ cá nhân</span>
                      </Link>

                      <Link
                        to="/support"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <HelpCircle className="h-4 w-4 text-slate-400" />
                        <span>Hỗ trợ</span>
                      </Link>

                      <div className="my-1 border-t border-slate-200 dark:border-slate-700"></div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 transition-all duration-200 hover:-translate-y-0.5 dark:from-white dark:via-indigo-100 dark:to-white dark:text-slate-950"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>

      {/* Notification Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-5 bg-blue-800 dark:bg-blue-900 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold">{detail.title}</h3>
                  <p className="text-xs text-blue-200 mt-1">{detail.time} • {detail.sender}</p>
                </div>
                <button
                  onClick={() => setDetail(null)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-5">
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {detail.message}
              </p>

              {detail.activity && (
                <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                    Hoạt động liên quan
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {detail.activity.ten_hd}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="h-3.5 w-3.5" />
                    {detail.activity.dia_diem || 'Chưa xác định'}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    {detail.activity.ngay_bd ? new Date(detail.activity.ngay_bd).toLocaleString('vi-VN') : 'Chưa xác định'}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-400 font-semibold mt-2">
                    +{Number(detail.activity.diem_rl || 0)} điểm RL
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
