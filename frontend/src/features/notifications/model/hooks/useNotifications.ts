import { useState, useCallback } from 'react';
import notificationsApi from '../../services/notificationsApi';

interface NotificationItem {
  id: string;
  title?: string;
  message?: string;
  time?: string;
  type?: string;
  unread?: boolean;
  [key: string]: unknown;
}

interface NotificationDetail {
  id: string;
  title?: string;
  message?: string;
  time?: string;
  sender?: string;
  activity?: {
    ten_hd?: string;
    dia_diem?: string;
    ngay_bd?: string;
    diem_rl?: number;
  };
  [key: string]: unknown;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<NotificationDetail | null>(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    const result = await notificationsApi.getNotifications();
    if (result.success) {
      setNotifications(result.data as NotificationItem[]);
      setUnreadCount(result.unreadCount);
    }
    setLoading(false);
  }, []);

  const openDetail = useCallback(async (id: string) => {
    const result = await notificationsApi.getNotificationDetail(id);
    if (result.success) {
      setDetail(result.data as NotificationDetail);
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

