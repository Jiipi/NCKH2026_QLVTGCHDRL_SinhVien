import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, Area } from 'recharts';
import { TrendingUp, Users, Calendar, Award, Download, RefreshCw, Filter, BarChart3, PieChart as PieIcon, LineChart as LineIcon, FileText, AlertCircle, Sparkles, Target, Activity, Trophy, Star, CheckCircle2, XCircle } from 'lucide-react';
import http from '../../shared/api/http';
import useSemesterData from '../../hooks/useSemesterData';

export default function ModernReports() {
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

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const toSemesterId = (val) => {
        if (!val) return undefined;
        const m = String(val).match(/hoc_ky_(1|2)-(\d{4})/);
        return m ? `${m[1]}-${m[2]}` : val;
      };
      const params = { semesterId: toSemesterId(semester) };
      const res = await http.get('/teacher/reports/statistics', { params });
      const data = res.data?.data || {};
      const summary = data.summary || {};
      const totalStudents = Number(summary.totalStudents || 0);
      const approvedRegistrations = Number(summary.approvedRegistrations || 0);
      const totalActivities = Number(summary.totalActivities || 0);
      const totalRegistrations = Number(summary.totalRegistrations || 0);
      const participationRate = totalStudents > 0 
        ? Math.round((approvedRegistrations / totalStudents) * 100)
        : 0;
      setStats({
        totalStudents,
        totalActivities,
        totalRegistrations,
        approvedRegistrations,
        participationRate,
        averageScore: 0
      });
    } catch (err) {
      console.error('Error loading statistics:', err);
      setError('Không thể tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format = 'excel') => {
    try {
      const toSemesterId = (val) => {
        if (!val) return undefined;
        const m = String(val).match(/hoc_ky_(1|2)-(\d{4})/);
        return m ? `${m[1]}-${m[2]}` : val;
      };
      const params = { format, semesterId: toSemesterId(semester) };
      const res = await http.get('/teacher/reports/export', {
        params,
        responseType: 'text'
      });
      
      // Create download link
      const blob = new Blob([res.data], { 
        type: format === 'excel' ? 'text/csv' : 'text/csv'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bao-cao-giang-vien-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      alert('Xuất báo cáo thành công!');
    } catch (err) {
      console.error('Error exporting report:', err);
      alert('Không thể xuất báo cáo: ' + (err.response?.data?.message || 'Lỗi không xác định'));
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Có lỗi xảy ra</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadStatistics}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header (styled similar to Monitor) */}
      <div className="relative rounded-3xl overflow-hidden border border-purple-200/40 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 opacity-90" />
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-3 mb-3">
                <span className="bg-black text-pink-400 px-3 py-1 text-xs font-black tracking-wider -rotate-2 border-2 border-pink-400">BÁO CÁO</span>
                <span className="h-5 w-px bg-white/60" />
                <span className="text-white/90 text-sm font-semibold">Giảng viên</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">Thống kê lớp học</h1>
              <p className="text-white/80 mt-2">Tổng quan theo học kỳ và xuất báo cáo</p>
            </div>
            <div className="flex flex-col md:items-end gap-3">
              <div className="w-full md:w-80">
                <SemesterFilter value={semester} onChange={setSemester} label="Học kỳ" />
              </div>
              <div className="flex gap-2">
                <button onClick={loadStatistics} className="flex items-center gap-2 px-4 py-2 bg-white/90 text-gray-800 rounded-xl hover:bg-white transition-all">
                  <RefreshCw className="w-4 h-4" />
                  Làm mới
                </button>
                <button onClick={() => handleExport('excel')} className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all">
                  <Download className="w-4 h-4" />
                  Excel
                </button>
                <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-4 py-2 bg-white/90 text-purple-700 rounded-xl hover:bg-white transition-all">
                  <Download className="w-4 h-4" />
                  PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-blue-200 text-sm">Tổng hoạt động</span>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalActivities || 0}</div>
          <div className="text-blue-200 text-sm">Trong học kỳ</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-green-200 text-sm">Sinh viên tham gia</span>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalStudents || 0}</div>
          <div className="text-green-200 text-sm">Tổng số sinh viên</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-purple-200 text-sm">Tỷ lệ tham gia</span>
          </div>
          <div className="text-3xl font-bold mb-1">{Math.round(stats.participationRate || 0)}%</div>
          <div className="text-purple-200 text-sm">Trung bình</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <Award className="w-6 h-6" />
            </div>
            <span className="text-orange-200 text-sm">Điểm trung bình</span>
          </div>
          <div className="text-3xl font-bold mb-1">{parseFloat(stats.averageScore || 0).toFixed(1)}</div>
          <div className="text-orange-200 text-sm">Điểm rèn luyện</div>
        </div>
      </div>

      {/* Additional Stats (monitor-style minimalist) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalRegistrations || 0}</div>
            <div className="text-sm text-gray-600">Lượt đăng ký hoạt động</div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalStudents || 0}</div>
            <div className="text-sm text-gray-600">Tổng sinh viên quản lý</div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-4">
          <div className="p-3 bg-purple-50 rounded-lg">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{Math.round(stats.participationRate || 0)}%</div>
            <div className="text-sm text-gray-600">Tỷ lệ sinh viên tham gia</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Hoạt động theo tháng</h3>
            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
              <Eye className="w-5 h-5" />
            </button>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Biểu đồ sẽ được hiển thị ở đây</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Tỷ lệ tham gia</h3>
            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
              <Eye className="w-5 h-5" />
            </button>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Biểu đồ sẽ được hiển thị ở đây</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Báo cáo chi tiết</h3>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              Lọc
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              Xuất báo cáo
            </button>
          </div>
        </div>
        
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-500 mb-2">Chưa có dữ liệu báo cáo</h4>
          <p className="text-gray-400">Dữ liệu báo cáo sẽ được hiển thị khi có hoạt động</p>
        </div>
      </div>
    </div>
  );
}

