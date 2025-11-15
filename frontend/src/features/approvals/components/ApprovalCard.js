import React from 'react';
import { UserCheck, UserX, Eye, CheckCircle, XCircle, Calendar, Clock, MapPin, Award } from 'lucide-react';
import { getBestActivityImage } from '../../../shared/lib/activityImages';
import { getUserAvatar } from '../../../shared/lib/avatar';

const statusInfo = {
  'cho_duyet': { label: 'Chờ duyệt', color: 'border-amber-300' },
  'da_duyet': { label: 'Đã duyệt', color: 'border-green-300' },
  'tu_choi': { label: 'Từ chối', color: 'border-red-300' },
  'da_tham_gia': { label: 'Đã tham gia', color: 'border-blue-300' }
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
        return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch { return '—'; }
};

export default function ApprovalCard({ 
    registration, 
    onApprove, 
    onReject, 
    onSelect, 
    onViewActivity, 
    isSelected, 
    isProcessing 
}) {
    const student = registration.sinh_vien?.nguoi_dung;
    const activity = registration.hoat_dong;
    const isPending = registration.trang_thai_dk === 'cho_duyet';
    const avatar = getUserAvatar(student);

    return (
        <div className={`bg-white rounded-xl border-2 transition-all hover:shadow-lg ${isSelected ? 'ring-4 ring-blue-400' : ''} ${statusInfo[registration.trang_thai_dk]?.color || 'border-gray-200'}`}>
            {/* Activity Info */}
            <div className="flex items-center gap-4 p-4 border-b">
                <img src={getBestActivityImage(activity)} alt={activity?.ten_hd} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1">
                    <p className="font-bold text-gray-800 line-clamp-2">{activity?.ten_hd || 'Hoạt động không tên'}</p>
                    <div className="text-xs text-gray-500 flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1"><Calendar size={14}/> {formatDate(activity?.ngay_bd)}</span>
                        <span className="flex items-center gap-1"><Award size={14}/> +{activity?.diem_rl || 0}</span>
                    </div>
                </div>
            </div>

            {/* Student Info */}
            <div className="flex items-center gap-3 p-4">
                <img src={avatar.src} alt={avatar.alt} className="w-10 h-10 rounded-full object-cover" onError={(e) => e.target.src = avatar.fallbackSrc} />
                <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900">{student?.ho_ten || 'Không rõ'}</p>
                    <p className="text-xs text-gray-500">MSSV: {registration.sinh_vien?.mssv}</p>
                </div>
                {isPending && (
                    <input 
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelect(registration.id)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 p-4 border-t">
                {isPending ? (
                    <>
                        <button onClick={() => onApprove(registration)} disabled={isProcessing} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50">
                            <UserCheck size={16} /> Duyệt
                        </button>
                        <button onClick={() => onReject(registration)} disabled={isProcessing} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50">
                            <UserX size={16} /> Từ chối
                        </button>
                    </>
                ) : (
                    <div className="w-full text-center text-sm font-semibold text-gray-500">
                        {statusInfo[registration.trang_thai_dk]?.label || 'Đã xử lý'}
                    </div>
                )}
                <button onClick={() => onViewActivity(activity?.id)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition">
                    <Eye size={16} />
                </button>
            </div>
        </div>
    );
}

