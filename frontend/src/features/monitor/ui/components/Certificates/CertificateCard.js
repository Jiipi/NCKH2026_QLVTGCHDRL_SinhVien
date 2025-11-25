import React from 'react';
import { Award, Calendar, MapPin, Download, Trophy, CheckCircle, FileText } from 'lucide-react';

/**
 * CertificateCard Component - Card hiển thị chứng nhận
 */
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
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b-2 border-amber-200 p-6">
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
      <div className="border-t bg-gray-50 p-4">
        <button 
          onClick={() => onDownload(activity)} 
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all shadow-lg hover:shadow-xl"
        >
          <Download className="h-4 w-4" />Tải chứng nhận
        </button>
      </div>
    </div>
  );
}

