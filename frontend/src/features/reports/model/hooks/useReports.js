/**
 * useReports Hook
 * Single Responsibility: Manage reports data and operations
 */

import { useState, useCallback } from 'react';
import { useNotification } from '../../../../shared/contexts/NotificationContext';
import reportsApi from '../../services/reportsApi';

export function useReports(role = 'admin') {
  const { showError } = useNotification();
  
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadReports = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      let data;
      switch (role) {
        case 'teacher':
          data = await reportsApi.getTeacherReports(params);
          break;
        case 'monitor':
          data = await reportsApi.getMonitorReports(params);
          break;
        default:
          data = await reportsApi.getAdminReports(params);
      }
      setReports(data);
    } catch (err) {
      console.error('Load reports error:', err);
      showError('Không thể tải báo cáo');
    } finally {
      setLoading(false);
    }
  }, [role, showError]);

  const exportReport = useCallback(async (type, params = {}) => {
    try {
      setExporting(true);
      const blob = await reportsApi.exportReport(type, params);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report_${type}_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export report error:', err);
      showError('Không thể xuất báo cáo');
    } finally {
      setExporting(false);
    }
  }, [showError]);

  return {
    reports,
    loading,
    exporting,
    loadReports,
    exportReport
  };
}
