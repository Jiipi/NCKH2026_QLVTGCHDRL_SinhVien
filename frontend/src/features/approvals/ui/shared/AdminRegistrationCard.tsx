import React from 'react';
import { Calendar, Clock, MapPin, Award, Eye, CheckCircle, XCircle } from 'lucide-react';
import { getBestActivityImage } from '../../../../shared/lib/activityImages';
import { getUserAvatar } from '../../../../shared/lib/avatar';

/**
 * AdminRegistrationCard Component - Hiển thị thẻ đăng ký hoạt động cho Admin
 * Hỗ trợ 2 chế độ: list và grid
 */
export default function AdminRegistrationCard({
  registration,
  displayViewMode,
  isSelected,
  isPending,
  statusLabels,
  statusColors,
  formatDate,
  roleLabel,
  processing,
  onToggleSelect,
  onApprove,
  onReject,
  onViewDetails,
  isWritable = true
}) {
  const student = registration.sinh_vien?.nguoi_dung;
  const activity = registration.hoat_dong;
  const activityImage = getBestActivityImage(activity);
  const approverRole = registration.trang_thai_dk === 'da_duyet' ? roleLabel(registration.approvedByRole) : null;
  const rejectorRole = registration.trang_thai_dk === 'tu_choi' ? roleLabel(registration.rejectedByRole) : null;
  const approvedBy = approverRole ? (registration.approvedByName ? `${registration.approvedByName} (${approverRole})` : approverRole) : null;
  const rejectedBy = rejectorRole ? (registration.approvedByName ? `${registration.approvedByName} (${rejectorRole})` : rejectorRole) : null;

  // LIST MODE
  if (displayViewMode === 'list') {
    return (
      <div className={`group relative ${isSelected ? 'ring-4 ring-indigo-100/70 dark:ring-indigo-400/20' : ''}`}>
        <div className="absolute inset-0 rounded-[1.5rem] bg-indigo-500/5 opacity-0 blur transition-opacity duration-200 group-hover:opacity-100" />
        <div className={`relative rounded-[1.5rem] border bg-white/60 shadow-sm backdrop-blur-2xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/75 hover:shadow-lg dark:bg-slate-900/60 dark:hover:bg-white/10 ${isPending ? 'border-amber-200/70 dark:border-amber-400/20' : 'border-white/60 dark:border-white/10'}`}>
          <div className="flex items-stretch gap-4 p-4">
            <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
              <img src={activityImage} alt={activity?.ten_hd || 'Hoạt động'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              <div className="absolute top-2 left-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors[registration.trang_thai_dk]}`}>
                  {statusLabels[registration.trang_thai_dk]}
                </span>
              </div>
              {activity?.diem_rl && (
                <div className="absolute bottom-2 left-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/90 backdrop-blur-sm text-white shadow-sm text-xs font-bold">
                    <Award className="h-3 w-3" />
                    +{activity.diem_rl}
                  </span>
                </div>
              )}
              {isPending && (
                <div className="absolute bottom-2 right-2 z-20">
                  <label className="flex cursor-pointer items-center gap-1 rounded-xl border border-white/70 bg-white/80 px-2 py-1 shadow-sm backdrop-blur-xl transition-all hover:bg-white dark:border-white/10 dark:bg-slate-900/80 dark:hover:bg-slate-900" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={isSelected} 
                      onChange={() => onToggleSelect(registration.id)} 
                      className="h-4 w-4 cursor-pointer rounded border-2 accent-indigo-600" 
                      onClick={(e) => e.stopPropagation()} 
                    />
                  </label>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <h3 className="mb-2 line-clamp-1 text-base font-bold text-slate-950 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-300">
                  {activity?.ten_hd || 'Hoạt động'}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  {(() => {
                    const avatar = getUserAvatar(student);
                    return avatar.hasValidAvatar ? (
                      <img 
                        src={avatar.src} 
                        alt={avatar.alt} 
                        className="w-8 h-8 rounded-lg object-cover shadow-sm ring-1 ring-white" 
                        onError={(e) => { 
                          const target = e.target as HTMLImageElement;
                          target.onerror = null; 
                          target.style.display = 'none'; 
                          const nextSibling = target.nextElementSibling as HTMLElement | null;
                          if (nextSibling) {
                            nextSibling.style.display = 'flex';
                          }
                        }} 
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-sm ring-1 ring-white">
                        {avatar.fallback}
                      </div>
                    );
                  })()}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{student?.ho_ten || 'Không rõ tên'}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">MSSV: {registration.sinh_vien?.mssv}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(activity?.ngay_bd)}</span>
                  {activity?.dia_diem && <span className="flex items-center gap-1"><MapPin size={12} /> {activity.dia_diem}</span>}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 border-t border-white/60 pt-3 dark:border-white/10">
                {isPending && isWritable ? (
                  <>
                    <button onClick={() => onApprove(registration)} disabled={processing} className="flex flex-1 items-center justify-center gap-1 rounded-2xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50">
                      <CheckCircle size={14} /> Duyệt
                    </button>
                    <button onClick={() => onReject(registration)} disabled={processing} className="flex flex-1 items-center justify-center gap-1 rounded-2xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50">
                      <XCircle size={14} /> Từ chối
                    </button>
                  </>
                ) : (
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {approvedBy && `Đã duyệt bởi: ${approvedBy}`}
                    {rejectedBy && `Từ chối bởi: ${rejectedBy}`}
                  </div>
                )}
                <button onClick={() => onViewDetails(activity?.id)} className="flex items-center gap-1 rounded-2xl border border-white/70 bg-white/55 px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm backdrop-blur-xl transition hover:bg-white/75 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10">
                  <Eye size={14} /> Chi tiết
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // GRID MODE
  return (
    <div className={`group relative ${isSelected ? 'ring-4 ring-indigo-100/70 dark:ring-indigo-400/20' : ''}`}>
      <div className="absolute inset-0 rounded-[1.5rem] bg-indigo-500/5 opacity-0 blur transition-opacity duration-200 group-hover:opacity-100" />
      <div className={`relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border bg-white/60 shadow-sm backdrop-blur-2xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/75 hover:shadow-lg dark:bg-slate-900/60 dark:hover:bg-white/10 ${isPending ? 'border-amber-200/70 dark:border-amber-400/20' : 'border-white/60 dark:border-white/10'}`}>
        <div className="relative h-32 overflow-hidden">
          <img src={activityImage} alt={activity?.ten_hd || 'Hoạt động'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors[registration.trang_thai_dk]}`}>
              {statusLabels[registration.trang_thai_dk]}
            </span>
            {activity?.diem_rl && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/90 backdrop-blur-sm text-white shadow-sm text-xs font-bold">
                <Award className="h-3 w-3" />
                +{activity.diem_rl}
              </span>
            )}
          </div>
          {isPending && (
            <div className="absolute bottom-2 right-2 z-20">
              <label className="flex cursor-pointer items-center gap-1 rounded-xl border border-white/70 bg-white/80 px-2 py-1 shadow-sm backdrop-blur-xl transition-all hover:bg-white dark:border-white/10 dark:bg-slate-900/80 dark:hover:bg-slate-900" onClick={(e) => e.stopPropagation()}>
                <input 
                  type="checkbox" 
                  checked={isSelected} 
                  onChange={() => onToggleSelect(registration.id)} 
                  className="h-4 w-4 cursor-pointer rounded border-2 accent-indigo-600" 
                  onClick={(e) => e.stopPropagation()} 
                />
              </label>
            </div>
          )}
        </div>
        <div className="flex-1 p-4 flex flex-col">
          <h3 className="mb-2 line-clamp-2 text-sm font-bold text-slate-950 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-300">
            {activity?.ten_hd || 'Hoạt động'}
          </h3>
          <div className="flex items-center gap-2 mb-3">
            {(() => {
              const avatar = getUserAvatar(student);
              return avatar.hasValidAvatar ? (
                <img 
                  src={avatar.src} 
                  alt={avatar.alt} 
                  className="w-8 h-8 rounded-lg object-cover shadow-sm ring-1 ring-white" 
                  onError={(e) => { 
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; 
                    target.style.display = 'none'; 
                    const nextSibling = target.nextElementSibling as HTMLElement | null;
                    if (nextSibling) {
                      nextSibling.style.display = 'flex';
                    }
                  }} 
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-sm ring-1 ring-white">
                  {avatar.fallback}
                </div>
              );
            })()}
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{student?.ho_ten || 'Không rõ tên'}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{registration.sinh_vien?.mssv}</p>
            </div>
          </div>
          <div className="mb-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Calendar size={12} />
            <span>{formatDate(activity?.ngay_bd)}</span>
          </div>
          <div className="mt-auto flex gap-2 border-t border-white/60 pt-3 dark:border-white/10">
            {isPending && isWritable ? (
              <>
                <button onClick={() => onApprove(registration)} disabled={processing} className="flex flex-1 items-center justify-center gap-1 rounded-2xl bg-emerald-600 px-2 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50">
                  <CheckCircle size={12} /> Duyệt
                </button>
                <button onClick={() => onReject(registration)} disabled={processing} className="flex flex-1 items-center justify-center gap-1 rounded-2xl bg-rose-600 px-2 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50">
                  <XCircle size={12} /> Từ chối
                </button>
              </>
            ) : (
              <div className="flex-1 py-1.5 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                {approvedBy && `Đã duyệt: ${approvedBy}`}
                {rejectedBy && `Từ chối: ${rejectedBy}`}
              </div>
            )}
            <button onClick={() => onViewDetails(activity?.id)} className="rounded-2xl border border-white/70 bg-white/55 px-2 py-1.5 text-xs text-slate-600 shadow-sm backdrop-blur-xl transition hover:bg-white/75 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10">
              <Eye size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

