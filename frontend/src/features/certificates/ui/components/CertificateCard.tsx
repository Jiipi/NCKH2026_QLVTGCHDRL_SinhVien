import React from 'react';
import { Award, Calendar, MapPin, Download, Trophy, CheckCircle, FileText } from 'lucide-react';

export default function CertificateCard({
  certificate,
  formatDate,
  getSemesterFromDate,
  getAcademicYear,
  onDownload
}) {
  const activity = certificate.hoat_dong || {};
  const semester = getSemesterFromDate(activity.ngay_bd);
  const year = getAcademicYear(activity.ngay_bd);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/65 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/80 hover:shadow-xl dark:border-white/10 dark:bg-slate-950/50">
      <div className="border-b border-white/60 bg-white/45 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full p-3 shadow-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">
              <CheckCircle className="h-3 w-3" />Hoàn thành
            </span>
          </div>
          <span className="flex items-center gap-1 text-lg font-bold text-amber-600">
            <Award className="h-5 w-5" />
            {activity.diem_rl} điểm
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{activity.ten_hd}</h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
            {activity.loai_hd?.ten_loai_hd || 'Khác'}
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
            {semester}
          </span>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
            {year}
          </span>
        </div>
      </div>
      <div className="p-6 space-y-3">
        <div className="flex items-start gap-3 text-sm text-gray-600">
          <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-400" />
          <div>
            <span className="font-medium text-gray-700">Thời gian:</span> {formatDate(activity.ngay_bd)}
          </div>
        </div>
        <div className="flex items-start gap-3 text-sm text-gray-600">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-400" />
          <div>
            <span className="font-medium text-gray-700">Địa điểm:</span> {activity.dia_diem || 'Chưa xác định'}
          </div>
        </div>
        {activity.don_vi_to_chuc && (
          <div className="flex items-start gap-3 text-sm text-gray-600">
            <FileText className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-400" />
            <div>
              <span className="font-medium text-gray-700">Đơn vị:</span> {activity.don_vi_to_chuc}
            </div>
          </div>
        )}
        {certificate.ngay_duyet && (
          <div className="flex items-start gap-3 text-sm text-emerald-600">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Hoàn thành:</span> {formatDate(certificate.ngay_duyet)}
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-white/60 bg-white/35 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
        <button
          onClick={() => onDownload(certificate)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-4 py-3 font-bold text-white shadow-sm shadow-indigo-500/20 transition-all hover:-translate-y-0.5 dark:from-white dark:via-indigo-100 dark:to-white dark:text-slate-950"
        >
          <Download className="h-4 w-4" />Tải chứng nhận
        </button>
      </div>
    </div>
  );
}
