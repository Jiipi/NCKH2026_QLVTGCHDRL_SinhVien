import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, Area } from 'recharts';
import { TrendingUp, Users, Calendar, Award, Download, RefreshCw, Filter, BarChart3, FileText, AlertCircle, Sparkles, Target, Activity, Trophy, Star, CheckCircle2, XCircle, Eye } from 'lucide-react';
import http from '../../../shared/api/http';
import { useSemesterData } from '../../../shared/hooks';

export default function TeacherReportsPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState('participation');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'detailed'

  // Determine current semester for default value
  const getCurrentSemesterValue = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    if (currentMonth >= 7 && currentMonth <= 11) {
      return `hoc_ky_1-${currentYear}`;
    } else if (currentMonth === 12) {
      return `hoc_ky_2-${currentYear}`;
    } else if (currentMonth >= 1 && currentMonth <= 4) {
      return `hoc_ky_2-${currentYear - 1}`;
    } else {
      return `hoc_ky_1-${currentYear}`; // Default for break months
    }
  };
  
  const [semester, setSemester] = useState(getCurrentSemesterValue());

  const { options: semesterOptions } = useSemesterData();

  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  useEffect(() => {
    loadReportData();
  }, [semester]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('📊 [TeacherReports] Loading data for semester:', semester);
      
      // Normalize semester value to semesterId format (1-2025 or 2-2025)
      const toSemesterId = (val) => {
        if (!val) return undefined;
        const m = String(val).match(/hoc_ky_(1|2)-(\d{4})/);
        return m ? `${m[1]}-${m[2]}` : val;
      };
      
      const response = await http.get('/core/teachers/reports/statistics', { 
        params: { semesterId: toSemesterId(semester) } 
      });
      const raw = response?.data?.data;
      console.log('📊 [TeacherReports] Raw response:', raw);
      
      // Backend now returns full data structure with chart arrays
      const data = {
        overview: raw?.overview || {
          totalStudents: 0,
          totalActivities: 0,
          avgPoints: 0,
          participationRate: 0
        },
        monthlyActivities: Array.isArray(raw?.monthlyActivities) ? raw.monthlyActivities : [],
        pointsDistribution: Array.isArray(raw?.pointsDistribution) ? raw.pointsDistribution : [],
        attendanceRate: Array.isArray(raw?.attendanceRate) ? raw.attendanceRate : [],
        activityTypes: Array.isArray(raw?.activityTypes) ? raw.activityTypes : [],
        topStudents: Array.isArray(raw?.topStudents) ? raw.topStudents : [],
        // Store detailed stats per class for detailed report tab
        classNames: Array.isArray(raw?.classNames) ? raw.classNames : [],
        classStats: Array.isArray(raw?.stats) ? raw.stats : []
      };
      
      console.log('📊 [TeacherReports] Processed data:', {
        overview: data.overview,
        monthlyActivitiesCount: data.monthlyActivities.length,
        pointsDistributionCount: data.pointsDistribution.length,
        activityTypesCount: data.activityTypes.length,
        topStudentsCount: data.topStudents.length,
        classNamesCount: data.classNames.length
      });
      
      setReportData(data);
    } catch (err) {
      console.error('❌ [TeacherReports] Error loading report data:', err);
      const errorMsg = err.response?.data?.message || 'Không thể tải dữ liệu báo cáo';
      setError(errorMsg);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadBlob = (blob, filename) => {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    if (!reportData) return;
    try {
      const csv = generateCSV();
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      downloadBlob(blob, `bao_cao_giang_vien_${semester}_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (e) {
      console.error('Export Excel failed', e);
      alert('Xuất Excel thất bại. Vui lòng thử lại.');
    }
  };

  const handleExportPDF = () => {
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
  };

  const generateCSV = () => {
    if (!reportData) return '';
    const safe = (v) => {
      if (v === null || v === undefined) return '';
      const s = String(v).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    };

    const lines = [];
    lines.push('BÁO CÁO THỐNG KÊ GIẢNG VIÊN');
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
    
    // Add detailed report by class
    if (reportData.classNames && reportData.classNames.length > 0) {
      lines.push('BÁO CÁO CHI TIẾT THEO LỚP');
      lines.push('Lớp,Sĩ số,Tổng HĐ,HĐ đã duyệt,ĐK đã duyệt,Tỷ lệ tham gia (%)');
      
      reportData.classNames.forEach((className, index) => {
        const stat = reportData.classStats[index] || {};
        const participationRate = stat.totalStudents > 0 
          ? Math.round((stat.approvedRegistrations / stat.totalStudents) * 100) 
          : 0;
        
        lines.push([
          safe(className),
          safe(stat.totalStudents || 0),
          safe(stat.totalActivities || 0),
          safe(stat.approvedActivities || 0),
          safe(stat.approvedRegistrations || 0),
          safe(participationRate)
        ].join(','));
      });
      
      // Add total row
      const totalStudents = reportData.classStats.reduce((sum, s) => sum + (s.totalStudents || 0), 0);
      const totalActivities = reportData.classStats.reduce((sum, s) => sum + (s.totalActivities || 0), 0);
      const totalApprovedActivities = reportData.classStats.reduce((sum, s) => sum + (s.approvedActivities || 0), 0);
      const totalApprovedRegistrations = reportData.classStats.reduce((sum, s) => sum + (s.approvedRegistrations || 0), 0);
      const overallParticipationRate = totalStudents > 0 
        ? Math.round((totalApprovedRegistrations / totalStudents) * 100) 
        : 0;
      
      lines.push([
        'TỔNG CỘNG',
        safe(totalStudents),
        safe(totalActivities),
        safe(totalApprovedActivities),
        safe(totalApprovedRegistrations),
        safe(overallParticipationRate)
      ].join(','));
    }
    
    return lines.join('\n');
  };

  const generateReportHTML = () => {
    const esc = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const overview = reportData?.overview || {};
    const classNames = reportData?.classNames || [];
    const classStats = reportData?.classStats || [];

    return `
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><title>Báo cáo giảng viên</title>
      <style>
        body{font-family:Arial,Helvetica,sans-serif;padding:20px;color:#111827}
        h1{color:#4f46e5;margin:0 0 8px}
        h2{color:#374151;margin:24px 0 8px}
        .muted{color:#6b7280}
        table{width:100%;border-collapse:collapse;margin-top:8px}
        th,td{border:1px solid #e5e7eb;padding:8px;text-align:left;font-size:13px}
        th{background:#f9fafb}
        .section{margin-top:18px}
        .text-center{text-align:center}
        .text-right{text-align:right}
        .font-bold{font-weight:700}
      </style>
      </head><body>
      <h1>BÁO CÁO THỐNG KÊ GIẢNG VIÊN</h1>
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

      ${classNames.length > 0 ? `
      <div class="section">
        <h2>Báo cáo chi tiết theo lớp</h2>
        <table>
          <thead>
            <tr>
              <th>Lớp</th>
              <th class="text-center">Sĩ số</th>
              <th class="text-center">Tổng HĐ</th>
              <th class="text-center">HĐ đã duyệt</th>
              <th class="text-center">ĐK đã duyệt</th>
              <th class="text-center">Tỷ lệ tham gia</th>
            </tr>
          </thead>
          <tbody>
            ${classNames.map((className, index) => {
              const stat = classStats[index] || {};
              const participationRate = stat.totalStudents > 0 
                ? Math.round((stat.approvedRegistrations / stat.totalStudents) * 100) 
                : 0;
              return `
                <tr>
                  <td>${esc(className)}</td>
                  <td class="text-center">${stat.totalStudents || 0}</td>
                  <td class="text-center">${stat.totalActivities || 0}</td>
                  <td class="text-center">${stat.approvedActivities || 0}</td>
                  <td class="text-center">${stat.approvedRegistrations || 0}</td>
                  <td class="text-center">${participationRate}%</td>
                </tr>
              `;
            }).join('')}
            <tr class="font-bold">
              <td>TỔNG CỘNG</td>
              <td class="text-center">${classStats.reduce((sum, s) => sum + (s.totalStudents || 0), 0)}</td>
              <td class="text-center">${classStats.reduce((sum, s) => sum + (s.totalActivities || 0), 0)}</td>
              <td class="text-center">${classStats.reduce((sum, s) => sum + (s.approvedActivities || 0), 0)}</td>
              <td class="text-center">${classStats.reduce((sum, s) => sum + (s.approvedRegistrations || 0), 0)}</td>
              <td class="text-center">${(() => {
                const totalStudents = classStats.reduce((sum, s) => sum + (s.totalStudents || 0), 0);
                const totalApproved = classStats.reduce((sum, s) => sum + (s.approvedRegistrations || 0), 0);
                return totalStudents > 0 ? Math.round((totalApproved / totalStudents) * 100) : 0;
              })()}%</td>
            </tr>
          </tbody>
        </table>
      </div>
      ` : ''}

      </body></html>
    `;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
        <div className="flex justify-center items-center h-96">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent absolute top-0 left-0"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
        <div className="max-w-2xl mx-auto mt-20">
          <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-red-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-2xl">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Không thể tải báo cáo</h2>
                <p className="text-gray-600 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={loadReportData}
              className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-5 w-5" />
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const overview = reportData?.overview || {};
  const avgScore = Number(overview.avgPoints || 0);

  return (
    <div className="space-y-6">
      {/* Ultra Modern Header */}
      <div className="relative min-h-[280px]">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            animation: 'grid-move 20s linear infinite'
          }}></div>
        </div>

        {/* Floating Geometric Shapes */}
        <div className="absolute top-10 right-20 w-20 h-20 border-4 border-white/30 rotate-45 animate-bounce-slow"></div>
        <div className="absolute bottom-10 left-16 w-16 h-16 bg-yellow-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-12 h-12 border-4 border-pink-300/40 rounded-full animate-spin-slow"></div>

        {/* Main Content Container with Glassmorphism */}
        <div className="relative z-10 p-8">
          <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-2xl p-8 shadow-2xl">
            
            {/* Top Bar with Badge */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-pink-400 blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative bg-black text-pink-400 px-4 py-2 font-black text-sm tracking-wider transform -rotate-2 shadow-lg border-2 border-pink-400">
                    📊 BÁO CÁO
                  </div>
                </div>
                <div className="h-8 w-1 bg-white/40"></div>
                <div className="text-white/90 font-bold text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    GIẢNG VIÊN
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 font-semibold text-sm"
                >
                  <Download className="h-4 w-4" />
                  Excel
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-white/90 text-purple-600 rounded-xl hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 font-semibold text-sm"
                >
                  <FileText className="h-4 w-4" />
                  PDF
                </button>
              </div>
            </div>

            {/* Main Title Section */}
            <div className="mb-8">
              <h1 className="text-6xl lg:text-7xl font-black text-white mb-4 leading-none tracking-tight">
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">B</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Á</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">O</span>
                <span className="inline-block mx-2">•</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">C</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Á</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">O</span>
                <br />
                <span className="relative inline-block mt-2">
                  <span className="relative z-10 text-pink-400 drop-shadow-[0_0_30px_rgba(244,114,182,0.5)]">
                    THỐNG KÊ
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-4 bg-pink-400/30 blur-sm"></div>
                </span>
              </h1>
              
              <p className="text-white/80 text-xl font-medium max-w-2xl leading-relaxed">
                Phân tích chi tiết hoạt động và thành tích rèn luyện của các lớp
              </p>
            </div>

            {/* Stats Bar with Brutalist Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 - Total Students */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-gradient-to-br from-cyan-400 to-blue-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Users className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{overview.totalStudents || 0}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">SINH VIÊN</p>
                </div>
              </div>

              {/* Card 2 - Total Activities */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-green-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Activity className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{overview.totalActivities || 0}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">HOẠT ĐỘNG</p>
                </div>
              </div>

              {/* Card 3 - Average Points */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-yellow-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Award className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{avgScore}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">ĐIỂM TB</p>
                </div>
              </div>

              {/* Card 4 - Participation Rate */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-pink-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <TrendingUp className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{overview.participationRate || 0}%</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">THAM GIA</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom CSS for animations */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes grid-move {
            0% { transform: translateY(0); }
            100% { transform: translateY(50px); }
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0) rotate(45deg); }
            50% { transform: translateY(-20px) rotate(45deg); }
          }
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-bounce-slow {
            animation: bounce-slow 3s ease-in-out infinite;
          }
          .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
          }
        `}} />
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('detailed')}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'detailed'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FileText className="h-5 w-5" />
              Báo cáo chi tiết
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Semester Filter */}
          <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-semibold text-gray-700">Học kỳ:</span>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="flex-1 max-w-xs px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white font-medium text-gray-700 hover:border-purple-300 cursor-pointer"
                >
                  {semesterOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Chart Selector */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
            
            <div className="relative bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <h3 className="text-base font-bold text-gray-900">Chọn biểu đồ</h3>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedChart('participation')}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                    selectedChart === 'participation'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Tỷ Lệ Tham Gia
                </button>
                <button
                  onClick={() => setSelectedChart('activities')}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                    selectedChart === 'activities'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <BarChart3 className="h-5 w-5" />
                  Loại Hoạt Động
                </button>
                <button
                  onClick={() => setSelectedChart('points')}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                    selectedChart === 'points'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Award className="h-4 w-4" />
                  Điểm Rèn Luyện
                </button>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-8">
            {/* BIỂU ĐỒ 1: TỶ LỆ THAM GIA */}
            {selectedChart === 'participation' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Users className="h-6 w-6 text-indigo-600" />
                  Tỷ Lệ Tham Gia Hoạt Động Của Sinh Viên
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Phân bố sinh viên theo mức độ tham gia hoạt động trong học kỳ
                </p>
                {(() => {
                  const data = reportData?.pointsDistribution || [];
                  const total = data.reduce((sum, item) => sum + (item?.count || 0), 0);
                  console.log('📊 [Chart-Participation] Rendering with data:', data, 'total:', total);
                  
                  if (!data.length || total === 0) {
                    return (
                      <div className="flex items-center justify-center h-64 text-gray-500">
                        <div className="text-center">
                          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <p>Chưa có dữ liệu phân bố điểm</p>
                        </div>
                      </div>
                    );
                  }

                  const PARTICIPATION_COLORS = {
                    '0-49': '#EF4444',
                    '50-64': '#F59E0B',
                    '65-79': '#10B981',
                    '80-89': '#3B82F6',
                    '90-100': '#8B5CF6',
                  };
                  
                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Pie Chart */}
                      <div className="relative">
                        <ResponsiveContainer width="100%" height={400}>
                          <PieChart>
                            <Pie
                              data={data}
                              cx="50%"
                              cy="50%"
                              nameKey="range"
                              innerRadius={80}
                              outerRadius={140}
                              paddingAngle={3}
                              dataKey="count"
                            >
                              {data.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={PARTICIPATION_COLORS[entry.range] || COLORS[index % COLORS.length]}
                                  stroke="#fff"
                                  strokeWidth={3}
                                />
                              ))}
                            </Pie>
                            <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 16, fill: '#6B7280', fontWeight: 500 }}>
                              Tổng số
                            </text>
                            <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 36, fill: '#111827', fontWeight: 700 }}>
                              {total}
                            </text>
                            <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 14, fill: '#6B7280', fontWeight: 500 }}>
                              sinh viên
                            </text>
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'white', 
                                border: '2px solid #E5E7EB',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                padding: '12px'
                              }}
                              formatter={(value, name, props) => {
                                const item = props?.payload;
                                const pct = item?.percentage ?? (total ? ((value / total) * 100).toFixed(1) : 0);
                                return [`${value} SV (${pct}%)`, item?.range || name];
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* Stats Cards */}
                      <div className="space-y-3">
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border-2 border-purple-200">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-purple-500 rounded-lg">
                              <Trophy className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-bold text-gray-900">Xuất sắc (90-100 điểm)</h4>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-purple-600">
                              {data.find(d => d.range === '90-100')?.count || 0}
                            </span>
                            <span className="text-sm text-gray-600">sinh viên</span>
                            <span className="ml-auto text-lg font-semibold text-purple-600">
                              {data.find(d => d.range === '90-100')?.percentage || 0}%
                            </span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <Star className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-bold text-gray-900">Tốt (80-89 điểm)</h4>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-blue-600">
                              {data.find(d => d.range === '80-89')?.count || 0}
                            </span>
                            <span className="text-sm text-gray-600">sinh viên</span>
                            <span className="ml-auto text-lg font-semibold text-blue-600">
                              {data.find(d => d.range === '80-89')?.percentage || 0}%
                            </span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-green-500 rounded-lg">
                              <CheckCircle2 className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-bold text-gray-900">Khá (65-79 điểm)</h4>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-green-600">
                              {data.find(d => d.range === '65-79')?.count || 0}
                            </span>
                            <span className="text-sm text-gray-600">sinh viên</span>
                            <span className="ml-auto text-lg font-semibold text-green-600">
                              {data.find(d => d.range === '65-79')?.percentage || 0}%
                            </span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-amber-500 rounded-lg">
                              <AlertCircle className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-bold text-gray-900">Trung bình (50-64 điểm)</h4>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-amber-600">
                              {data.find(d => d.range === '50-64')?.count || 0}
                            </span>
                            <span className="text-sm text-gray-600">sinh viên</span>
                            <span className="ml-auto text-lg font-semibold text-amber-600">
                              {data.find(d => d.range === '50-64')?.percentage || 0}%
                            </span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border-2 border-red-200">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-red-500 rounded-lg">
                              <XCircle className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-bold text-gray-900">Yếu (0-49 điểm)</h4>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-red-600">
                              {data.find(d => d.range === '0-49')?.count || 0}
                            </span>
                            <span className="text-sm text-gray-600">sinh viên</span>
                            <span className="ml-auto text-lg font-semibold text-red-600">
                              {data.find(d => d.range === '0-49')?.percentage || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* BIỂU ĐỒ 2: PHÂN LOẠI HOẠT ĐỘNG */}
            {selectedChart === 'activities' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-indigo-600" />
                  Phân Loại Hoạt Động Theo Loại
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Thống kê số lượng và điểm trung bình của các loại hoạt động
                </p>
                {(() => {
                  const data = reportData?.activityTypes || [];
                  const overview = reportData?.overview || {};
                  const totalActivities = overview.totalActivities || 0;
                  
                  if (!data.length) {
                    return (
                      <div className="flex items-center justify-center h-64 text-gray-500">
                        <div className="text-center">
                          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <p>Chưa có dữ liệu loại hoạt động</p>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="space-y-6">
                      {/* Summary Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-6 text-white">
                          <div className="flex items-center gap-3 mb-2">
                            <Activity className="h-6 w-6" />
                            <span className="text-sm font-medium opacity-90">Tổng hoạt động</span>
                          </div>
                          <div className="text-4xl font-bold">{totalActivities}</div>
                          <div className="text-sm opacity-75 mt-1">hoạt động đã duyệt</div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-6 text-white">
                          <div className="flex items-center gap-3 mb-2">
                            <Target className="h-6 w-6" />
                            <span className="text-sm font-medium opacity-90">Số loại</span>
                          </div>
                          <div className="text-4xl font-bold">{data.length}</div>
                          <div className="text-sm opacity-75 mt-1">loại hoạt động</div>
                        </div>
                      </div>

                      {/* Bar Chart */}
                      <div className="bg-gray-50 rounded-xl p-6">
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis 
                              dataKey="name" 
                              angle={-45}
                              textAnchor="end"
                              height={100}
                              tick={{ fontSize: 12, fill: '#6B7280' }}
                            />
                            <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'white', 
                                border: '2px solid #E5E7EB',
                                borderRadius: '12px',
                                padding: '12px'
                              }}
                              formatter={(value, name) => {
                                if (name === 'count') return [value, 'Số lượng'];
                                if (name === 'points') return [value.toFixed(1), 'Điểm TB'];
                                return [value, name];
                              }}
                            />
                            <Legend 
                              wrapperStyle={{ paddingTop: '20px' }}
                              formatter={(value) => {
                                if (value === 'count') return 'Số lượng hoạt động';
                                if (value === 'points') return 'Điểm trung bình';
                                return value;
                              }}
                            />
                            <Bar dataKey="count" fill="#6366F1" radius={[10, 10, 0, 0]} />
                            <Bar dataKey="points" fill="#10B981" radius={[10, 10, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* BIỂU ĐỒ 3: ĐIỂM RÈN LUYỆN */}
            {selectedChart === 'points' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Award className="h-6 w-6 text-indigo-600" />
                  Điểm Rèn Luyện Trung Bình Lớp
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Xu hướng điểm rèn luyện và tỷ lệ tham gia theo thời gian
                </p>
                {(() => {
                  const data = reportData?.monthlyActivities || [];
                  
                  if (!data.length) {
                    return (
                      <div className="flex items-center justify-center h-64 text-gray-500">
                        <div className="text-center">
                          <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <p>Chưa có dữ liệu hoạt động theo tháng</p>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="space-y-6">
                      {/* Line + Area Chart */}
                      <div className="bg-gray-50 rounded-xl p-6">
                        <ResponsiveContainer width="100%" height={400}>
                          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis 
                              dataKey="month" 
                              tick={{ fontSize: 12, fill: '#6B7280' }}
                            />
                            <YAxis 
                              yAxisId="left"
                              tick={{ fontSize: 12, fill: '#6B7280' }}
                              label={{ value: 'Số hoạt động', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6B7280' } }}
                            />
                            <YAxis 
                              yAxisId="right"
                              orientation="right"
                              tick={{ fontSize: 12, fill: '#6B7280' }}
                              label={{ value: 'Số sinh viên', angle: 90, position: 'insideRight', style: { fontSize: 12, fill: '#6B7280' } }}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'white', 
                                border: '2px solid #E5E7EB',
                                borderRadius: '12px',
                                padding: '12px'
                              }}
                            />
                            <Legend />
                            <Area
                              yAxisId="left"
                              type="monotone"
                              dataKey="activities"
                              fill="url(#colorActivities)"
                              stroke="#6366F1"
                              strokeWidth={2}
                              name="Hoạt động"
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="participants"
                              stroke="#10B981"
                              strokeWidth={3}
                              dot={{ fill: '#10B981', r: 5 }}
                              name="Sinh viên tham gia"
                            />
                            <defs>
                              <linearGradient id="colorActivities" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'detailed' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Báo cáo chi tiết theo lớp</h3>
            <div className="flex gap-2">
              <button 
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Xuất Excel
              </button>
              <button 
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Xuất PDF
              </button>
            </div>
          </div>
          
          {(() => {
            const classNames = reportData?.classNames || [];
            const classStats = reportData?.classStats || [];
            
            if (!classNames.length) {
              return (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-500 mb-2">Chưa có dữ liệu báo cáo</h4>
                  <p className="text-gray-400">Bạn chưa được phân công chủ nhiệm lớp nào</p>
                </div>
              );
            }
            
            return (
              <div className="space-y-6">
                {/* Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-700">Tổng lớp</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">{classNames.length}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-semibold text-gray-700">Tổng sinh viên</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600">
                      {classStats.reduce((sum, s) => sum + (s.totalStudents || 0), 0)}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border-2 border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-semibold text-gray-700">Tổng hoạt động</span>
                    </div>
                    <p className="text-3xl font-bold text-purple-600">
                      {reportData?.overview?.totalActivities || 0}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-amber-600" />
                      <span className="text-sm font-semibold text-gray-700">Đăng ký đã duyệt</span>
                    </div>
                    <p className="text-3xl font-bold text-amber-600">
                      {classStats.reduce((sum, s) => sum + (s.approvedRegistrations || 0), 0)}
                    </p>
                  </div>
                </div>

                {/* Detailed Table by Class */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lớp
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sĩ số
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tổng HĐ
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          HĐ đã duyệt
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ĐK đã duyệt
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tỷ lệ tham gia
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {classNames.map((className, index) => {
                        const stat = classStats[index] || {};
                        const participationRate = stat.totalStudents > 0 
                          ? Math.round((stat.approvedRegistrations / stat.totalStudents) * 100) 
                          : 0;
                        
                        return (
                          <tr key={className} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                                  <span className="text-white font-bold text-sm">
                                    {className.substring(0, 2).toUpperCase()}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{className}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="text-sm font-semibold text-gray-900">{stat.totalStudents || 0}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="text-sm text-gray-900">{stat.totalActivities || 0}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {stat.approvedActivities || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {stat.approvedRegistrations || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center">
                                <div className="w-16">
                                  <div className="text-sm font-semibold text-gray-900">{participationRate}%</div>
                                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        participationRate >= 80 ? 'bg-green-500' :
                                        participationRate >= 60 ? 'bg-blue-500' :
                                        participationRate >= 40 ? 'bg-yellow-500' :
                                        'bg-red-500'
                                      }`}
                                      style={{ width: `${participationRate}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr className="font-bold">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          TỔNG CỘNG
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                          {classStats.reduce((sum, s) => sum + (s.totalStudents || 0), 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                          {classStats.reduce((sum, s) => sum + (s.totalActivities || 0), 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                          {classStats.reduce((sum, s) => sum + (s.approvedActivities || 0), 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                          {classStats.reduce((sum, s) => sum + (s.approvedRegistrations || 0), 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                          {(() => {
                            const totalStudents = classStats.reduce((sum, s) => sum + (s.totalStudents || 0), 0);
                            const totalApproved = classStats.reduce((sum, s) => sum + (s.approvedRegistrations || 0), 0);
                            return totalStudents > 0 ? Math.round((totalApproved / totalStudents) * 100) : 0;
                          })()}%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
