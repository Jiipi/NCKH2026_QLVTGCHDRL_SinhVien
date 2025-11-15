import { useState, useCallback } from 'react';
import notificationsApi from '../services/notificationsApi';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    const result = await notificationsApi.getNotifications();
    if (result.success) {
      setNotifications(result.data);
      setUnreadCount(result.unreadCount);
    }
    setLoading(false);
  }, []);

  const openDetail = useCallback(async (id) => {
    const result = await notificationsApi.getNotificationDetail(id);
    if (result.success) {
      setDetail(result.data);
      // Optimistically mark as read on client
      const notif = notifications.find(n => n.id === id);
      if (notif && notif.unread) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  }, [notifications]);

  const markAllAsRead = useCallback(async () => {
    const result = await notificationsApi.markAllAsRead();
    if (result.success) {
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
      setUnreadCount(0);
    }
  }, []);

  const closeDetail = () => setDetail(null);

  return {
    notifications,
    unreadCount,
    loading,
    detail,
    loadNotifications,
    openDetail,
    closeDetail,
    markAllAsRead,
  };
}

