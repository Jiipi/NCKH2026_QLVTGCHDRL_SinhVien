import React from 'react';
import { Search, X, Trophy } from 'lucide-react';
import { useNotification } from '../../../contexts/NotificationContext';
import { useMonitorCertificates } from '../model/hooks/useMonitorCertificates';
import CertificatesHeader from './components/Certificates/CertificatesHeader';
import CertificateCard from './components/Certificates/CertificateCard';

export default function MonitorMyCertificatesPage() {
  const { showSuccess, showError } = useNotification();
  const {
    certificates,
    activityTypes,
    totalPoints,
    uniqueYears,
    loading,
    searchText,
    setSearchText,
    filters,
    setFilters,
    formatDate,
    getSemesterFromDate,
    getAcademicYear,
    clearFilters,
    handleDownloadCertificate
  } = useMonitorCertificates();

  const handleDownload = async (activity) => {
    try {
      await handleDownloadCertificate(activity);
      showSuccess('Chức năng đang phát triển. Tạm thời hiển thị thông tin chứng nhận.', 'Thông báo', 5000);
    } catch (error) {
      showError('Không thể tải chứng nhận');
    }
  };
  if (loading) return (<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>);

  return (
    <div className="p-6 space-y-6">
      <CertificatesHeader
        certificates={certificates}
        totalPoints={totalPoints}
      />

      <div className="bg-white border rounded-lg p-4">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Tìm kiếm theo tên hoạt động..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <select value={filters.semester} onChange={(e) => setFilters({ ...filters, semester: e.target.value })} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Tất cả học kỳ</option>
              <option value="Học kỳ 1">Học kỳ 1</option>
              <option value="Học kỳ 2">Học kỳ 2</option>
            </select>
            <select value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Tất cả năm học</option>
              {uniqueYears.map(year => (<option key={year} value={year}>{year}</option>))}
            </select>
            <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Tất cả loại hoạt động</option>
              {activityTypes.map(type => (<option key={type.id} value={type.id}>{type.ten_loai_hd || type.name}</option>))}
            </select>
            {(filters.semester || filters.year || filters.category || searchText) && (
              <button onClick={clearFilters} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-all"><X className="h-4 w-4" />Xóa bộ lọc</button>
            )}
          </div>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center">
          <Trophy className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">{certificates.length === 0 ? 'Chưa có chứng nhận nào' : 'Không tìm thấy chứng nhận phù hợp'}</p>
          {(filters.semester || filters.year || filters.category || searchText) && (<button onClick={clearFilters} className="mt-4 text-blue-600 hover:underline">Xóa bộ lọc</button>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <CertificateCard
              key={cert.id}
              certificate={cert}
              formatDate={formatDate}
              getSemesterFromDate={getSemesterFromDate}
              getAcademicYear={getAcademicYear}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}

      {certificates.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div><div className="text-3xl font-bold text-blue-600">{certificates.length}</div><div className="text-sm text-gray-600 mt-1">Tổng số chứng nhận</div></div>
            <div><div className="text-3xl font-bold text-indigo-600">{certificates.reduce((sum, cert) => sum + (parseFloat(cert.hoat_dong?.diem_rl) || 0), 0).toFixed(1)}</div><div className="text-sm text-gray-600 mt-1">Tổng điểm đạt được</div></div>
            <div><div className="text-3xl font-bold text-purple-600">{[...new Set(certificates.map(c => c.hoat_dong?.loai_hd_id))].length}</div><div className="text-sm text-gray-600 mt-1">Loại hoạt động</div></div>
            <div><div className="text-3xl font-bold text-pink-600">{[...new Set(certificates.map(c => getSemesterFromDate(c.hoat_dong?.ngay_bd)))].length}</div><div className="text-sm text-gray-600 mt-1">Học kỳ tham gia</div></div>
          </div>
        </div>
      )}
    </div>
  );
}
