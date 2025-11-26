import { Link, useNavigate } from 'react-router-dom';
import React from 'react';
import { 
  Bell, 
  Search, 
  Sun, 
  Moon, 
  User, 
  Settings, 
  LogOut, 
  HelpCircle,
  Menu,
  X,
  ChevronDown,
  GraduationCap,
  Clock,
  MapPin,
  Users,
  BookOpen,
  Building2,
  Loader2
} from 'lucide-react';
import http from '../../../shared/api/http';
import { useAppStore } from '../../../shared/store';
import { normalizeRole } from '../../../shared/lib/role';
import { useMultiSession } from '../../../shared/hooks/useMultiSession';
import SessionMonitor from '../../../shared/components/session/SessionMonitor';
import sessionStorageManager from '../../../shared/api/sessionStorageManager';
import { getUserAvatar, getAvatarGradient } from '../../../shared/lib/avatar';
import { useDebounce } from '../../../shared/hooks/useDebounce';

export default function ModernHeader({ isMobile, onMenuClick }) {
  const navigate = useNavigate();
  const { clearSession } = useMultiSession();
  const [profile, setProfile] = React.useState(null);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [notificationOpen, setNotificationOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState(null);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [theme, setTheme] = React.useState(() => {
    // Mỗi tab có theme riêng, không đồng bộ giữa các tab
    return sessionStorage.getItem('theme') || 'light';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [detail, setDetail] = React.useState(null);
  
  const dropdownRef = React.useRef(null);
  const buttonRef = React.useRef(null);
  const notifRef = React.useRef(null);
  const searchRef = React.useRef(null);
  const searchInputRef = React.useRef(null);
  
  // Lấy role từ store (ưu tiên role từ store để tránh nhầm hiển thị)
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

  // Theme toggle - Mỗi tab độc lập, không đồng bộ giữa các tab
  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Lưu vào sessionStorage thay vì localStorage để mỗi tab riêng biệt
    sessionStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Load profile (tab-specific) - ALWAYS fetch fresh from API
  React.useEffect(() => {
    const token = sessionStorageManager.getToken();
    if (token) {
      // ALWAYS fetch fresh profile from API (không lấy từ session cũ)
      http.get('/core/profile')
        .then(response => {
          const payload = (response?.data?.data || response?.data) || null;
          console.log('✅ ModernHeader profile loaded from /core/profile:', {
            ho_ten: payload?.ho_ten,
            ten_dn: payload?.ten_dn,
            email: payload?.email,
            anh_dai_dien: payload?.anh_dai_dien,
            vai_tro: payload?.vai_tro
          });
          setProfile(payload);
          if (payload) {
            // Clear localStorage cache cũ (nếu có)
            localStorage.removeItem('profile');
            // Update session with fresh data
            sessionStorageManager.saveSession({ token, user: payload, role: sessionStorageManager.getRole() || payload?.vai_tro?.ten_vt || payload?.role || payload?.roleCode });
          }
        })
        .catch(error => {
          console.error('Failed to load from /core/profile:', error?.response?.status);
          // Clear invalid session
          if (error?.response?.status === 401) {
            sessionStorageManager.clearSession();
            localStorage.removeItem('profile');
            setProfile(null);
          }
        });
      loadNotifications();
    } else {
      // No token, clear profile
      setProfile(null);
      localStorage.removeItem('profile');
    }
  }, []);

  // Listen for profile updates (when avatar is changed)
  React.useEffect(() => {
    const handleProfileUpdate = (event) => {
      console.log('📢 ModernHeader received profileUpdated event:', event.detail);
      if (event.detail?.profile) {
        console.log('🔄 Updating ModernHeader profile from:', profile?.ho_ten, 'to:', event.detail.profile.ho_ten);
        setProfile(event.detail.profile);
        // Also update session storage
        const currentSession = sessionStorageManager.getSession();
        if (currentSession) {
          sessionStorageManager.saveSession({ ...currentSession, user: event.detail.profile });
        }
      }
    };

    // Listen for custom profile update events
    window.addEventListener('profileUpdated', handleProfileUpdate);
    console.log('🎧 ModernHeader event listener added for profileUpdated');

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
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
      // Close notification dropdown if click outside
      if (notificationOpen && notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
      
      // Close profile dropdown if click outside
      if (profileOpen && dropdownRef.current && buttonRef.current) {
        if (!dropdownRef.current.contains(event.target) && !buttonRef.current.contains(event.target)) {
          setProfileOpen(false);
        }
      }

      // Close search dropdown if click outside
      if (searchOpen && searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationOpen, profileOpen, searchOpen]);

  // Debounced search effect
  React.useEffect(() => {
    if (debouncedSearch && debouncedSearch.trim().length >= 2) {
      performSearch(debouncedSearch);
    } else {
      setSearchResults(null);
      setSearchOpen(false);
    }
  }, [debouncedSearch]);

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
      // Fallback placeholder
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
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'info':
      default: return 'ℹ️';
    }
  };

  const formatTimeAgo = (timestamp) => {
    try {
      const now = new Date();
      const time = new Date(timestamp);
      const diffInMinutes = Math.floor((now - time) / (1000 * 60));
      
      if (diffInMinutes < 60) {
        return `${diffInMinutes} phút trước`;
      } else if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours} giờ trước`;
      } else {
        const days = Math.floor(diffInMinutes / 1440);
        return `${days} ngày trước`;
      }
    } catch (error) {
      return 'Vừa xong';
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, unread: false } : n
      ));
      await http.put(`/core/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
      await http.put('/core/notifications/mark-all-read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      loadNotifications();
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
      // Gọi API để xóa session trên server trước
      await sessionStorageManager.sendSessionPing('logout');
    } catch (err) {
      console.warn('[Logout] Failed to notify server:', err);
    }
    try {
      clearSession();
      sessionStorageManager.clearSession();
      // Clear localStorage cache
      localStorage.removeItem('profile');
      localStorage.removeItem('tab_id_temp');
    } catch (_) {}
    setProfile(null);
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by debounced effect, form submit just focuses first result
    if (searchOpen && searchResults && searchResults.total > 0) {
      // Close dropdown and clear search
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

  const getRoleColor = () => {
    if (isAdminContext) return 'from-red-500 to-orange-500';
    if (isTeacherContext) return 'from-purple-500 to-indigo-500';
    if (isMonitorContext) return 'from-green-500 to-teal-500';
    return 'from-blue-500 to-cyan-500';
  };

  const getRoleLabel = () => {
    if (isAdminContext) return 'Quản trị viên';
    if (isTeacherContext) return 'Giảng viên';
    if (isMonitorContext) return 'Lớp trưởng';
    return 'Sinh viên';
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-sm transition-colors duration-200">
      {/* Top gradient line */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      
      <div className="w-full px-2 sm:px-4">
        <div className="relative flex h-16 items-center justify-between">
          {/* Left: Mobile Menu + Logo - BÁM SÁT góc trái */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mobile Menu Button */}
            {isMobile && onMenuClick && (
              <button
                onClick={onMenuClick}
                className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors touch-target"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
            )}

            {/* Logo & Brand */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className={`relative p-2 bg-gradient-to-br ${getRoleColor()} rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105`}>
                <GraduationCap className="h-6 w-6 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Điểm Rèn Luyện</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Quản lý chuyên nghiệp</p>
              </div>
            </Link>
          </div>

          {/* Center: Search bar - Desktop - CHÍNH GIỮA tuyệt đối */}
          <div ref={searchRef} className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl px-2 pointer-events-none">
            <div className="relative w-full">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                  {searchLoading && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500 animate-spin pointer-events-none" />
                  )}
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => { if (searchResults && searchResults.total > 0) setSearchOpen(true); }}
                    placeholder="Tìm kiếm hoạt động..."
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 pointer-events-auto"
                  />
                </div>
              </form>

              {/* Search Results Dropdown */}
              {searchOpen && searchResults && searchResults.total > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden max-h-[500px] overflow-y-auto pointer-events-auto z-50">
                  
                  {/* Activities */}
                  {searchResults.activities && searchResults.activities.length > 0 && (
                    <div className="border-b border-gray-200 dark:border-slate-700">
                      <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Hoạt động ({searchResults.activities.length})
                        </h3>
                      </div>
                      {searchResults.activities.map((activity) => (
                        <div
                          key={activity.id}
                          onClick={() => {
                            // Điều hướng theo ngữ cảnh tab tương ứng
                            if (activity.isMine) {
                              if (isTeacherContext) {
                                navigate('/teacher/activities');
                              } else if (isAdminContext) {
                                navigate('/admin/activities');
                              } else if (isMonitorContext) {
                                navigate('/monitor/my-activities');
                              } else {
                                navigate('/student/my-activities');
                              }
                            } else {
                              // Không thuộc "của tôi": mở trang danh sách hoạt động đúng theo vai trò
                              if (isTeacherContext) {
                                navigate('/teacher/activities');
                              } else if (isAdminContext) {
                                navigate('/admin/activities');
                              } else {
                                // Sinh viên/Lớp trưởng
                                navigate('/student/activities');
                              }
                            }
                            setSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors border-b border-gray-100 dark:border-slate-700/50 last:border-0"
                        >
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                            {activity.ten_hd}
                            {activity.isMine && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">Của tôi</span>
                            )}
                          </h4>
                          {activity.mo_ta && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                              {activity.mo_ta}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {activity.dia_diem && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {activity.dia_diem}
                              </span>
                            )}
                            {activity.ngay_bd && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(activity.ngay_bd).toLocaleDateString('vi-VN')}
                              </span>
                            )}
                            {activity.diem_rl && (
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                +{activity.diem_rl} điểm
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Students */}
                  {searchResults.students && searchResults.students.length > 0 && (
                    <div className="border-b border-gray-200 dark:border-slate-700">
                      <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Sinh viên ({searchResults.students.length})
                        </h3>
                      </div>
                      {searchResults.students.map((student) => (
                        <div
                          key={student.id_nd}
                          onClick={() => {
                            if (isAdminContext) {
                              navigate(`/admin/students/${student.id_nd}`);
                            } else if (isTeacherContext || isMonitorContext) {
                              navigate(`/teacher/students/${student.id_nd}`);
                            }
                            setSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors border-b border-gray-100 dark:border-slate-700/50 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            {(() => {
                              const avatar = getUserAvatar(student.nguoi_dung);
                              return avatar.hasValidAvatar ? (
                                <img src={avatar.src} alt={avatar.alt} className="w-10 h-10 rounded-lg object-cover" />
                              ) : (
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getAvatarGradient(student.nguoi_dung?.ho_ten || '')} flex items-center justify-center text-white font-bold text-sm`}>
                                  {avatar.fallback}
                                </div>
                              );
                            })()}
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                {student.nguoi_dung?.ho_ten}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {student.ma_sv} • {student.lop?.ten_lop}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Classes */}
                  {searchResults.classes && searchResults.classes.length > 0 && (
                    <div className="border-b border-gray-200 dark:border-slate-700">
                      <div className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Lớp học ({searchResults.classes.length})
                        </h3>
                      </div>
                      {searchResults.classes.map((cls) => (
                        <div
                          key={cls.id}
                          onClick={() => {
                            if (isAdminContext) {
                              navigate(`/admin/classes/${cls.id}`);
                            } else if (isTeacherContext) {
                              navigate(`/teacher/classes/${cls.id}`);
                            }
                            setSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors border-b border-gray-100 dark:border-slate-700/50 last:border-0"
                        >
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {cls.ten_lop}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {cls.khoa?.ten_khoa} • {cls._count?.sinh_vien || 0} sinh viên
                          </p>
                          {cls.gvcn?.ho_ten && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              GVCN: {cls.gvcn.ho_ten}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Teachers */}
                  {searchResults.teachers && searchResults.teachers.length > 0 && (
                    <div className="border-b border-gray-200 dark:border-slate-700">
                      <div className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Giảng viên ({searchResults.teachers.length})
                        </h3>
                      </div>
                      {searchResults.teachers.map((teacher) => (
                        <div
                          key={teacher.id}
                          onClick={() => {
                            navigate(`/admin/teachers/${teacher.id}`);
                            setSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors border-b border-gray-100 dark:border-slate-700/50 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            {(() => {
                              const avatar = getUserAvatar(teacher);
                              return avatar.hasValidAvatar ? (
                                <img src={avatar.src} alt={avatar.alt} className="w-10 h-10 rounded-lg object-cover" />
                              ) : (
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getAvatarGradient(teacher.ho_ten || '')} flex items-center justify-center text-white font-bold text-sm`}>
                                  {avatar.fallback}
                                </div>
                              );
                            })()}
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                {teacher.ho_ten}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {teacher.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Faculties */}
                  {searchResults.faculties && searchResults.faculties.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Khoa ({searchResults.faculties.length})
                        </h3>
                      </div>
                      {searchResults.faculties.map((faculty) => (
                        <div
                          key={faculty.id}
                          onClick={() => {
                            navigate(`/admin/faculties/${faculty.id}`);
                            setSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors border-b border-gray-100 dark:border-slate-700/50 last:border-0"
                        >
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {faculty.ten_khoa}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {faculty.ma_khoa} • {faculty._count?.lop_hoc || 0} lớp • {faculty._count?.sinh_vien || 0} sinh viên
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                </div>
              )}
            </div>
          </div>

          {/* Right: Actions + Avatar - BÁM SÁT góc phải */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 flex-shrink-0">
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200 group"
                title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-500 transition-colors" />
                ) : (
                  <Sun className="h-5 w-5 text-gray-300 group-hover:text-yellow-500 transition-colors" />
                )}
              </button>

              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => { 
                    setNotificationOpen(!notificationOpen); 
                    if (!notificationOpen) loadNotifications(); 
                  }}
                  className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200 group"
                >
                  <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-500 transition-colors" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold">Thông báo</h3>
                        {unreadCount > 0 && (
                          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
                            {unreadCount} mới
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-500 dark:text-gray-400">Không có thông báo nào</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => openDetail(notification.id)}
                            className={`p-4 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${
                              notification.unread ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="text-2xl flex-shrink-0">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className={`text-sm font-semibold ${
                                  notification.unread 
                                    ? 'text-gray-900 dark:text-white' 
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                  {notification.title}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <span className="text-xs text-gray-500 dark:text-gray-500 mt-2 block">
                                  {notification.time}
                                </span>
                              </div>
                              {notification.unread && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {notifications.length > 0 && (
                      <div className="p-3 bg-gray-50 dark:bg-slate-700/50 border-t border-gray-200 dark:border-slate-700">
                        <button
                          onClick={markAllAsRead}
                          className="w-full text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        >
                          Đánh dấu tất cả đã đọc
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  ref={buttonRef}
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200 group"
                >
                  {(() => {
                    const avatar = getUserAvatar(profile);
                    console.log('🖼️ ModernHeader avatar info:', {
                      profile_anh_dai_dien: profile?.anh_dai_dien,
                      avatar_src: avatar.src,
                      avatar_hasValid: avatar.hasValidAvatar,
                      avatar_fallback: avatar.fallback
                    });
                    return avatar.hasValidAvatar ? (
                      <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                        <img
                          src={avatar.src}
                          alt={avatar.alt}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white dark:border-slate-900 rounded-full"></div>
                      </div>
                    ) : (
                      <div className={`relative w-9 h-9 bg-gradient-to-br ${getAvatarGradient(profile?.ho_ten || profile?.ten_dn || '')} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105`}>
                        {avatar.fallback}
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white dark:border-slate-900 rounded-full"></div>
                      </div>
                    );
                  })()}
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {profile?.ho_ten || profile?.ten_dn || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {getRoleLabel()}
                    </p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden animate-in slide-in-from-top-2 duration-200"
                  >
                    {/* Profile Header */}
                    <div className={`p-4 bg-gradient-to-r ${getRoleColor()} text-white`}>
                      <div className="flex items-center gap-3">
                        {(() => {
                          const avatar = getUserAvatar(profile);
                          return avatar.hasValidAvatar ? (
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/20 backdrop-blur-sm">
                              <img
                                src={avatar.src}
                                alt={avatar.alt}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-lg backdrop-blur-sm">
                              {avatar.fallback}
                            </div>
                          );
                        })()}
                        <div>
                          <p className="font-semibold">{profile?.ho_ten || profile?.ten_dn}</p>
                          <p className="text-xs text-white/80">{profile?.email || getRoleLabel()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {isAdminContext && (
                        <>
                          <Link
                            to="/admin/profile"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                          >
                            <User className="h-5 w-5 text-gray-400" />
                            <span>Thông tin cá nhân</span>
                          </Link>
                          <Link
                            to="/admin/settings"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Settings className="h-5 w-5 text-gray-400" />
                            <span>Cài đặt</span>
                          </Link>
                        </>
                      )}
                      
                      {isMonitorContext && (
                        <Link
                          to="/monitor/my-profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <User className="h-5 w-5 text-gray-400" />
                          <span>Hồ sơ cá nhân</span>
                        </Link>
                      )}
                      
                      {isTeacherContext && (
                        <>
                          <Link
                            to="/teacher/profile"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                          >
                            <User className="h-5 w-5 text-gray-400" />
                            <span>Thông tin cá nhân</span>
                          </Link>
                          <Link
                            to="/teacher/preferences"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Settings className="h-5 w-5 text-gray-400" />
                            <span>Tùy chọn</span>
                          </Link>
                        </>
                      )}
                      
                      {!isAdminContext && !isMonitorContext && !isTeacherContext && (
                        <Link
                          to="/student/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <User className="h-5 w-5 text-gray-400" />
                          <span>Thông tin cá nhân</span>
                        </Link>
                      )}

                      <Link
                        to="/support"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <HelpCircle className="h-5 w-5 text-gray-400" />
                        <span>Hỗ trợ</span>
                      </Link>

                      <div className="my-2 border-t border-gray-200 dark:border-slate-700"></div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button đã chuyển sang bên trái logo */}
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              Đăng nhập
            </Link>
          )}
        </div>

        {/* Mobile Search */}
        {profile && (
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-slate-800 text-sm text-gray-900 dark:text-white"
              />
            </form>
          </div>
        )}
      </div>

      {/* Notification Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">{detail.title}</h3>
                  <p className="text-sm text-white/80 mt-1">{detail.time} • {detail.sender}</p>
                </div>
                <button
                  onClick={() => setDetail(null)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {detail.message}
              </p>
              
              {detail.activity && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-xl border border-gray-200 dark:border-slate-600">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    📅 Hoạt động liên quan
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {detail.activity.ten_hd}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    📍 {detail.activity.dia_diem || 'Chưa xác định'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    🕐 {detail.activity.ngay_bd ? new Date(detail.activity.ngay_bd).toLocaleString('vi-VN') : 'Chưa xác định'}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 font-semibold mt-2">
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
