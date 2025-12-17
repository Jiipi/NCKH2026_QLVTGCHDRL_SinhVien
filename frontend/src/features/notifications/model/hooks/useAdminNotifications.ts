import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../../../../shared/contexts/NotificationContext';
import adminNotificationsApi from '../../services/adminNotificationsApi';
import { mapNotificationHistory, NotificationHistoryItem, RawNotificationHistoryItem } from '../mappers/notification.mappers';

interface NotificationForm {
  title: string;
  message: string;
  scope: string;
  targetRole: string;
  targetClass: string;
  targetDepartment: string;
  activityId: string;
}

interface NotificationStats {
  total: number;
  thisWeek: number;
  systemScope: number;
  roleScope: number;
  classScope: number;
}

interface StatsData {
  total?: number;
  thisWeek?: number;
  systemScope?: number;
  roleScope?: number;
  classScope?: number;
}

interface BroadcastPayload {
  tieu_de: string;
  noi_dung: string;
  scope: string;
  muc_do_uu_tien: string;
  phuong_thuc_gui: string;
  targetRole?: string;
  targetClass?: string;
  targetDepartment?: string;
  activityId?: string;
}

interface NotificationTemplate {
  title?: string;
  message?: string;
}

const INITIAL_FORM: NotificationForm = {
  title: '',
  message: '',
  scope: 'system',
  targetRole: '',
  targetClass: '',
  targetDepartment: '',
  activityId: '',
};

const DEFAULT_STATS: NotificationStats = {
  total: 0,
  thisWeek: 0,
  systemScope: 0,
  roleScope: 0,
  classScope: 0,
};

interface ClassItem {
  id: string;
  ten_lop?: string;
  khoa?: string;
  soLuongSinhVien?: number;
  [key: string]: unknown;
}

interface ActivityItem {
  id: string;
  ten_hoat_dong?: string;
  ten_hd?: string;
  [key: string]: unknown;
}

export default function useAdminNotifications() {
  const { showSuccess, showError } = useNotification();
  const [form, setForm] = useState<NotificationForm>(INITIAL_FORM);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState({ error: '', success: '' });
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState<NotificationStats>(DEFAULT_STATS);
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationHistoryItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadClasses = useCallback(async () => {
    const result = await adminNotificationsApi.fetchClasses();
    if (result.success) {
      setClasses(result.data as ClassItem[]);
    }
  }, []);

  const loadActivities = useCallback(async () => {
    const result = await adminNotificationsApi.fetchActivities();
    if (result.success) {
      setActivities(result.data as ActivityItem[]);
    }
  }, []);

  const loadStats = useCallback(async () => {
    const result = await adminNotificationsApi.fetchStats();
    if (result.success) {
      const data = result.data as StatsData;
      setStats({
        total: (data.total as number) || 0,
        thisWeek: (data.thisWeek as number) || 0,
        systemScope: (data.systemScope as number) || 0,
        roleScope: (data.roleScope as number) || 0,
        classScope: (data.classScope as number) || 0,
      });
    }
  }, []);

  const loadHistory = useCallback(async () => {
    const result = await adminNotificationsApi.fetchHistory();
    if (result.success) {
      setHistory(mapNotificationHistory(result.data as RawNotificationHistoryItem[]));
    }
  }, []);

  useEffect(() => {
    loadClasses();
    loadActivities();
    loadStats();
    loadHistory();
  }, [loadClasses, loadActivities, loadStats, loadHistory]);

  const setFormField = (field: keyof NotificationForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleScopeChange = (scope: string) => {
    setForm(prev => ({
      ...prev,
      scope,
      targetRole: '',
      targetClass: '',
      targetDepartment: '',
      activityId: '',
    }));
  };

  const resetForm = () => {
    setFeedback({ error: '', success: '' });
    setForm(prev => ({ ...INITIAL_FORM, scope: prev.scope }));
  };

  const applyTemplate = (template: NotificationTemplate | null) => {
    if (!template) return;
    setForm(prev => ({
      ...prev,
      title: template.title || prev.title,
      message: template.message || prev.message,
    }));
  };

  const toggleHistory = () => setShowHistory(prev => !prev);

  const openDetail = (notification: NotificationHistoryItem) => {
    setSelectedNotification(notification);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedNotification(null);
  };

  const validateForm = () => {
    if (!form.title.trim() || !form.message.trim()) {
      return 'Vui lòng nhập tiêu đề và nội dung.';
    }
    if (form.scope === 'role' && !form.targetRole) {
      return 'Vui lòng chọn vai trò khi gửi theo phạm vi vai trò.';
    }
    if (form.scope === 'class' && !form.targetClass) {
      return 'Vui lòng chọn lớp khi gửi theo phạm vi lớp.';
    }
    if (form.scope === 'department' && !form.targetDepartment.trim()) {
      return 'Vui lòng nhập tên khoa khi gửi theo khoa.';
    }
    if (form.scope === 'activity' && !form.activityId) {
      return 'Vui lòng chọn hoạt động khi gửi theo hoạt động.';
    }
    return null;
  };

  const submit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    setFeedback({ error: '', success: '' });
    const validationError = validateForm();
    if (validationError) {
      setFeedback({ error: validationError, success: '' });
      return;
    }

    const payload: BroadcastPayload = {
      tieu_de: form.title.trim(),
      noi_dung: form.message.trim(),
      scope: form.scope,
      muc_do_uu_tien: 'cao',
      phuong_thuc_gui: 'trong_he_thong',
    };
    if (form.scope === 'role') payload.targetRole = form.targetRole;
    if (form.scope === 'class') payload.targetClass = form.targetClass;
    if (form.scope === 'department') payload.targetDepartment = form.targetDepartment.trim();
    if (form.scope === 'activity') payload.activityId = form.activityId;

    setSending(true);
    try {
      const result = await adminNotificationsApi.sendBroadcast(payload);
      if (!result.success && 'error' in result) {
        setFeedback({ error: result.error || 'Không thể gửi thông báo', success: '' });
        showError(result.error || 'Không thể gửi thông báo');
        return;
      }
      const count = result.data?.count || 0;
      const successMsg = `Đã gửi thông báo tới ${count} người nhận`;
      setFeedback({ error: '', success: successMsg });
      showSuccess(`${successMsg}!`);
      resetForm();
      loadStats();
      loadHistory();
    } catch (error) {
      console.error('[AdminNotifications] submit error', error);
      setFeedback({ error: 'Không thể gửi thông báo. Vui lòng thử lại.', success: '' });
      showError('Không thể gửi thông báo');
    } finally {
      setSending(false);
    }
  };

  return {
    form,
    setFormField,
    handleScopeChange,
    resetForm,
    sending,
    feedback,
    stats,
    classes,
    activities,
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
    maxChars: 1000,
  };
}

