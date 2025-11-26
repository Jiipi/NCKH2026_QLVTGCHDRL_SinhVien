import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckCircle,
  Edit,
  Eye,
  MapPin,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react';
import { getActivityImage } from '../../../shared/lib/activityImages';

const statusLabels = {
  cho_duyet: 'Chờ duyệt',
  da_duyet: 'Đã duyệt',
  tu_choi: 'Từ chối',
  da_huy: 'Đã hủy',
  ket_thuc: 'Kết thúc'
};

const statusColors = {
  cho_duyet: 'bg-amber-50 text-amber-700 border-amber-200',
  da_duyet: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  tu_choi: 'bg-rose-50 text-rose-700 border-rose-200',
  da_huy: 'bg-slate-50 text-slate-700 border-slate-200',
  ket_thuc: 'bg-purple-50 text-purple-700 border-purple-200'
};

export const AdminActivityCard = ({ activity, onApprove, onReject, onDelete, isProcessing }) => {
  const navigate = useNavigate();

  const deadline = activity.han_dk || activity.han_dang_ky;
  const isOpenForRegistration = (() => {
    const now = new Date();
    const dl = deadline ? new Date(deadline) : (activity.ngay_bd ? new Date(activity.ngay_bd) : null);
    return dl && dl > now && (activity.trang_thai === 'da_duyet' || activity.trang_thai === 'cho_duyet');
  })();

  const handleEdit = () => navigate(`/admin/activities/${activity.id}/edit`);
  const handleView = () => navigate(`/activities/${activity.id}`); // Assuming a generic detail view

  return (
    <div className={`group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden ${
      isOpenForRegistration ? 'border-emerald-200 shadow-lg shadow-emerald-100' : 'border-gray-200 hover:border-indigo-200'
    }`}>
      {isOpenForRegistration && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-bl-2xl rounded-tr-lg shadow-lg flex items-center gap-2">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-bold">Đang mở ĐK</span>
          </div>
        </div>
      )}

      <img
        src={getActivityImage(activity.hinh_anh, activity.loai_hd?.ten_loai_hd)}
        alt={activity.ten_hd}
        className="w-full h-44 object-cover"
      />

      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 flex-1 h-14">{activity.ten_hd}</h3>
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${statusColors[activity.trang_thai] || 'bg-gray-50 text-gray-700 border-gray-200'} whitespace-nowrap`}>
            {statusLabels[activity.trang_thai] || activity.trang_thai}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600 bg-gray-50 rounded-lg p-2 min-w-0">
            <Calendar className="h-4 w-4 text-indigo-600 flex-shrink-0" />
            <p className="truncate">{activity.ngay_bd ? new Date(activity.ngay_bd).toLocaleDateString('vi-VN') : '—'}</p>
          </div>
          <div className="flex items-center gap-2 text-gray-600 bg-gray-50 rounded-lg p-2 min-w-0">
            <MapPin className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <p className="truncate">{activity.dia_diem || '—'}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
          <button onClick={handleView} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-semibold transition-colors">
            <Eye className="h-4 w-4" /> Xem
          </button>
          {(activity.trang_thai === 'cho_duyet') ? (
            <>
              <button onClick={() => onApprove(activity.id)} disabled={isProcessing} className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-sm font-semibold transition-colors disabled:opacity-50">
                <CheckCircle className="h-4 w-4" /> Duyệt
              </button>
              <button onClick={() => onReject(activity.id)} disabled={isProcessing} className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-100 text-rose-700 hover:bg-rose-200 text-sm font-semibold transition-colors disabled:opacity-50">
                <XCircle className="h-4 w-4" /> Từ chối
              </button>
            </>
          ) : (
            <>
              <button onClick={handleEdit} className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 text-sm font-semibold transition-colors">
                <Edit className="h-4 w-4" /> Sửa
              </button>
              <button onClick={() => onDelete(activity.id)} disabled={isProcessing} className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-100 text-rose-600 border border-rose-200 hover:bg-rose-200 text-sm font-semibold transition-colors disabled:opacity-50">
                <Trash2 className="h-4 w-4" /> Xóa
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
