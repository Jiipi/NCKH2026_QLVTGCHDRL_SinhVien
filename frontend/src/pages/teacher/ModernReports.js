import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar, 
  Users, 
  Activity,
  Award,
  Eye,
  Filter,
  RefreshCw
} from 'lucide-react';
import http from '../../shared/api/http';
import useSemesterData from '../../hooks/useSemesterData';
import SemesterFilter from '../../components/SemesterFilter';

export default function ModernReports() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('month');
  
  // Semester filter state (same logic as activities page)
  const getCurrentSemesterValue = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    if (currentMonth >= 7 && currentMonth <= 11) return `hoc_ky_1-${currentYear}`;
    else if (currentMonth === 12) return `hoc_ky_2-${currentYear}`;
    else if (currentMonth >= 1 && currentMonth <= 4) return `hoc_ky_2-${currentYear - 1}`;
    else return `hoc_ky_1-${currentYear}`;
  };
  const [semester, setSemester] = useState(getCurrentSemesterValue());
  const [filterMode, setFilterMode] = useState('semester'); // 'semester' | 'dateRange'

  // Unified semester options from backend
  const { options: semesterOptions } = useSemesterData();

  useEffect(() => {
    loadStatistics();
  }, [dateRange, semester, filterMode]);

  const getDateRangeParams = () => {
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
  };

  const loadStatistics = async () => {
    try {
      setLoading(true);
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
  };

  const handleExport = async (format = 'excel') => {
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
          <h3 className="text-lg font-semibold text-red-800 mb-2">CĂ³ lá»—i xáº£y ra</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadStatistics}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Thá»­ láº¡i
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">BĂ¡o cĂ¡o & Thá»‘ng kĂª</h1>
        <p className="text-gray-600">Xem thá»‘ng kĂª chi tiáº¿t vĂ  xuáº¥t bĂ¡o cĂ¡o</p>
      </div>

      {/* Filter Mode Toggle & Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        {/* Filter Mode Toggle */}
        <div className="mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterMode('semester')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterMode === 'semester' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Lá»c theo há»c ká»³
            </button>
            <button
              onClick={() => setFilterMode('dateRange')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterMode === 'dateRange' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4 inline mr-2" />
              Lá»c theo khoáº£ng thá»i gian
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* Semester or Date Range Filter */}
          {filterMode === 'semester' ? (
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Há»c ká»³</h3>
              <div className="max-w-md">
                <SemesterFilter value={semester} onChange={setSemester} label="" />
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Khoáº£ng thá»i gian</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setDateRange('week')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateRange === 'week' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tuáº§n nĂ y
                </button>
                <button
                  onClick={() => setDateRange('month')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateRange === 'month' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ThĂ¡ng nĂ y
                </button>
                <button
                  onClick={() => setDateRange('year')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateRange === 'year' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  NÄƒm nĂ y
                </button>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={loadStatistics}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              LĂ m má»›i
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Xuáº¥t Excel
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Xuáº¥t PDF
            </button>
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
            <span className="text-blue-200 text-sm">Tá»•ng hoáº¡t Ä‘á»™ng</span>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalActivities || 0}</div>
          <div className="text-blue-200 text-sm">Trong khoáº£ng thá»i gian</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-green-200 text-sm">Sinh viĂªn tham gia</span>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalStudents || 0}</div>
          <div className="text-green-200 text-sm">Tá»•ng sá»‘ sinh viĂªn</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-purple-200 text-sm">Tá»· lá»‡ tham gia</span>
          </div>
          <div className="text-3xl font-bold mb-1">{Math.round(stats.participationRate || 0)}%</div>
          <div className="text-purple-200 text-sm">Trung bĂ¬nh</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <Award className="w-6 h-6" />
            </div>
            <span className="text-orange-200 text-sm">Äiá»ƒm trung bĂ¬nh</span>
          </div>
          <div className="text-3xl font-bold mb-1">{parseFloat(stats.averageScore || 0).toFixed(1)}</div>
          <div className="text-orange-200 text-sm">Äiá»ƒm rĂ¨n luyá»‡n</div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiáº¿t thá»‘ng kĂª</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalRegistrations || 0}</div>
              <div className="text-sm text-gray-600">LÆ°á»£t Ä‘Äƒng kĂ½ hoáº¡t Ä‘á»™ng</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalStudents || 0}</div>
              <div className="text-sm text-gray-600">Tá»•ng sinh viĂªn quáº£n lĂ½</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{Math.round(stats.participationRate || 0)}%</div>
              <div className="text-sm text-gray-600">Tá»· lá»‡ sinh viĂªn tham gia</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Hoáº¡t Ä‘á»™ng theo thĂ¡ng</h3>
            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
              <Eye className="w-5 h-5" />
            </button>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Biá»ƒu Ä‘á»“ sáº½ Ä‘Æ°á»£c hiá»ƒn thá»‹ á»Ÿ Ä‘Ă¢y</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Tá»· lá»‡ tham gia</h3>
            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
              <Eye className="w-5 h-5" />
            </button>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Biá»ƒu Ä‘á»“ sáº½ Ä‘Æ°á»£c hiá»ƒn thá»‹ á»Ÿ Ä‘Ă¢y</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">BĂ¡o cĂ¡o chi tiáº¿t</h3>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              Lá»c
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              Xuáº¥t bĂ¡o cĂ¡o
            </button>
          </div>
        </div>
        
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-500 mb-2">ChÆ°a cĂ³ dá»¯ liá»‡u bĂ¡o cĂ¡o</h4>
          <p className="text-gray-400">Dá»¯ liá»‡u bĂ¡o cĂ¡o sáº½ Ä‘Æ°á»£c hiá»ƒn thá»‹ khi cĂ³ hoáº¡t Ä‘á»™ng</p>
        </div>
      </div>
    </div>
  );
}
