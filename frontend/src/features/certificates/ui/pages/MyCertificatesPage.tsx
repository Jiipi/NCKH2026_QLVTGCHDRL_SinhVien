import React from 'react';
import { Search, X, Trophy, Award, ShieldCheck } from 'lucide-react';
import { useNotification } from '../../../../shared/contexts/NotificationContext';
import { useCertificates } from '../../model/useCertificates';
import { StudentPageHero } from '../../../../shared/components/student';
import CertificateCard from '../components/CertificateCard';

export default function MyCertificatesPage() {
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
  } = useCertificates();

  const handleDownload = async (certificate) => {
    try {
      await handleDownloadCertificate(certificate);
      showSuccess('Đã mở chứng nhận để in hoặc lưu PDF.', 'Thông báo', 5000);
    } catch (error) {
      showError('Không thể tải chứng nhận');
    }
  };

  if (loading) return (<div className="flex h-96 items-center justify-center rounded-[2rem] border border-white/60 bg-white/60 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55"><div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div></div>);

  return (
    <div className="space-y-6">
      <StudentPageHero
        eyebrow="Không gian sinh viên"
        title="Chứng nhận của tôi"
        description="Tổng hợp các chứng nhận hoạt động đã hoàn thành."
        badge={{ icon: ShieldCheck, label: 'Hồ sơ chứng nhận' }}
        metrics={[
          { icon: Award, label: 'Chứng nhận', value: certificates.length, tone: 'text-indigo-600 dark:text-indigo-300' },
          { icon: Trophy, label: 'Tổng điểm', value: totalPoints.toFixed(1), tone: 'text-amber-600 dark:text-amber-300' },
        ]}
      />

      <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(129,140,248,0.12),transparent_28%),radial-gradient(circle_at_100%_0%,rgba(45,212,191,0.10),transparent_26%)]" />
        <div className="relative z-10 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Tìm kiếm theo tên hoạt động..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full rounded-2xl border border-white/70 bg-white/55 py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-900 shadow-inner shadow-white/40 backdrop-blur-xl transition-all placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-none" />
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <select value={filters.semester} onChange={(e) => setFilters({ ...filters, semester: e.target.value })} className="flex-1 rounded-2xl border border-white/70 bg-white/55 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-xl transition-all focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <option value="">Tất cả học kỳ</option>
              <option value="Học kỳ 1">Học kỳ 1</option>
              <option value="Học kỳ 2">Học kỳ 2</option>
            </select>
            <select value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} className="flex-1 rounded-2xl border border-white/70 bg-white/55 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-xl transition-all focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <option value="">Tất cả năm học</option>
              {uniqueYears.map(year => (<option key={year} value={year}>{year}</option>))}
            </select>
            <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="flex-1 rounded-2xl border border-white/70 bg-white/55 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-xl transition-all focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <option value="">Tất cả loại hoạt động</option>
              {activityTypes.map(type => {
                const typeValue = type.id ?? type.ma_loai_hd ?? type.loai_hd_id;
                return (<option key={typeValue} value={typeValue}>{type.ten_loai_hd || type.name}</option>);
              })}
            </select>
            {(filters.semester || filters.year || filters.category || searchText) && (
              <button onClick={clearFilters} className="flex items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/55 px-4 py-2.5 font-semibold text-slate-700 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white/75 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"><X className="h-4 w-4" />Xóa bộ lọc</button>
            )}
          </div>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-white/70 bg-white/60 p-12 text-center shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55">
          <Trophy className="mx-auto mb-4 h-16 w-16 text-slate-400" />
          <p className="text-lg text-slate-500 dark:text-slate-300">{certificates.length === 0 ? 'Chưa có chứng nhận nào' : 'Không tìm thấy chứng nhận phù hợp'}</p>
          {(filters.semester || filters.year || filters.category || searchText) && (<button onClick={clearFilters} className="mt-4 font-semibold text-indigo-600 hover:underline dark:text-indigo-300">Xóa bộ lọc</button>)}
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
        <div className="rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55">
          <div className="grid grid-cols-1 gap-4 text-center md:grid-cols-4">
            <SummaryMetric value={certificates.length} label="Tổng số chứng nhận" tone="text-indigo-600 dark:text-indigo-300" />
            <SummaryMetric value={certificates.reduce((sum, cert) => sum + (parseFloat(cert.hoat_dong?.diem_rl) || 0), 0).toFixed(1)} label="Tổng điểm đạt được" tone="text-emerald-600 dark:text-emerald-300" />
            <SummaryMetric value={[...new Set(certificates.map(c => c.hoat_dong?.loai_hd_id))].length} label="Loại hoạt động" tone="text-purple-600 dark:text-purple-300" />
            <SummaryMetric value={[...new Set(certificates.map(c => getSemesterFromDate(c.hoat_dong?.ngay_bd)))].length} label="Học kỳ tham gia" tone="text-rose-600 dark:text-rose-300" />
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryMetric({ value, label, tone }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <div className={`text-3xl font-black tracking-[-0.04em] ${tone}`}>{value}</div>
      <div className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-300">{label}</div>
    </div>
  );
}
