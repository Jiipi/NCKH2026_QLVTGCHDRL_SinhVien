/**
 * Teacher Reports Hook (Tier 2: Business Logic)
 * ===============================================
 * Single Responsibility: Teacher reports data fetching and state management
 */

import { useState, useEffect, useCallback } from 'react';
import http from '../../../../shared/api/http';
import useSemesterData from '../../../../shared/hooks/useSemesterData';

const getCurrentSemesterValue = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  if (currentMonth >= 7 && currentMonth <= 11) return `hoc_ky_1-${currentYear}`;
  else if (currentMonth === 12) return `hoc_ky_2-${currentYear}`;
  else if (currentMonth >= 1 && currentMonth <= 4) return `hoc_ky_2-${currentYear - 1}`;
  else return `hoc_ky_1-${currentYear}`;
};

export default function useTeacherReports() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('month');
  const [semester, setSemester] = useState(getCurrentSemesterValue());
  const [filterMode, setFilterMode] = useState('semester'); // 'semester' | 'dateRange'

  const { options: semesterOptions } = useSemesterData();

  const getDateRangeParams = useCallback(() => {
    const now = new Date();
    let startDate, endDate;

    switch (dateRange) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }
    endDate = new Date();

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }, [dateRange]);

  const loadStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      let params = {};
      if (filterMode === 'semester') {
        params = { semester: semester || undefined };
      } else {
        params = getDateRangeParams();
      }
      const res = await http.get('/teacher/reports/statistics', { params });
      const data = res.data?.data || {};
      setStats(data);
    } catch (err) {
      console.error('Error loading statistics:', err);
      setError('Không thể tải thống kê');
    } finally {
      setLoading(false);
    }
  }, [filterMode, semester, getDateRangeParams]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const handleExport = useCallback(async (format = 'excel') => {
    try {
      let params = { format };
      if (filterMode === 'semester') {
        params.semester = semester || undefined;
      } else {
        params = { format, ...getDateRangeParams() };
      }
      const res = await http.get('/teacher/reports/export', {
        params,
        responseType: 'text'
      });
      
      const blob = new Blob([res.data], { 
        type: format === 'excel' ? 'text/csv' : 'text/csv'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bao-cao-giang-vien-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      return { success: true, message: 'Xuất báo cáo thành công!' };
    } catch (err) {
      console.error('Error exporting report:', err);
      return { 
        success: false, 
        message: 'Không thể xuất báo cáo: ' + (err.response?.data?.message || 'Lỗi không xác định')
      };
    }
  }, [filterMode, semester, getDateRangeParams]);

  return {
    stats,
    loading,
    error,
    dateRange,
    setDateRange,
    semester,
    setSemester,
    semesterOptions,
    filterMode,
    setFilterMode,
    loadStatistics,
    handleExport
  };
}

