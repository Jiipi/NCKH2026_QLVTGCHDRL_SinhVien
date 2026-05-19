/**
 * Monitor Reports Hook (Tier 2: Business Logic)
 * ==============================================
 * Single Responsibility: Reports data fetching and state management
 */

import { useState, useEffect, useCallback } from 'react';
import useSemesterData from '../../../../shared/hooks/useSemesterData';
import reportsApi from '../../services/reportsApi';
import { getCurrentSemesterValue } from '../../../../shared/lib/semester';
import { downloadExcelWorkbook } from '../../../../shared/lib/exportExcel';

export default function useMonitorReports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState('participation');
  const [error, setError] = useState('');
  const [semester, setSemester] = useState(() => getCurrentSemesterValue(true));

  const { options: semesterOptions, currentSemester, isWritable } = useSemesterData(semester);

  // Sync with backend current semester when available
  useEffect(() => {
    if (currentSemester && semesterOptions.length > 0) {
      const inOptions = semesterOptions.some(opt => opt.value === currentSemester);
      if (inOptions && semester !== currentSemester) {
        setSemester(currentSemester);
      }
    }
  }, [currentSemester, semesterOptions, semester]);

  const loadReportData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      console.log('📊 [ClassReports] Loading data for semester:', semester);
      
      const raw = await reportsApi.getClassReports(semester);
      console.log('📊 [ClassReports] Raw response:', raw);
      
      const data = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? { ...raw } : null;
      
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
        
        console.log('📊 [ClassReports] Processed data:', {
          overview: data.overview,
          monthlyActivitiesCount: data.monthlyActivities.length,
          pointsDistributionCount: data.pointsDistribution.length,
          attendanceRateCount: data.attendanceRate.length,
          activityTypesCount: data.activityTypes.length,
          topStudentsCount: data.topStudents.length
        });
      }
      setReportData(data);
    } catch (err) {
      console.error('❌ [ClassReports] Error loading report data:', err);
      const errorMsg = err.response?.data?.message || 'Không thể tải dữ liệu báo cáo';
      setError(errorMsg);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [semester]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  const downloadBlob = (blob, filename) => {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateReportHTML = useCallback(() => {
    return `
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><title>Báo cáo lớp</title>
      <style>body{font-family:Arial;padding:20px;}h1{color:#6366F1;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}</style>
      </head><body>
      <h1>BÁO CÁO THỐNG KÊ LỚP</h1>
      <p><strong>Học kỳ:</strong> ${semester}</p>
      <p><strong>Ngày xuất:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
      <h2>Tổng quan</h2>
      <ul>
        <li>Tổng sinh viên: ${reportData?.overview?.totalStudents || 0}</li>
        <li>Tổng hoạt động: ${reportData?.overview?.totalActivities || 0}</li>
        <li>Điểm trung bình: ${reportData?.overview?.avgPoints || 0}</li>
        <li>Tỷ lệ tham gia: ${reportData?.overview?.participationRate || 0}%</li>
      </ul>
      ${reportData?.topStudents?.length > 0 ? `
        <h2>Top sinh viên</h2>
        <table><tr><th>STT</th><th>Họ tên</th><th>MSSV</th><th>Điểm</th></tr>
        ${reportData.topStudents.map((s, i) => `<tr><td>${i+1}</td><td>${s.name}</td><td>${s.mssv}</td><td>${s.points}</td></tr>`).join('')}
        </table>` : ''}
      </body></html>
    `;
  }, [reportData, semester]);

  const handleExportExcel = useCallback(() => {
    if (!reportData) return;
    // Chỉ cho phép xuất file khi là học kỳ đang kích hoạt
    if (!isWritable) {
      alert('Chỉ có thể xuất báo cáo cho học kỳ đang kích hoạt');
      return;
    }
    const overview = reportData.overview || {};
    const topStudents = Array.isArray(reportData.topStudents) ? reportData.topStudents : [];
    downloadExcelWorkbook([
      {
        name: 'Tổng quan',
        rows: [
          ['Chỉ số', 'Giá trị'],
          ['Học kỳ', semester],
          ['Ngày xuất', new Date().toLocaleDateString('vi-VN')],
          ['Tổng sinh viên', overview.totalStudents || 0],
          ['Tổng hoạt động', overview.totalActivities || 0],
          ['Điểm TB', overview.avgPoints || 0],
          ['Tỷ lệ tham gia', `${overview.participationRate || 0}%`],
        ],
      },
      {
        name: 'Top sinh viên',
        rows: [
          ['STT', 'Họ tên', 'MSSV', 'Điểm RL', 'Hoạt động'],
          ...topStudents.map((student, index) => [
            index + 1,
            student.name || '',
            student.mssv || '',
            student.points || 0,
            student.activities || 0,
          ]),
        ],
      },
    ], `bao_cao_lop_${semester}_${new Date().toISOString().split('T')[0]}.xls`);
  }, [reportData, semester, isWritable]);

  const handleExportPDF = useCallback(() => {
    if (!reportData) return;
    // Chỉ cho phép xuất file khi là học kỳ đang kích hoạt
    if (!isWritable) {
      alert('Chỉ có thể xuất báo cáo cho học kỳ đang kích hoạt');
      return;
    }
    const html = generateReportHTML();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 250);
    }
  }, [reportData, generateReportHTML, isWritable]);

  const overview = reportData?.overview || {};
  const avgScore = Number(overview.avgPoints || 0);
  const avgScoreRounded = Number.isFinite(avgScore) ? Number(avgScore.toFixed(1)) : 0;

  const getScoreTheme = (s) => {
    if (s >= 90) return { gradient: 'from-violet-500 to-purple-600', label: 'Xuất sắc' };
    if (s >= 80) return { gradient: 'from-blue-500 to-indigo-600', label: 'Tốt' };
    if (s >= 65) return { gradient: 'from-emerald-500 to-green-600', label: 'Khá' };
    if (s >= 50) return { gradient: 'from-amber-400 to-orange-500', label: 'Trung bình' };
    return { gradient: 'from-rose-500 to-red-600', label: 'Yếu' };
  };

  return {
    reportData,
    loading,
    error,
    selectedChart,
    setSelectedChart,
    semester,
    setSemester,
    semesterOptions,
    loadReportData,
    handleExportExcel,
    handleExportPDF,
    overview,
    avgScoreRounded,
    scoreTheme: getScoreTheme(avgScore)
  };
}

