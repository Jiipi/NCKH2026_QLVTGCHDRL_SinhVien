import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, Area } from 'recharts';
import { TrendingUp, Users, Calendar, Award, Download, RefreshCw, Filter, BarChart3, PieChart as PieIcon, LineChart as LineIcon, FileText, AlertCircle, Sparkles, Target, Activity, Trophy, Star, CheckCircle2, XCircle } from 'lucide-react';
import http from '../../shared/api/http';
import useSemesterData from '../../hooks/useSemesterData';

export default function ClassReports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState('participation');
  const [error, setError] = useState('');

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
  }, [semester]); // ✅ Reload when semester changes

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('📊 [ClassReports] Loading data for semester:', semester);
      
      // ✅ Use core monitor reports endpoint with semester parameter
      const response = await http.get('/core/monitor/reports', { params: { semester } });
      const raw = response?.data?.data;
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
      downloadBlob(blob, `bao_cao_lop_${semester}_${new Date().toISOString().split('T')[0]}.csv`);
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
      // Ensure values with commas/newlines are quoted
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

    // Activity types
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

    // Points distribution
    if (Array.isArray(reportData.pointsDistribution) && reportData.pointsDistribution.length) {
      lines.push('PHÂN BỐ ĐIỂM RÈN LUYỆN');
      lines.push('Khoảng điểm,Số SV,Tỷ lệ (%)');
      reportData.pointsDistribution.forEach(d => {
        lines.push(`${safe(d.range)},${safe(d.count)},${safe(d.percentage)}`);
      });
      lines.push('');
    }

    // Monthly activities
    if (Array.isArray(reportData.monthlyActivities) && reportData.monthlyActivities.length) {
      lines.push('HOẠT ĐỘNG THEO THÁNG');
      lines.push('Tháng,Số hoạt động,Số SV tham gia');
      reportData.monthlyActivities.forEach(m => {
        lines.push(`${safe(m.month)},${safe(m.activities)},${safe(m.participants)}`);
      });
      lines.push('');
    }

    // Top students
    if (Array.isArray(reportData.topStudents) && reportData.topStudents.length) {
      lines.push('TOP SINH VIÊN');
      lines.push('Hạng,Họ tên,MSSV,Điểm RL,Hoạt động');
      reportData.topStudents.forEach((s) => {
        lines.push(`${safe(s.rank || '')},${safe(s.name || '')},${safe(s.mssv || '')},${safe(s.points || 0)},${safe(s.activities || 0)}`);
      });
    }

    return lines.join('\n');
  };

  const generateReportHTML = () => {
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
            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2">💡 Giải pháp:</h3>
              <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                <li>Kiểm tra bạn đã được gán vào lớp nào chưa</li>
                <li>Liên hệ admin để được gán làm lớp trưởng</li>
                <li>Đảm bảo tài khoản có role LOP_TRUONG</li>
              </ul>
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
  const getScoreTheme = (s) => {
    if (s >= 90) return { gradient: 'from-violet-500 to-purple-600', label: 'Xuất sắc' };
    if (s >= 80) return { gradient: 'from-blue-500 to-indigo-600', label: 'Tốt' };
    if (s >= 65) return { gradient: 'from-emerald-500 to-green-600', label: 'Khá' };
    if (s >= 50) return { gradient: 'from-amber-400 to-orange-500', label: 'Trung bình' };
    return { gradient: 'from-rose-500 to-red-600', label: 'Yếu' };
  };
  const scoreTheme = getScoreTheme(avgScore);

  return (
    <div className="space-y-6">
      {/* Ultra Modern Header - Neo-brutalism + Glassmorphism Hybrid */}
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
                    {overview.totalStudents || 0} SINH VIÊN
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
                Phân tích chi tiết hoạt động và thành tích rèn luyện của lớp
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
          
          {/* BIỂU ĐỒ 1: TỶ LỆ THAM GIA SINH VIÊN */}
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
                const total = data.reduce((s, i) => s + (i?.count || 0), 0);
                console.log('📊 [Chart-Participation] Rendering with data:', data);
                
                // Custom colors theo mức độ (Chuẩn học thuật)
                const PARTICIPATION_COLORS = {
                  '0-49': '#EF4444',    // Red - Yếu
                  '50-64': '#F59E0B',   // Amber - Trung bình
                  '65-79': '#10B981',   // Green - Khá
                  '80-89': '#3B82F6',   // Blue - Tốt
                  '90-100': '#8B5CF6',  // Purple - Xuất sắc
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
                          {/* Center label */}
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
                console.log('📊 [Chart-Activities] Rendering with data:', data);
                
                // Use totalActivities from overview (approved activities in this semester)
                const totalActivities = overview.totalActivities || 0;
                
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
                        <div className="text-sm opacity-75 mt-1">hoạt động đã đăng ký và duyệt</div>
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
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart 
                        data={data}
                        margin={{ top: 30, right: 30, left: 80, bottom: 80 }}
                        barGap={15}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }}
                          axisLine={{ stroke: '#D1D5DB', strokeWidth: 2 }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#6B7280' }}
                          label={{ 
                            value: 'Số hoạt động', 
                            angle: -90, 
                            position: 'insideLeft', 
                            style: { fontSize: 13, fill: '#374151', fontWeight: 600 } 
                          }}
                          axisLine={{ stroke: '#D1D5DB', strokeWidth: 2 }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '2px solid #E5E7EB',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            padding: '12px'
                          }}
                          formatter={(value, name, props) => {
                            if (name === 'count') {
                              const avgPoints = props.payload.points / props.payload.count;
                              return [
                                <>
                                  <div><strong>{value}</strong> hoạt động</div>
                                  <div className="text-sm text-gray-600">Điểm TB: {avgPoints.toFixed(1)}</div>
                                </>,
                                'Thống kê'
                              ];
                            }
                            return [value, name];
                          }}
                        />
                        <Bar 
                          dataKey="count" 
                          radius={[10, 10, 0, 0]} 
                          maxBarSize={100}
                          label={({ x, y, width, value }) => (
                            <text 
                              x={x + width / 2} 
                              y={y - 8} 
                              fill="#4B5563" 
                              textAnchor="middle" 
                              fontSize="14"
                              fontWeight="700"
                            >
                              {value}
                            </text>
                          )}
                        >
                          {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}
            </div>
          )}

          {/* BIỂU ĐỒ 3: ĐIỂM RÈN LUYỆN TRUNG BÌNH */}
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
                const attendanceData = reportData?.attendanceRate || [];
                const monthlyData = reportData?.monthlyActivities || [];
                const overview = reportData?.overview || {};
                
                // Combine data for dual-axis chart
                const combinedData = monthlyData.map(month => {
                  const attendance = attendanceData.find(a => a.month === month.month.split('/')[0]) || {};
                  return {
                    month: month.month,
                    activities: month.activities,
                    participants: month.participants,
                    rate: attendance.rate || 0
                  };
                });
                
                console.log('📊 [Chart-Points] Rendering with data:', combinedData);
                
                return (
                  <div className="space-y-6">
                    {/* Overall Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-6 text-white text-center">
                        <Award className="h-10 w-10 mx-auto mb-3" />
                        <div className="text-4xl font-bold mb-1">{overview.avgPoints || 0}</div>
                        <div className="text-sm opacity-90">Điểm TB lớp</div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-6 text-white text-center">
                        <Users className="h-10 w-10 mx-auto mb-3" />
                        <div className="text-4xl font-bold mb-1">{overview.participationRate || 0}%</div>
                        <div className="text-sm opacity-90">Tỷ lệ tham gia</div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-6 text-white text-center">
                        <Activity className="h-10 w-10 mx-auto mb-3" />
                        <div className="text-4xl font-bold mb-1">{overview.totalActivities || 0}</div>
                        <div className="text-sm opacity-90">Tổng hoạt động</div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl p-6 text-white text-center">
                        <TrendingUp className="h-10 w-10 mx-auto mb-3" />
                        <div className="text-4xl font-bold mb-1">{overview.totalStudents || 0}</div>
                        <div className="text-sm opacity-90">Tổng sinh viên</div>
                      </div>
                    </div>

                    {/* Dual-Axis Chart */}
                    <ResponsiveContainer width="100%" height={450}>
                      <LineChart 
                        data={combinedData}
                        margin={{ top: 40, right: 60, left: 20, bottom: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                        <XAxis 
                          dataKey="month" 
                          stroke="#6B7280"
                          tick={{ fontSize: 13, fill: '#374151', fontWeight: 500 }}
                          height={60}
                          axisLine={{ stroke: '#D1D5DB', strokeWidth: 2 }}
                        />
                        <YAxis 
                          yAxisId="left"
                          stroke="#6B7280"
                          tick={{ fontSize: 12, fill: '#6B7280' }}
                          label={{ 
                            value: 'Số lượng', 
                            angle: -90, 
                            position: 'insideLeft', 
                            style: { fontSize: 13, fill: '#374151', fontWeight: 600 } 
                          }}
                          axisLine={{ stroke: '#D1D5DB', strokeWidth: 2 }}
                        />
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          stroke="#6B7280"
                          tick={{ fontSize: 12, fill: '#6B7280' }}
                          label={{ 
                            value: 'Tỷ lệ (%)', 
                            angle: 90, 
                            position: 'insideRight', 
                            style: { fontSize: 13, fill: '#374151', fontWeight: 600 } 
                          }}
                          domain={[0, 100]}
                          axisLine={{ stroke: '#D1D5DB', strokeWidth: 2 }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '2px solid #E5E7EB',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            padding: '12px'
                          }}
                          labelStyle={{ fontWeight: 600, color: '#111827', marginBottom: '8px' }}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px' }}
                          iconType="line"
                          iconSize={20}
                        />
                        
                        {/* Area for participation rate */}
                        <defs>
                          <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#6366F1" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <Area 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="rate" 
                          fill="url(#rateGradient)" 
                          stroke="none"
                        />
                        
                        {/* Line for participation rate */}
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="rate" 
                          stroke="#6366F1" 
                          strokeWidth={4}
                          dot={{ fill: '#6366F1', r: 7, strokeWidth: 3, stroke: '#fff' }}
                          name="Tỷ lệ tham gia (%)"
                          label={({ x, y, value }) => {
                            if (!value) return null;
                            return (
                              <g>
                                <rect 
                                  x={x - 22} 
                                  y={y - 26} 
                                  width={44} 
                                  height={22} 
                                  fill="#6366F1" 
                                  rx={6}
                                  opacity={0.95}
                                />
                                <text 
                                  x={x} 
                                  y={y - 12} 
                                  fill="white" 
                                  textAnchor="middle" 
                                  dominantBaseline="middle"
                                  fontSize="13"
                                  fontWeight="700"
                                >
                                  {value}%
                                </text>
                              </g>
                            );
                          }}
                        />
                        
                        {/* Bar for activities */}
                        <Bar 
                          yAxisId="left"
                          dataKey="activities" 
                          fill="#10B981"
                          radius={[8, 8, 0, 0]}
                          name="Số hoạt động"
                          maxBarSize={60}
                          label={({ x, y, width, value }) => (
                            <text 
                              x={x + width / 2} 
                              y={y - 8} 
                              fill="#059669" 
                              textAnchor="middle" 
                              fontSize="13"
                              fontWeight="700"
                            >
                              {value}
                            </text>
                          )}
                        />
                      </LineChart>
                    </ResponsiveContainer>

                    {/* Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-blue-600" />
                          Phân tích xu hướng
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>Tỷ lệ tham gia trung bình: <strong>{overview.participationRate || 0}%</strong></span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>Điểm rèn luyện TB: <strong>{overview.avgPoints || 0} điểm</strong></span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>Số hoạt động đã tổ chức: <strong>{overview.totalActivities || 0}</strong></span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Target className="h-5 w-5 text-amber-600" />
                          Đánh giá chung
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Hoạt động</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              (overview.totalActivities || 0) >= 10 
                                ? 'bg-green-100 text-green-700' 
                                : (overview.totalActivities || 0) >= 5
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-red-100 text-red-700'
                            }`}>
                              {(overview.totalActivities || 0) >= 10 ? 'Tốt' : (overview.totalActivities || 0) >= 5 ? 'Trung bình' : 'Cần cải thiện'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Tham gia</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              (overview.participationRate || 0) >= 70 
                                ? 'bg-green-100 text-green-700' 
                                : (overview.participationRate || 0) >= 50
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-red-100 text-red-700'
                            }`}>
                              {(overview.participationRate || 0) >= 70 ? 'Tốt' : (overview.participationRate || 0) >= 50 ? 'Trung bình' : 'Cần cải thiện'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Điểm TB</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              (overview.avgPoints || 0) >= 70 
                                ? 'bg-green-100 text-green-700' 
                                : (overview.avgPoints || 0) >= 50
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-red-100 text-red-700'
                            }`}>
                              {(overview.avgPoints || 0) >= 70 ? 'Tốt' : (overview.avgPoints || 0) >= 50 ? 'Trung bình' : 'Cần cải thiện'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

      {/* Top Students */}
      {reportData?.topStudents?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="h-7 w-7 text-yellow-500" />
            <h3 className="text-xl font-bold text-gray-900">
              TOP SINH VIÊN XUẤT SẮC
            </h3>
          </div>
          
          <div className="space-y-3">
            {reportData.topStudents.slice(0, 5).map((student, index) => (
              <div 
                key={index}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                  index === 0 ? 'bg-yellow-50 border-yellow-200' :
                  index === 1 ? 'bg-gray-50 border-gray-200' :
                  index === 2 ? 'bg-orange-50 border-orange-200' :
                  'bg-white border-gray-200'
                }`}
              >
                {/* Rank badge */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-100 text-gray-700' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-indigo-100 text-indigo-700'
                }`}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>
                
                {/* Student info */}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{student.name}</p>
                  <p className="text-sm text-gray-600">MSSV: {student.mssv}</p>
                </div>
                
                {/* Points */}
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <p className="text-2xl font-bold text-gray-900">{student.points}</p>
                  </div>
                  <p className="text-xs text-gray-600">{student.activities} hoạt động</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
