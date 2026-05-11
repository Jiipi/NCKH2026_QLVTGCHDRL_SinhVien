import React from 'react';
import { Eye, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { getUserAvatar } from '../../../../../shared/lib/avatar';
import { getBestActivityImage } from '../../../../../shared/lib/activityImages';
import { getStatusColor, getStatusText, getStatusIcon } from './registrationUtils';

export default function AdminRegistrationCard({ 
  registration, 
  viewMode, 
  isSelected, 
  onToggleSelect, 
  onViewActivity, 
  onApprove, 
  onReject 
}) {
  const status = registration.trang_thai_dk || registration.trang_thai;
  const activity = registration.hoat_dong;
  const student = registration.sinh_vien;

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/60 shadow-sm backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-200/70 hover:bg-white/75 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/60 dark:hover:bg-white/10">
      <div className="flex">
        <div className="relative h-48 w-48 flex-shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={getBestActivityImage(activity)}
            alt={activity?.ten_hd}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200?text=No+Image'; }}
          />
          {viewMode === 'pending' && (
            <div className="absolute top-2 left-2">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onToggleSelect}
                className="h-5 w-5 rounded border-white/70 text-amber-600 shadow-sm focus:ring-amber-500"
              />
            </div>
          )}
        </div>

        <div className="flex-1 p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="mb-1 line-clamp-1 text-lg font-bold text-slate-950 dark:text-white">{activity?.ten_hd}</h3>
              <p className="font-mono text-sm text-slate-500 dark:text-slate-400">{activity?.ma_hd}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(status)}`}>
              {getStatusIcon(status)}
              {getStatusText(status)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {(() => {
                  const avatar = getUserAvatar(student?.nguoi_dung);
                  return avatar.hasValidAvatar ? (
                    <img src={avatar.src} alt={avatar.alt} className="h-10 w-10 rounded-full border-2 border-amber-200/70 object-cover dark:border-amber-400/20" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-amber-200/70 bg-amber-100 text-sm font-bold text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
                      {avatar.fallback}
                    </div>
                  );
                })()}
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{student?.nguoi_dung?.ho_ten}</p>
                  <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{student?.mssv || student?.ma_sv}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400"><span className="font-bold">Lớp:</span> {student?.lop?.ten_lop || student?.lop || 'N/A'}</p>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Calendar className="h-4 w-4 text-amber-500 dark:text-amber-300" />
                <span className="text-xs">{registration.ngay_dang_ky || registration.ngay_dk ? new Date(registration.ngay_dang_ky || registration.ngay_dk).toLocaleDateString('vi-VN') : 'N/A'}</span>
              </div>
              {registration.ngay_duyet && (
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <CheckCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-300" />
                  <span className="text-xs">Duyệt: {new Date(registration.ngay_duyet).toLocaleDateString('vi-VN')}</span>
                </div>
              )}
            </div>
          </div>

          {registration.ly_do_dk && (
            <div className="mb-4 rounded-2xl border border-white/60 bg-white/45 p-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <p className="mb-1 text-xs font-bold text-slate-600 dark:text-slate-300">Lý do đăng ký:</p>
              <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{registration.ly_do_dk}</p>
            </div>
          )}

          {registration.ly_do_tu_choi && (
            <div className="mb-4 rounded-2xl border border-rose-200/70 bg-rose-50/70 p-3 shadow-sm backdrop-blur-xl dark:border-rose-400/20 dark:bg-rose-400/10">
              <p className="mb-1 text-xs font-bold text-rose-700 dark:text-rose-300">Lý do từ chối:</p>
              <p className="text-sm text-rose-600 dark:text-rose-300">{registration.ly_do_tu_choi}</p>
            </div>
          )}

          <div className="flex gap-2 border-t border-white/60 pt-3 dark:border-white/10">
            <button
              onClick={() => onViewActivity(activity)}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md"
            >
              <Eye className="h-4 w-4" /> Xem hoạt động
            </button>
            {status === 'cho_duyet' && (
              <>
                <button
                  onClick={() => onApprove(registration.id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:shadow-md"
                >
                  <CheckCircle className="h-4 w-4" /> Phê duyệt
                </button>
                <button
                  onClick={() => onReject(registration.id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-rose-700 hover:shadow-md"
                >
                  <XCircle className="h-4 w-4" /> Từ chối
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

