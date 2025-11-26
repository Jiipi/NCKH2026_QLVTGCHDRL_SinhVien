/**
 * useSettings Hook
 * Single Responsibility: Manage settings data and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../../../../shared/contexts/NotificationContext';
import settingsApi from '../../services/settingsApi';

export function useSettings() {
  const { showSuccess, showError } = useNotification();
  
  const [settings, setSettings] = useState({});
  const [systemInfo, setSystemInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await settingsApi.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Load settings error:', err);
      showError('Không thể tải cài đặt');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const loadSystemInfo = useCallback(async () => {
    try {
      const data = await settingsApi.getSystemInfo();
      setSystemInfo(data);
    } catch (err) {
      console.error('Load system info error:', err);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings) => {
    try {
      setSaving(true);
      await settingsApi.updateSettings(newSettings);
      showSuccess('Cập nhật cài đặt thành công');
      await loadSettings();
      return true;
    } catch (err) {
      console.error('Update settings error:', err);
      showError(err.response?.data?.message || 'Không thể cập nhật cài đặt');
      return false;
    } finally {
      setSaving(false);
    }
  }, [showSuccess, showError, loadSettings]);

  const clearCache = useCallback(async () => {
    try {
      setSaving(true);
      await settingsApi.clearCache();
      showSuccess('Đã xóa cache');
      return true;
    } catch (err) {
      console.error('Clear cache error:', err);
      showError('Không thể xóa cache');
      return false;
    } finally {
      setSaving(false);
    }
  }, [showSuccess, showError]);

  useEffect(() => {
    loadSettings();
    loadSystemInfo();
  }, [loadSettings, loadSystemInfo]);

  return {
    settings,
    systemInfo,
    loading,
    saving,
    loadSettings,
    updateSettings,
    clearCache
  };
}
