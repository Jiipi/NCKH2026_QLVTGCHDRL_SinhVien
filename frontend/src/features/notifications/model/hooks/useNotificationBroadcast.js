import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../../../../contexts/NotificationContext';
import notificationBroadcastApi from '../../services/notificationBroadcastApi';
import { mapNotificationHistory } from '../mappers/notification.mappers';

const DEFAULT_STATS = {
  total: 0,
  thisWeek: 0,
  classScope: 0,
  activityScope: 0,
};

const getCurrentUserId = () => {
  try {
    if (typeof window === 'undefined') return null;
    const token = window.localStorage.getItem('token');
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload?.sub || null;
  } catch (error) {
    console.warn('[useNotificationBroadcast] Cannot parse token', error);
    return null;
  }
};

const calcStats = (history, serverStats) => {
  if (serverStats) {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = history.filter(item => new Date(item.date) >= oneWeekAgo).length;
    return {
      total: serverStats.total ?? history.length,
      thisWeek,
      classScope: serverStats.classScope ?? history.filter(item => item.scope === 'class').length,
      activityScope: serverStats.activityScope ?? history.filter(item => item.scope === 'activity').length,
    };
  }

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return {
    total: history.length,
    thisWeek: history.filter(item => new Date(item.date) >= oneWeekAgo).length,
    classScope: history.filter(item => item.scope === 'class').length,
    activityScope: history.filter(item => item.scope === 'activity').length,
  };
};

export default function useNotificationBroadcast({ defaultScope = 'class', maxChars = 500 } = {}) {
  const { showSuccess, showError } = useNotification();
  const [form, setForm] = useState({
    title: '',
    message: '',
    scope: defaultScope,
    activityId: '',
  });
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState({ error: '', success: '' });
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    const result = await notificationBroadcastApi.fetchHistory();
    if (result.success) {
      const historyData = mapNotificationHistory(result.data?.history || []);
      setHistory(historyData);
      setStats(calcStats(historyData, result.data?.stats || null));
    }
    setLoadingHistory(false);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const setFormField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFeedback({ error: '', success: '' });
    setForm(prev => ({ title: '', message: '', scope: prev.scope, activityId: '' }));
  };

  const applyTemplate = (template) => {
    if (!template) return;
    setForm(prev => ({
      ...prev,
      title: template.title || prev.title,
      message: template.message || prev.message,
    }));
  };

  const toggleHistory = () => setShowHistory(prev => !prev);

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedNotification(null);
  };

  const openDetail = async (notification) => {
    if (!notification?.id) return;
    const result = await notificationBroadcastApi.fetchHistoryDetail(notification.id);
    if (result.success) {
      setSelectedNotification(result.data);
      setDetailOpen(true);
    } else {
      showError(result.error || 'Không thể tải chi tiết thông báo');
    }
  };

  const validateForm = () => {
    if (!form.title.trim() || !form.message.trim()) {
      return 'Vui lòng nhập tiêu đề và nội dung.';
    }
    if (form.scope === 'activity' && !form.activityId.trim()) {
      return 'Vui lòng nhập ID hoạt động khi gửi theo hoạt động.';
    }
    return null;
  };

  const submit = async (event) => {
    event?.preventDefault();
    setFeedback({ error: '', success: '' });
    const validationError = validateForm();
    if (validationError) {
      setFeedback({ error: validationError, success: '' });
      return;
    }

    const payload = {
      tieu_de: form.title.trim(),
      noi_dung: form.message.trim(),
      scope: form.scope,
      muc_do_uu_tien: 'trung_binh',
      phuong_thuc_gui: 'trong_he_thong',
    };

    if (form.scope === 'activity') {
      payload.activityId = form.activityId.trim();
    }

    const currentUserId = getCurrentUserId();
    if (currentUserId) {
      payload.nguoi_nhan_id = currentUserId;
    }

    setSending(true);
    try {
      const result = await notificationBroadcastApi.sendNotification(payload);
      if (!result.success) {
        setFeedback({ error: result.error || 'Không thể gửi thông báo', success: '' });
        showError(result.error || 'Không thể gửi thông báo');
        return;
      }
      setFeedback({ error: '', success: 'Đã gửi thông báo thành công!' });
      showSuccess('Đã gửi thông báo thành công! 🎉');
      resetForm();
      loadHistory();
    } catch (error) {
      console.error('[useNotificationBroadcast] submit error', error);
      setFeedback({ error: 'Không thể gửi thông báo. Vui lòng thử lại.', success: '' });
      showError('Không thể gửi thông báo');
    } finally {
      setSending(false);
    }
  };

  return {
    form,
    setFormField,
    resetForm,
    sending,
    feedback,
    stats,
    history,
    showHistory,
    toggleHistory,
    selectedNotification,
    detailOpen,
    openDetail,
    closeDetail,
    applyTemplate,
    submit,
    charCount: form.message.length,
    maxChars,
    loadingHistory,
  };
}

