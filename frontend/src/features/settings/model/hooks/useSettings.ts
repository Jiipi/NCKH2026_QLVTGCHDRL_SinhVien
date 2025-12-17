/**
 * useSettings Hook
 * Single Responsibility: Manage settings data and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../../../../shared/contexts/NotificationContext';
import settingsApi, { SystemSettings, SystemInfo } from '../../services/settingsApi';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string;
}

interface UseSettingsReturn {
  settings: SystemSettings;
  systemInfo: SystemInfo;
  loading: boolean;
  saving: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (newSettings: SystemSettings) => Promise<boolean>;
  clearCache: () => Promise<boolean>;
}

export function useSettings(): UseSettingsReturn {
  const { showSuccess, showError } = useNotification();
  
  const [settings, setSettings] = useState<SystemSettings>({});
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const loadSettings = useCallback(async (): Promise<void> => {
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

  const loadSystemInfo = useCallback(async (): Promise<void> => {
    try {
      const data = await settingsApi.getSystemInfo();
      setSystemInfo(data);
    } catch (err) {
      console.error('Load system info error:', err);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: SystemSettings): Promise<boolean> => {
    try {
      setSaving(true);
      await settingsApi.updateSettings(newSettings);
      showSuccess('Cập nhật cài đặt thành công');
      await loadSettings();
      return true;
    } catch (err) {
      console.error('Update settings error:', err);
      const axiosError = err as AxiosError<ApiErrorResponse>;
      showError(axiosError.response?.data?.message || 'Không thể cập nhật cài đặt');
      return false;
    } finally {
      setSaving(false);
    }
  }, [showSuccess, showError, loadSettings]);

  const clearCache = useCallback(async (): Promise<boolean> => {
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
