/**
 * Teacher Reports Hook (Tier 2: Business Logic)
 * ===============================================
 * Single Responsibility: Teacher reports data fetching and state management
 */

import { useState, useEffect, useCallback } from 'react';
import http from '../../../../shared/api/http';
import useSemesterData from '../../../../shared/hooks/useSemesterData';
import { getCurrentSemesterValue } from '../../../../shared/lib/semester';

export default function useTeacherReports() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('month');
  const [semester, setSemester] = useState(getCurrentSemesterValue());
  const [filterMode, setFilterMode] = useState('semester'); // 'semester' | 'dateRange'

  const { options: semesterOptions, isWritable } = useSemesterData(semester);

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
    // Chỉ cho phép xuất file khi là học kỳ đang kích hoạt (nếu filter theo semester)
    if (filterMode === 'semester' && !isWritable) {
      return { 
        success: false, 
        message: 'Chỉ có thể xuất báo cáo cho học kỳ đang kích hoạt'
      };
    }
    
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
  }, [filterMode, semester, getDateRangeParams, isWritable]);

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

