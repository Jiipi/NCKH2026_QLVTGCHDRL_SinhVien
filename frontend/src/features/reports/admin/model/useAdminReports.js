/**
 * Admin Reports Hook (Tier 2: Business Logic)
 * ===========================================
 * Single Responsibility: Admin reports data fetching and state management
 */

import { useState, useEffect, useCallback } from 'react';
import http from '../../../../shared/api/http';

export default function useAdminReports() {
  const [semester, setSemester] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overview, setOverview] = useState({ byStatus: [], topActivities: [], dailyRegs: [] });

  const loadOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await http.get('/admin/reports/overview', { params: { semester: semester || undefined } });
      const data = res?.data?.data || { byStatus: [], topActivities: [], dailyRegs: [] };
      setOverview({
        byStatus: Array.isArray(data.byStatus) ? data.byStatus : [],
        topActivities: Array.isArray(data.topActivities) ? data.topActivities : [],
        dailyRegs: Array.isArray(data.dailyRegs) ? data.dailyRegs : []
      });
    } catch (e) {
      console.error('Error loading admin reports:', e);
      setError('Không thể tải báo cáo tổng quan');
    } finally {
      setLoading(false);
    }
  }, [semester]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const exportCsv = useCallback(async (kind = 'activities') => {
    try {
      const res = await http.get(`/admin/reports/export/${kind}`, {
        params: { semester: semester || undefined },
        responseType: 'arraybuffer'
      });
      // Ensure UTF-8 BOM for Excel compatibility
      const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
      const blob = new Blob([bom, res.data], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${kind}-${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return { success: true, message: 'Xuất file thành công!' };
    } catch (e) {
      console.error('Export error:', e);
      const msg = e?.response?.data?.message || e?.message || 'Không thể xuất file.';
      return { success: false, message: msg };
    }
  }, [semester]);

  const totalByStatus = useCallback((status) => {
    const item = overview.byStatus.find(s => s.trang_thai === status);
    return item?._count?._all || 0;
  }, [overview.byStatus]);

  const totalDailyRegs = useCallback(() => {
    return overview.dailyRegs?.reduce((s, d) => s + (d?._count?._all || 0), 0) || 0;
  }, [overview.dailyRegs]);

  return {
    semester,
    setSemester,
    loading,
    error,
    overview,
    loadOverview,
    exportCsv,
    totalByStatus,
    totalDailyRegs
  };
}

