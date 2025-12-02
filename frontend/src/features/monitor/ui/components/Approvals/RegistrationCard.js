import React from 'react';
import { Calendar, Clock, MapPin, Award, Eye, CheckCircle, XCircle, QrCode } from 'lucide-react';
import { getUserAvatar } from '../../../../../shared/lib/avatar';
import ActivityImageSlideshow from '../../../../../shared/components/ActivityImageSlideshow';

/**
 * RegistrationCard Component - Hiển thị thẻ đăng ký hoạt động
 * Hỗ trợ 2 chế độ: list và grid
 */
export default function RegistrationCard({
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
  onShowQR,
  isWritable = true
}) {
  const student = registration.sinh_vien?.nguoi_dung;
  const activity = registration.hoat_dong;
  const approvedBy = registration.trang_thai_dk === 'da_duyet' ? roleLabel(registration.approvedByRole) : null;
  const rejectedBy = registration.trang_thai_dk === 'tu_choi' ? roleLabel(registration.rejectedByRole) : null;

  // LIST MODE
  if (displayViewMode === 'list') {
    return (
      <div className={`group relative ${isSelected ? 'ring-4 ring-blue-500 ring-offset-2' : ''}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-200"></div>
        <div className={`relative bg-white border-2 rounded-xl hover:shadow-lg transition-all duration-200 ${isPending ? 'border-amber-200 shadow-lg shadow-amber-100' : 'border-gray-200'}`}>
          <div className="flex items-stretch gap-4 p-4">
            <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
              <ActivityImageSlideshow
                images={activity?.hinh_anh}
                activityType={activity?.loai_hd?.ten_loai_hd}
                alt={activity?.ten_hd || 'Hoạt động'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                showDots={true}
                dotsPosition="bottom"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
              <div className="absolute top-2 left-2 pointer-events-none">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors[registration.trang_thai_dk]}`}>
                  {statusLabels[registration.trang_thai_dk]}
                </span>
              </div>
              {activity?.diem_rl && (
                <div className="absolute bottom-2 left-2 pointer-events-none">
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
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-600 truncate">{activity?.loai_hd?.ten_loai_hd || 'Chưa phân loại'}</span>
                  </div>
                  {activity?.ngay_bd && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-900 font-medium">{formatDate(activity.ngay_bd)}</span>
                    </div>
                  )}
                  {activity?.dia_diem && (
                    <div className="flex items-center gap-1.5 col-span-2">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-600 truncate">{activity.dia_diem}</span>
                    </div>
                  )}
                  {!isPending && approvedBy && (
                    <div className="flex items-center gap-1.5 col-span-2">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-gray-600 truncate">Người duyệt: {approvedBy}</span>
                    </div>
                  )}
                  {!isPending && rejectedBy && (
                    <div className="flex items-center gap-1.5 col-span-2">
                      <XCircle className="h-3.5 w-3.5 text-rose-500" />
                      <span className="text-gray-600 truncate">Người từ chối: {rejectedBy}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-2 flex-shrink-0">
              {isPending && registration.canProcess !== false && isWritable ? (
                <>
                  <button 
                    onClick={() => onApprove(registration)} 
                    disabled={processing} 
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Duyệt
                  </button>
                  <button 
                    onClick={() => onReject(registration)} 
                    disabled={processing} 
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle className="h-4 w-4" />
                    Từ chối
                  </button>
                </>
              ) : registration.trang_thai_dk === 'da_duyet' && onShowQR ? (
                <>
                  <button 
                    onClick={() => onShowQR(activity?.id)} 
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px]"
                  >
                    <QrCode className="h-4 w-4" />
                    Mã QR
                  </button>
                  <button 
                    onClick={() => onViewDetails(activity?.id)} 
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px]"
                  >
                    <Eye className="h-4 w-4" />
                    Chi tiết
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => onViewDetails(activity?.id)} 
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px]"
                >
                  <Eye className="h-4 w-4" />
                  Chi tiết
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // GRID MODE
  return (
    <div className={`group relative h-full ${isSelected ? 'ring-4 ring-blue-500 ring-offset-2' : ''}`}>
      <div className={`relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col h-full ${isPending ? 'border-amber-200 shadow-lg shadow-amber-100' : ''}`}>
        <div className="relative w-full h-36 overflow-hidden">
          <ActivityImageSlideshow
            images={activity?.hinh_anh}
            activityType={activity?.loai_hd?.ten_loai_hd}
            alt={activity?.ten_hd || 'Hoạt động'}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
            showDots={true}
            dotsPosition="bottom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none"></div>
          <div className="absolute top-2 left-2 pointer-events-none">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors[registration.trang_thai_dk]}`}>
              {statusLabels[registration.trang_thai_dk]}
            </span>
          </div>
          {activity?.diem_rl && (
            <div className="absolute bottom-2 right-2 pointer-events-none">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/95 backdrop-blur-sm text-white rounded-lg text-xs font-bold shadow-md">
                <Award className="h-3 w-3" />
                +{activity.diem_rl}
              </span>
            </div>
          )}
          {isPending && (
            <div className="absolute bottom-2 left-2 z-20">
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
        <div className="flex-1 p-4 space-y-3 relative z-10">
          <div>
            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors mb-1.5 leading-tight">
              {activity?.ten_hd || 'Hoạt động'}
            </h3>
            {activity?.loai_hd?.ten_loai_hd && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-200">
                <Calendar className="h-3 w-3" />
                {activity.loai_hd.ten_loai_hd}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
            {(() => {
              const avatar = getUserAvatar(student);
              return avatar.hasValidAvatar ? (
                <img 
                  src={avatar.src} 
                  alt={avatar.alt} 
                  className="w-10 h-10 rounded-lg object-cover shadow-sm ring-1 ring-white" 
                  onError={(e) => { 
                    e.target.onerror = null; 
                    e.target.style.display = 'none'; 
                    if (e.target.nextElementSibling) {
                      e.target.nextElementSibling.style.display = 'flex';
                    }
                  }} 
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-1 ring-white">
                  {avatar.fallback}
                </div>
              );
            })()}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{student?.ho_ten || 'Không rõ tên'}</p>
              <p className="text-xs text-gray-600 truncate">MSSV: {registration.sinh_vien?.mssv}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {activity?.ngay_bd && (
              <div className="flex items-center gap-1.5 text-xs">
                <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-900 font-medium">{formatDate(activity.ngay_bd)}</span>
              </div>
            )}
            {activity?.dia_diem && (
              <div className="flex items-center gap-1.5 text-xs">
                <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600 truncate">{activity.dia_diem}</span>
              </div>
            )}
            {!isPending && approvedBy && (
              <div className="flex items-center gap-1.5 text-xs">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                <span className="text-gray-600 truncate">Người duyệt: {approvedBy}</span>
              </div>
            )}
            {!isPending && rejectedBy && (
              <div className="flex items-center gap-1.5 text-xs">
                <XCircle className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
                <span className="text-gray-600 truncate">Người từ chối: {rejectedBy}</span>
              </div>
            )}
          </div>
        </div>
        <div className="p-3 pt-0 mt-auto flex gap-2">
          {isPending && registration.canProcess !== false && isWritable ? (
            <>
              <button 
                onClick={() => onApprove(registration)} 
                disabled={processing} 
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Duyệt
              </button>
              <button 
                onClick={() => onReject(registration)} 
                disabled={processing} 
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="h-3.5 w-3.5" />
                Từ chối
              </button>
            </>
          ) : registration.trang_thai_dk === 'da_duyet' && onShowQR ? (
            <>
              <button 
                onClick={() => onShowQR(activity?.id)} 
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200"
              >
                <QrCode className="h-3.5 w-3.5" />
                Mã QR
              </button>
              <button 
                onClick={() => onViewDetails(activity?.id)} 
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Eye className="h-3.5 w-3.5" />
                Chi tiết
              </button>
            </>
          ) : (
            <button 
              onClick={() => onViewDetails(activity?.id)} 
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Eye className="h-3.5 w-3.5" />
              Chi tiết
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

