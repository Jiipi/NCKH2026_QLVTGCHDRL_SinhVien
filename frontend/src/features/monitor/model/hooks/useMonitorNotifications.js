/**
 * Monitor Notifications Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho notifications lớp trưởng
 */

import { useState, useEffect, useCallback } from 'react';
import { monitorNotificationsApi } from '../../services/monitorNotificationsApi';
import { monitorActivityOversightApi } from '../../services/monitorActivityOversightApi';
import useSemesterData from '../../../../shared/hooks/useSemesterData';

/**
 * Hook quản lý notifications
 */
export function useMonitorNotifications() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [scope, setScope] = useState('class');
  const [activityId, setActivityId] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sentHistory, setSentHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [stats, setStats] = useState({ total: 0, classScope: 0, activityScope: 0 });
  const [semester, setSemester] = useState(() => {
    try {
      return sessionStorage.getItem('current_semester') || '';
    } catch (_) {
      return '';
    }
  });
  const { options: semesterOptions, currentSemester } = useSemesterData(semester);
  const [activityOptions, setActivityOptions] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const templates = [
    { id: 1, name: 'Thông báo hoạt động mới', title: 'Hoạt động mới: [Tên hoạt động]', message: 'Lớp có hoạt động mới. Mời các bạn đăng ký tham gia trước ngày [Hạn].' },
    { id: 2, name: 'Nhắc nhở đăng ký', title: 'Nhắc nhở: Sắp hết hạn đăng ký', message: 'Các hoạt động sau sắp hết hạn đăng ký. Vui lòng đăng ký sớm để không bỏ lỡ.' },
    { id: 3, name: 'Thông báo kết quả', title: 'Thông báo kết quả tham gia', message: 'Kết quả tham gia hoạt động [Tên] đã được công bố. Vui lòng kiểm tra.' },
    { id: 4, name: 'Thông báo quan trọng', title: 'Thông báo quan trọng từ lớp trưởng', message: 'Lớp có thông báo quan trọng. Vui lòng đọc kỹ và thực hiện đầy đủ.' }
  ];

  // Business logic: Load sent history
  const loadSentHistory = useCallback(async () => {
    try {
      const result = await monitorNotificationsApi.getSentHistory();
      if (result.success && result.data) {
        const data = result.data;
        if (data.history && Array.isArray(data.history)) {
          setSentHistory(data.history);
          const classCount = data.history.filter(item => item.scope === 'class').length;
          const activityCount = data.history.filter(item => item.scope === 'activity').length;
          setStats({
            total: data.history.length,
            classScope: classCount,
            activityScope: activityCount
          });
        }
      }
    } catch (err) {
      console.error('Error loading sent history:', err);
    }
  }, []);

  // Business logic: Load activities for semester
  const loadActivitiesForSemester = useCallback(async (semesterValue) => {
    if (!semesterValue) {
      setActivityOptions([]);
      return;
    }
    try {
      setActivityLoading(true);
      const result = await monitorActivityOversightApi.getAvailableActivities({ semester: semesterValue });
      if (result.success && result.data) {
        const items = result.data.items || [];
        const options = items.map(a => ({ value: a.id, label: a.ten_hd || a.name }));
        setActivityOptions(options);
      } else {
        setActivityOptions([]);
      }
    } catch (err) {
      console.error('Error loading activities for semester:', err);
      setActivityOptions([]);
    } finally {
      setActivityLoading(false);
    }
  }, []);

  // Business logic: Handle notification click
  const handleNotificationClick = useCallback(async (notification) => {
    try {
      const result = await monitorNotificationsApi.getSentDetail(notification.id);
      if (result.success) {
        setSelectedNotification(result.data);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error('Error loading notification detail:', err);
    }
  }, []);

  // Business logic: Send notification
  const handleSend = useCallback(async () => {
    if (!title || !message) {
      setError('Vui lòng nhập tiêu đề và nội dung');
      return { success: false, error: 'Vui lòng nhập tiêu đề và nội dung' };
    }
    if (scope === 'activity' && !semester) {
      setError('Vui lòng chọn học kỳ khi gửi theo hoạt động');
      return { success: false, error: 'Vui lòng chọn học kỳ khi gửi theo hoạt động' };
    }
    if (scope === 'activity' && !activityId) {
      setError('Vui lòng chọn hoạt động trong học kỳ đã chọn');
      return { success: false, error: 'Vui lòng chọn hoạt động trong học kỳ đã chọn' };
    }

    try {
      setSending(true);
      setError('');
      setSuccess('');

      // Get current user ID from token
      let currentUserId = '';
      try {
        const t = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
        if (t && t.split('.').length === 3) {
          const payloadPart = JSON.parse(atob(t.split('.')[1]));
          if (payloadPart?.sub) currentUserId = payloadPart.sub;
        }
      } catch (_) {}

      const payload = {
        tieu_de: title,
        noi_dung: message,
        nguoi_nhan_id: currentUserId,
        scope,
        activityId: scope === 'activity' ? activityId : undefined,
        muc_do_uu_tien: 'trung_binh',
        phuong_thuc_gui: 'trong_he_thong'
      };

      const result = await monitorNotificationsApi.send(payload);
      if (result.success) {
        setSuccess('Đã gửi thông báo thành công! 🎉');
        setTitle('');
        setMessage('');
        setActivityId('');
        await loadSentHistory();
        return { success: true };
      } else {
        setError(result.error || 'Không thể gửi thông báo');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || 'Không thể gửi thông báo';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setSending(false);
    }
  }, [title, message, scope, semester, activityId, loadSentHistory]);

  // Business logic: Apply template
  const applyTemplate = useCallback((template) => {
    setTitle(template.title);
    setMessage(template.message);
  }, []);

  // Effects
  useEffect(() => {
    loadSentHistory();
  }, [loadSentHistory]);

  useEffect(() => {
    if (currentSemester && currentSemester !== semester) {
      setSemester(currentSemester);
    }
  }, [currentSemester, semester]);

  useEffect(() => {
    if (semester) {
      try {
        sessionStorage.setItem('current_semester', semester);
      } catch (_) {}
    }
  }, [semester]);

  useEffect(() => {
    if (scope === 'activity' && semester) {
      loadActivitiesForSemester(semester);
    } else {
      setActivityOptions([]);
    }
  }, [scope, semester, loadActivitiesForSemester]);

  return {
    // Form state
    title,
    setTitle,
    message,
    setMessage,
    scope,
    setScope,
    activityId,
    setActivityId,
    semester,
    setSemester,
    semesterOptions,
    activityOptions,
    activityLoading,

    // UI state
    sending,
    error,
    success,
    setError,
    setSuccess,
    sentHistory,
    showHistory,
    setShowHistory,
    selectedNotification,
    setSelectedNotification,
    showDetailModal,
    setShowDetailModal,
    stats,

    // Templates
    templates,
    applyTemplate,

    // Actions
    handleSend,
    handleNotificationClick,
    loadSentHistory,
    charCount: message.length,
    maxChars: 500
  };
}

