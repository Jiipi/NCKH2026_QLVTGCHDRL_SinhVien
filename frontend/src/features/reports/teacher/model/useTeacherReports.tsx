/**
 * Teacher Reports Hook (Tier 2: Business Logic)
 * ===============================================
 * Single Responsibility: Teacher reports data fetching and state management
 */

import { useState, useEffect, useCallback } from 'react';
import useSemesterData, { getGlobalSemester, setGlobalSemester, useGlobalSemesterSync } from '../../../../shared/hooks/useSemesterData';
import reportsApi from '../../services/reportsApi';
import { getCurrentSemesterValue } from '../../../../shared/lib/semester';
import { downloadExcelWorkbook } from '../../../../shared/lib/exportExcel';

function normalizeTeacherStats(data: any) {
  const overview = data?.overview || {};
  const summary = data?.summary || {};

  return {
    ...data,
    totalActivities: data?.totalActivities ?? overview.totalActivities ?? summary.totalActivities ?? 0,
    totalStudents: data?.totalStudents ?? overview.totalStudents ?? summary.totalStudents ?? 0,
    participationRate: data?.participationRate ?? overview.participationRate ?? 0,
    averageScore: data?.averageScore ?? data?.avgPoints ?? overview.avgPoints ?? 0,
    totalRegistrations: data?.totalRegistrations ?? summary.totalRegistrations ?? 0,
    approvedRegistrations: data?.approvedRegistrations ?? summary.approvedRegistrations ?? 0,
    approvedActivities: data?.approvedActivities ?? summary.approvedActivities ?? 0
  };
}

export default function useTeacherReports() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('month');
  const [semester, setSemesterState] = useState(() => getGlobalSemester() || getCurrentSemesterValue(true));
  const [filterMode, setFilterMode] = useState('semester'); // 'semester' | 'dateRange'

  const { options: semesterOptions, currentSemester, isWritable } = useSemesterData(semester);
  useGlobalSemesterSync(semester, setSemesterState);

  const setSemester = useCallback((value: string) => {
    setSemesterState(value);
    setGlobalSemester(value);
  }, []);

  // Sync with backend current semester when available
  useEffect(() => {
    if (!getGlobalSemester() && currentSemester && semesterOptions.length > 0) {
      const inOptions = semesterOptions.some(opt => opt.value === currentSemester);
      if (inOptions && semester !== currentSemester) {
        setSemesterState(currentSemester);
      }
    }
  }, [currentSemester, semesterOptions, semester]);

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
      const data = await reportsApi.getTeacherStatistics(params);
      setStats(normalizeTeacherStats(data));
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
      if (format === 'excel') {
        const dateLabel = new Date().toLocaleDateString('vi-VN');
        downloadExcelWorkbook([
          {
            name: 'Tổng quan',
            rows: [
              ['Chỉ số', 'Giá trị'],
              ['Học kỳ', filterMode === 'semester' ? (semester || '') : 'Theo khoảng thời gian'],
              ['Ngày xuất', dateLabel],
              ['Tổng hoạt động', (stats as any)?.totalActivities || 0],
              ['Tổng sinh viên', (stats as any)?.totalStudents || 0],
              ['Tỷ lệ tham gia', `${Math.round(Number((stats as any)?.participationRate || 0))}%`],
              ['Điểm trung bình', Number((stats as any)?.averageScore || 0).toFixed(1)],
              ['Tổng đăng ký', (stats as any)?.totalRegistrations || 0],
              ['Đăng ký đã duyệt', (stats as any)?.approvedRegistrations || 0],
              ['Hoạt động đã duyệt', (stats as any)?.approvedActivities || 0],
            ],
          },
        ], `bao_cao_giang_vien_${new Date().toISOString().split('T')[0]}.xls`);
        return { success: true, message: 'Xuất báo cáo Excel thành công!' };
      }

      let params: { format: string; semester?: string; startDate?: string; endDate?: string } = { format };
      if (filterMode === 'semester') {
        params.semester = semester || undefined;
      } else {
        params = { format, ...getDateRangeParams() };
      }
      const data = await reportsApi.exportTeacherReport(params);

      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bao-cao-giang-vien-${new Date().toISOString().split('T')[0]}.pdf`;
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
  }, [filterMode, semester, getDateRangeParams, isWritable, stats]);

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

