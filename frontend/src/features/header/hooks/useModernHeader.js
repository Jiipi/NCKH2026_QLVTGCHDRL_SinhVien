import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../../../shared/services/api/client';
import { useAppStore } from '../../../shared/store/useAppStore';
import { normalizeRole } from '../../../shared/lib/role';
import sessionStorageManager from '../../../shared/services/storage/sessionStorageManager';

function formatTimeAgo(timestamp) {
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
}

export function useModernHeader() {
  const navigate = useNavigate();
  const { user: userFromStore, role: roleFromStore, token: tokenFromStore } = useAppStore();

  const [profile, setProfile] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(() => {
    try {
      const tabId = sessionStorageManager.getTabId();
      const key = `theme_${tabId || 'default'}`;
      return sessionStorage.getItem(key) || 'light';
    } catch (_) {
      return 'light';
    }
  });
  const [detail, setDetail] = useState(null);

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const notifRef = useRef(null);

  const computedRole = roleFromStore || profile?.vai_tro?.ten_vt || profile?.vai_tro || userFromStore?.vai_tro || userFromStore?.role || '';
  const normalizedRole = String(normalizeRole(computedRole) || computedRole).toUpperCase();

  const contextFlags = {
    isAdmin: normalizedRole.includes('ADMIN') || normalizedRole.includes('QUAN TRI VIEN'),
    isTeacher: normalizedRole.includes('GIANG VIEN') || normalizedRole.includes('GIẢNG VIÊN'),
    isMonitor: normalizedRole.includes('LOP TRUONG') || normalizedRole.includes('LỚP TRƯỞNG'),
  };

  // Theme toggle effect
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      const tabId = sessionStorageManager.getTabId();
      const key = `theme_${tabId || 'default'}`;
      sessionStorage.setItem(key, theme);
    } catch (_) {}
  }, [theme]);

  // Close dropdowns on outside click or ESC
  useEffect(() => {
    function handleClickOutside(e) {
      if (notificationOpen && notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationOpen(false);
      }
      if (profileOpen && dropdownRef.current && !dropdownRef.current.contains(e.target) && buttonRef.current && !buttonRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    function handleEsc(e) {
      if (e.key === 'Escape' || e.key === 'Esc') {
        setNotificationOpen(false);
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [notificationOpen, profileOpen]);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await http.get('/notifications?limit=10');
      const data = response?.data?.data || response?.data || {};
      if (data.notifications && Array.isArray(data.notifications)) {
        setNotifications(data.notifications.map(n => ({ ...n, time: formatTimeAgo(n.time) })));
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotifications([]);
    }
  }, []);

  // Load profile and initial data
  useEffect(() => {
    const token = sessionStorageManager.getToken();
    if (token) {
      http.get('/users/profile').then(response => {
        const payload = response?.data?.data || response?.data || null;
        setProfile(payload);
        if (payload) {
          const { user, role } = sessionStorageManager.getSession() || {};
          if (user?.id !== payload.id || role !== (payload.vai_tro?.ten_vt || payload.role)) {
            sessionStorageManager.saveSession({ token, user: payload, role: payload.vai_tro?.ten_vt || payload.role });
          }
        }
      }).catch(() => {
        http.get('/auth/profile').then(response => {
          const payload = response?.data?.data || response?.data || null;
          setProfile(payload);
          if (payload) {
            const { user, role } = sessionStorageManager.getSession() || {};
            if (user?.id !== payload.id || role !== (payload.vai_tro?.ten_vt || payload.role)) {
              sessionStorageManager.saveSession({ token, user: payload, role: payload.vai_tro?.ten_vt || payload.role });
            }
          }
        }).catch(err => {
          console.error('Failed to load profile:', err?.response?.status);
          if (err?.response?.status === 401) {
            sessionStorageManager.clearSession();
            setProfile(null);
          } else if (err?.response?.status === 403) {
            const session = sessionStorageManager.getSession();
            if (session?.user) setProfile(session.user);
          }
        });
      });
      loadNotifications();
    } else {
      setProfile(null);
    }
  }, [loadNotifications]);

  // Sync with session storage changes
  useEffect(() => {
    const syncProfile = () => {
      const s = sessionStorageManager.getSession();
      setProfile(s?.user || null);
    };
    window.addEventListener('storage', syncProfile);
    window.addEventListener('profileUpdated', (e) => setProfile(e.detail.profile));
    return () => {
      window.removeEventListener('storage', syncProfile);
      window.removeEventListener('profileUpdated', (e) => setProfile(e.detail.profile));
    };
  }, []);

  const handleLogout = useCallback(() => {
    sessionStorageManager.clearSession();
    localStorage.removeItem('profile'); // Legacy cleanup
    localStorage.removeItem('tab_id_temp'); // Legacy cleanup
    setProfile(null);
    navigate('/login');
  }, [navigate]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAsRead = useCallback(async (notificationId) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, unread: false } : n));
    try { await http.put(`/notifications/${notificationId}/read`); } catch (e) { console.error(e); }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    try { await http.put('/notifications/mark-all-read'); } catch (e) { console.error(e); loadNotifications(); }
  }, [loadNotifications]);

  const openDetail = useCallback(async (id) => {
    try {
      const res = await http.get(`/notifications/${id}`);
      if (res?.data?.data) {
        setDetail({ ...res.data.data, time: formatTimeAgo(res.data.data.time) });
      }
      await markAsRead(id);
      setNotificationOpen(false);
    } catch (e) { console.error(e); }
  }, [markAsRead]);

  return {
    // State
    profile,
    profileOpen,
    notificationOpen,
    notifications,
    searchQuery,
    theme,
    detail,
    unreadCount,
    isAuthenticated: !!(tokenFromStore || sessionStorageManager.getToken()),

    // Context Flags
    ...contextFlags,

    // Refs
    dropdownRef,
    buttonRef,
    notifRef,

    // Setters & Handlers
    setProfileOpen,
    setNotificationOpen,
    setSearchQuery,
    setDetail,
    toggleTheme: () => setTheme(prev => prev === 'light' ? 'dark' : 'light'),
    handleLogout,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    openDetail,
    handleSearch: (e) => {
      e.preventDefault();
      if (searchQuery.trim()) console.log('Searching for:', searchQuery);
    }
  };
}

