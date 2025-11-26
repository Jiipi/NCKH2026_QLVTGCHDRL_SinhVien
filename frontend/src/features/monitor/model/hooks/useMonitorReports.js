/**
 * Monitor Reports Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho reports lớp trưởng
 */

import { useState, useEffect, useCallback } from 'react';
import { monitorReportsApi } from '../../services/monitorReportsApi';
import useSemesterData from '../../../../shared/hooks/useSemesterData';

/**
 * Hook quản lý reports
 */
export function useMonitorReports() {
  const getCurrentSemesterValue = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    if (currentMonth >= 7 && currentMonth <= 11) return `hoc_ky_1-${currentYear}`;
    else if (currentMonth === 12) return `hoc_ky_2-${currentYear}`;
    else if (currentMonth >= 1 && currentMonth <= 4) return `hoc_ky_2-${currentYear - 1}`;
    else return `hoc_ky_1-${currentYear}`;
  };

  const [semester, setSemester] = useState(getCurrentSemesterValue());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChart, setSelectedChart] = useState('participation');
  const { options: semesterOptions } = useSemesterData();

  // Business logic: Load report data
  const loadReportData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await monitorReportsApi.list({ semester });
      if (result.success && result.data) {
        const data = (result.data && typeof result.data === 'object' && !Array.isArray(result.data)) 
          ? { ...result.data } 
          : null;
        
        if (data) {
          data.overview = data.overview || {
            totalStudents: 0,
            totalActivities: 0,
            avgPoints: 0,
            participationRate: 0
          };
          data.monthlyActivities = Array.isArray(data.monthlyActivities) ? data.monthlyActivities : [];
          data.pointsDistribution = Array.isArray(data.pointsDistribution) ? data.pointsDistribution : [];
          data.attendanceRate = Array.isArray(data.attendanceRate) ? data.attendanceRate : [];
          data.activityTypes = Array.isArray(data.activityTypes) ? data.activityTypes : [];
          data.topStudents = Array.isArray(data.topStudents) ? data.topStudents : [];
        }
        
        setReportData(data);
      } else {
        setError(result.error || 'Không thể tải dữ liệu báo cáo');
        setReportData(null);
      }
    } catch (err) {
      console.error('Error loading report data:', err);
      setError(err?.message || 'Không thể tải dữ liệu báo cáo');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [semester]);

  // Business logic: Export Excel
  const handleExportExcel = useCallback(() => {
    if (!reportData) return;
    try {
      const csv = generateCSV();
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `bao_cao_lop_${semester}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Export Excel failed', e);
      alert('Xuất Excel thất bại. Vui lòng thử lại.');
    }
  }, [reportData, semester]);

  // Business logic: Export PDF
  const handleExportPDF = useCallback(() => {
    if (!reportData) return;
    try {
      const html = generateReportHTML();
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 300);
      }
    } catch (e) {
      console.error('Export PDF failed', e);
      alert('Xuất PDF thất bại. Vui lòng thử lại.');
    }
  }, [reportData, semester]);

  // Business logic: Generate CSV
  const generateCSV = useCallback(() => {
    if (!reportData) return '';
    const safe = (v) => {
      if (v === null || v === undefined) return '';
      const s = String(v).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    };

    const lines = [];
    lines.push('BÁO CÁO THỐNG KÊ LỚP');
    lines.push('');
    lines.push(`Học kỳ:,${safe(semester)}`);
    lines.push(`Ngày xuất:,${safe(new Date().toLocaleDateString('vi-VN'))}`);
    lines.push('');
    lines.push('TỔNG QUAN');
    lines.push(`Tổng sinh viên,${safe(reportData.overview?.totalStudents || 0)}`);
    lines.push(`Tổng hoạt động,${safe(reportData.overview?.totalActivities || 0)}`);
    lines.push(`Điểm TB,${safe(reportData.overview?.avgPoints || 0)}`);
    lines.push(`Tỷ lệ tham gia,${safe(reportData.overview?.participationRate || 0)}%`);
    lines.push('');

    if (Array.isArray(reportData.activityTypes) && reportData.activityTypes.length) {
      lines.push('PHÂN LOẠI HOẠT ĐỘNG');
      lines.push('Loại,Số hoạt động,Điểm TB');
      reportData.activityTypes.forEach(t => {
        const count = Number(t.count || 0);
        const avg = count > 0 ? (Number(t.points || 0) / count).toFixed(1) : '0.0';
        lines.push(`${safe(t.name)},${count},${avg}`);
      });
      lines.push('');
    }

    if (Array.isArray(reportData.pointsDistribution) && reportData.pointsDistribution.length) {
      lines.push('PHÂN BỐ ĐIỂM RÈN LUYỆN');
      lines.push('Khoảng điểm,Số SV,Tỷ lệ (%)');
      reportData.pointsDistribution.forEach(d => {
        lines.push(`${safe(d.range)},${safe(d.count)},${safe(d.percentage)}`);
      });
      lines.push('');
    }

    if (Array.isArray(reportData.monthlyActivities) && reportData.monthlyActivities.length) {
      lines.push('HOẠT ĐỘNG THEO THÁNG');
      lines.push('Tháng,Số hoạt động,Số SV tham gia');
      reportData.monthlyActivities.forEach(m => {
        lines.push(`${safe(m.month)},${safe(m.activities)},${safe(m.participants)}`);
      });
      lines.push('');
    }

    if (Array.isArray(reportData.topStudents) && reportData.topStudents.length) {
      lines.push('TOP SINH VIÊN');
      lines.push('Hạng,Họ tên,MSSV,Điểm RL,Hoạt động');
      reportData.topStudents.forEach((s) => {
        lines.push(`${safe(s.rank || '')},${safe(s.name || '')},${safe(s.mssv || '')},${safe(s.points || 0)},${safe(s.activities || 0)}`);
      });
    }

    return lines.join('\n');
  }, [reportData, semester]);

  // Business logic: Generate HTML for PDF
  const generateReportHTML = useCallback(() => {
    if (!reportData) return '';
    const esc = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const overview = reportData?.overview || {};
    const activityTypes = Array.isArray(reportData?.activityTypes) ? reportData.activityTypes : [];
    const pointsDistribution = Array.isArray(reportData?.pointsDistribution) ? reportData.pointsDistribution : [];
    const monthlyActivities = Array.isArray(reportData?.monthlyActivities) ? reportData.monthlyActivities : [];
    const topStudents = Array.isArray(reportData?.topStudents) ? reportData.topStudents : [];

    const activityTypesRows = activityTypes.map(t => {
      const count = Number(t.count || 0);
      const avg = count > 0 ? (Number(t.points || 0) / count).toFixed(1) : '0.0';
      return `<tr><td>${esc(t.name)}</td><td>${count}</td><td>${avg}</td></tr>`;
    }).join('');

    const pointsRows = pointsDistribution.map(d => `<tr><td>${esc(d.range)}</td><td>${esc(d.count)}</td><td>${esc(d.percentage)}</td></tr>`).join('');
    const monthRows = monthlyActivities.map(m => `<tr><td>${esc(m.month)}</td><td>${esc(m.activities)}</td><td>${esc(m.participants)}</td></tr>`).join('');
    const topRows = topStudents.map(s => `<tr><td>${esc(s.rank)}</td><td>${esc(s.name)}</td><td>${esc(s.mssv)}</td><td>${esc(s.points)}</td><td>${esc(s.activities)}</td></tr>`).join('');

    return `
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><title>Báo cáo lớp</title>
      <style>
        body{font-family:Arial,Helvetica,sans-serif;padding:20px;color:#111827}
        h1{color:#4f46e5;margin:0 0 8px}
        h2{color:#374151;margin:24px 0 8px}
        .muted{color:#6b7280}
        table{width:100%;border-collapse:collapse;margin-top:8px}
        th,td{border:1px solid #e5e7eb;padding:8px;text-align:left;font-size:13px}
        th{background:#f9fafb}
        .section{margin-top:18px}
      </style>
      </head><body>
      <h1>BÁO CÁO THỐNG KÊ LỚP</h1>
      <div class="muted">Học kỳ: ${esc(semester)} • Ngày xuất: ${esc(new Date().toLocaleDateString('vi-VN'))}</div>

      <div class="section">
        <h2>Tổng quan</h2>
        <table><tbody>
          <tr><th>Tổng sinh viên</th><td>${overview.totalStudents || 0}</td></tr>
          <tr><th>Tổng hoạt động</th><td>${overview.totalActivities || 0}</td></tr>
          <tr><th>Điểm trung bình</th><td>${overview.avgPoints || 0}</td></tr>
          <tr><th>Tỷ lệ tham gia</th><td>${overview.participationRate || 0}%</td></tr>
        </tbody></table>
      </div>

      ${activityTypes.length ? `
      <div class="section">
        <h2>Phân loại hoạt động</h2>
        <table><thead><tr><th>Loại</th><th>Số hoạt động</th><th>Điểm TB</th></tr></thead><tbody>
          ${activityTypesRows}
        </tbody></table>
      </div>` : ''}

      ${pointsDistribution.length ? `
      <div class="section">
        <h2>Phân bố điểm rèn luyện</h2>
        <table><thead><tr><th>Khoảng điểm</th><th>Số SV</th><th>Tỷ lệ (%)</th></tr></thead><tbody>
          ${pointsRows}
        </tbody></table>
      </div>` : ''}

      ${monthlyActivities.length ? `
      <div class="section">
        <h2>Hoạt động theo tháng</h2>
        <table><thead><tr><th>Tháng</th><th>Số hoạt động</th><th>Số SV tham gia</th></tr></thead><tbody>
          ${monthRows}
        </tbody></table>
      </div>` : ''}

      ${topStudents.length ? `
      <div class="section">
        <h2>Top sinh viên</h2>
        <table><thead><tr><th>Hạng</th><th>Họ tên</th><th>MSSV</th><th>Điểm RL</th><th>Hoạt động</th></tr></thead><tbody>
          ${topRows}
        </tbody></table>
      </div>` : ''}

      </body></html>
    `;
  }, [reportData, semester]);

  // Effects
  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  // Helper: Get score theme
  const getScoreTheme = useCallback((score) => {
    if (score >= 90) return { gradient: 'from-violet-500 to-purple-600', label: 'Xuất sắc' };
    if (score >= 80) return { gradient: 'from-blue-500 to-indigo-600', label: 'Tốt' };
    if (score >= 65) return { gradient: 'from-emerald-500 to-green-600', label: 'Khá' };
    if (score >= 50) return { gradient: 'from-amber-400 to-orange-500', label: 'Trung bình' };
    return { gradient: 'from-rose-500 to-red-600', label: 'Yếu' };
  }, []);

  return {
    // Data
    reportData,
    
    // State
    loading,
    error,
    semester,
    setSemester,
    semesterOptions,
    selectedChart,
    setSelectedChart,
    
    // Helpers
    getScoreTheme,
    
    // Actions
    loadReportData,
    handleExportExcel,
    handleExportPDF
  };
}
