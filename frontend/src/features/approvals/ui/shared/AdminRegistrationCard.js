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
      <div className={`group relative ${isSelected ? 'ring-4 ring-blue-500 ring-offset-2' : ''}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-200"></div>
        <div className={`relative bg-white border-2 rounded-xl hover:shadow-lg transition-all duration-200 ${isPending ? 'border-amber-200 shadow-lg shadow-amber-100' : 'border-gray-200'}`}>
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
                  <label className="flex items-center gap-1 cursor-pointer bg-white/95 backdrop-blur-sm rounded px-2 py-1 shadow-lg hover:bg-white transition-all" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={isSelected} 
                      onChange={() => onToggleSelect(registration.id)} 
                      className="w-4 h-4 rounded border-2 cursor-pointer accent-blue-600" 
                      onClick={(e) => e.stopPropagation()} 
                    />
                  </label>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2">
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
                          e.target.onerror = null; 
                          e.target.style.display = 'none'; 
                          if (e.target.nextElementSibling) {
                            e.target.nextElementSibling.style.display = 'flex';
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
                    <p className="text-sm font-semibold text-gray-900 truncate">{student?.ho_ten || 'Không rõ tên'}</p>
                    <p className="text-xs text-gray-600 truncate">MSSV: {registration.sinh_vien?.mssv}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(activity?.ngay_bd)}</span>
                  {activity?.dia_diem && <span className="flex items-center gap-1"><MapPin size={12} /> {activity.dia_diem}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                {isPending && isWritable ? (
                  <>
                    <button onClick={() => onApprove(registration)} disabled={processing} className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-1">
                      <CheckCircle size={14} /> Duyệt
                    </button>
                    <button onClick={() => onReject(registration)} disabled={processing} className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-1">
                      <XCircle size={14} /> Từ chối
                    </button>
                  </>
                ) : (
                  <div className="text-xs text-gray-500">
                    {approvedBy && `Đã duyệt bởi: ${approvedBy}`}
                    {rejectedBy && `Từ chối bởi: ${rejectedBy}`}
                  </div>
                )}
                <button onClick={() => onViewDetails(activity?.id)} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition text-xs font-medium flex items-center gap-1">
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
    <div className={`group relative ${isSelected ? 'ring-4 ring-blue-500 ring-offset-2' : ''}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl blur opacity-5 group-hover:opacity-10 transition-opacity duration-200"></div>
      <div className={`relative bg-white border-2 rounded-xl hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col h-full ${isPending ? 'border-amber-200 shadow-lg shadow-amber-100' : 'border-gray-200'}`}>
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
              <label className="flex items-center gap-1 cursor-pointer bg-white/95 backdrop-blur-sm rounded px-2 py-1 shadow-lg hover:bg-white transition-all" onClick={(e) => e.stopPropagation()}>
                <input 
                  type="checkbox" 
                  checked={isSelected} 
                  onChange={() => onToggleSelect(registration.id)} 
                  className="w-4 h-4 rounded border-2 cursor-pointer accent-blue-600" 
                  onClick={(e) => e.stopPropagation()} 
                />
              </label>
            </div>
          )}
        </div>
        <div className="flex-1 p-4 flex flex-col">
          <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
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
                    e.target.onerror = null; 
                    e.target.style.display = 'none'; 
                    if (e.target.nextElementSibling) {
                      e.target.nextElementSibling.style.display = 'flex';
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
              <p className="text-xs font-semibold text-gray-900 truncate">{student?.ho_ten || 'Không rõ tên'}</p>
              <p className="text-xs text-gray-500 truncate">{registration.sinh_vien?.mssv}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <Calendar size={12} />
            <span>{formatDate(activity?.ngay_bd)}</span>
          </div>
          <div className="mt-auto pt-3 border-t flex gap-2">
            {isPending && isWritable ? (
              <>
                <button onClick={() => onApprove(registration)} disabled={processing} className="flex-1 px-2 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-1">
                  <CheckCircle size={12} /> Duyệt
                </button>
                <button onClick={() => onReject(registration)} disabled={processing} className="flex-1 px-2 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-1">
                  <XCircle size={12} /> Từ chối
                </button>
              </>
            ) : (
              <div className="flex-1 text-xs text-gray-500 text-center py-1.5">
                {approvedBy && `Đã duyệt: ${approvedBy}`}
                {rejectedBy && `Từ chối: ${rejectedBy}`}
              </div>
            )}
            <button onClick={() => onViewDetails(activity?.id)} className="px-2 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition text-xs">
              <Eye size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

