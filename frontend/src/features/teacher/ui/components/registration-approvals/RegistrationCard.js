import React from 'react';
import { CheckCircle, XCircle, Eye, Award, Users, MapPin } from 'lucide-react';
import { getUserAvatar } from '../../../../../shared/lib/avatar';
import { getBestActivityImage } from '../../../../../shared/lib/activityImages';

const STATUS_BADGES = {
  cho_duyet: 'bg-amber-50 text-amber-700 border-amber-200',
  da_duyet: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  tu_choi: 'bg-rose-50 text-rose-700 border-rose-200',
  da_tham_gia: 'bg-indigo-50 text-indigo-700 border-indigo-200'
};

const STATUS_LABELS = {
  cho_duyet: 'Chờ duyệt',
  da_duyet: 'Đã duyệt',
  tu_choi: 'Từ chối',
  da_tham_gia: 'Đã tham gia'
};

export default function RegistrationCard({
  registration,
  isSelected,
  onToggleSelect,
  isWritable,
  onApprove,
  onReject,
  onViewDetail,
  viewMode
}) {
  if (!registration) return null;

  const student = registration.sinh_vien || {};
  const activity = registration.hoat_dong || {};
  const statusKey = registration.trang_thai_dk || 'cho_duyet';
  const badgeClass = STATUS_BADGES[statusKey] || 'bg-gray-100 text-gray-600 border-gray-200';
  const isPending = statusKey === 'cho_duyet';

  // Get avatar object (returns {src, alt, fallback, hasValidAvatar})
  const avatarData = getUserAvatar(student);

  const cardContent = (
    <>
      <div className="flex items-start gap-3">
        <label className="inline-flex items-center cursor-pointer mt-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect?.(registration.id)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        </label>
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-3">
              {avatarData.hasValidAvatar ? (
                <img
                  src={avatarData.src}
                  alt={avatarData.alt}
                  className="w-12 h-12 rounded-full object-cover border border-white shadow"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg border border-white shadow">
                  {avatarData.fallback}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-900">{student.ho_ten || 'Chưa rõ tên'}</p>
                <p className="text-xs text-gray-500">{student.mssv || '---'} · {student.ten_lop || 'Không rõ lớp'}</p>
              </div>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${badgeClass}`}>
              {STATUS_LABELS[statusKey] || 'Chưa xác định'}
            </span>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 flex gap-3">
            <img
              src={getBestActivityImage(activity.hinh_anh, activity.loai_hd?.ten_loai_hd)}
              alt={activity.ten_hd}
              className="w-20 h-20 rounded-xl object-cover"
            />
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-sm font-bold text-gray-900">{activity.ten_hd}</p>
                <p className="text-xs text-gray-500 line-clamp-2">{activity.mo_ta || 'Không có mô tả'}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Award className="h-3 w-3 text-amber-500" />
                  {activity.diem_rl || 0} điểm
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-3 w-3 text-blue-500" />
                  {activity.lop_id ? `Lớp ${activity.lop_id}` : 'Toàn trường'}
                </div>
                {activity.dia_diem && (
                  <div className="flex items-center gap-1.5 col-span-2">
                    <MapPin className="h-3 w-3 text-rose-500" />
                    {activity.dia_diem}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 mt-4">
        <button
          onClick={() => onViewDetail?.(activity)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-indigo-600 border border-indigo-100 bg-indigo-50 hover:bg-indigo-100"
        >
          <Eye className="h-4 w-4" />
          Xem hoạt động
        </button>
        {isPending && isWritable && (
          <>
            <button
              onClick={() => onReject?.(registration)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-rose-600 border border-rose-100 bg-rose-50 hover:bg-rose-100"
            >
              <XCircle className="h-4 w-4" />
              Từ chối
            </button>
            <button
              onClick={() => onApprove?.(registration)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 shadow"
            >
              <CheckCircle className="h-4 w-4" />
              Duyệt
            </button>
          </>
        )}
      </div>
    </>
  );

  if (viewMode === 'list') {
    return (
      <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-4 hover:shadow-lg transition-all">
        {cardContent}
      </div>
    );
  }

  return (
    <div className="group relative h-full">
      <div className="relative bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-xl transition-all flex flex-col h-full">
        <div className="flex-1">{cardContent}</div>
      </div>
    </div>
  );
}


