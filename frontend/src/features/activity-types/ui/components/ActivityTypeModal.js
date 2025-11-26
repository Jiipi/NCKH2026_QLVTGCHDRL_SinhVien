import React from 'react';
import { X, Check, Tag, FileText, Award, Palette } from 'lucide-react';

export default function ActivityTypeModal({
  show,
  form,
  onFormChange,
  onSubmit,
  onClose,
  loading
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-2xl">
        <div
          className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto activity-type-modal"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {form.id ? 'Chỉnh sửa' : 'Tạo mới'}
              </p>
              <h2 className="text-2xl font-semibold text-gray-900">
                {form.id ? 'Chỉnh sửa loại hoạt động' : 'Tạo loại hoạt động mới'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="p-6 space-y-6 bg-gray-50/60">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                <Tag className="h-4 w-4 text-indigo-600" />
                Tên loại hoạt động
                <span className="text-rose-500">*</span>
              </label>
              <input
                value={form.ten_loai_hd}
                onChange={e => onFormChange({ ...form, ten_loai_hd: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                required
                placeholder="Ví dụ: Đoàn - Hội"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                Mô tả
              </label>
              <textarea
                value={form.mo_ta}
                onChange={e => onFormChange({ ...form, mo_ta: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none bg-white"
                placeholder="Mô tả chi tiết..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                  <Award className="h-4 w-4 text-indigo-600" />
                  Điểm mặc định
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.diem_mac_dinh}
                  onChange={e => onFormChange({ ...form, diem_mac_dinh: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                  <Award className="h-4 w-4 text-emerald-600" />
                  Điểm tối đa
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.diem_toi_da}
                  onChange={e => onFormChange({ ...form, diem_toi_da: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                <Palette className="h-4 w-4 text-indigo-600" />
                Màu sắc
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.mau_sac}
                  onChange={e => onFormChange({ ...form, mau_sac: e.target.value })}
                  className="h-12 w-20 p-1 border border-gray-300 rounded-lg cursor-pointer bg-white"
                />
                <input
                  type="text"
                  value={form.mau_sac}
                  onChange={e => onFormChange({ ...form, mau_sac: e.target.value })}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white"
                  placeholder="#3B82F6"
                />
              </div>
            </div>

            <div className="rounded-xl p-4 border border-gray-200 bg-white">
              <p className="text-sm font-semibold text-gray-900 mb-3">Xem trước</p>
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                <div className="h-40 flex items-center justify-center p-4" style={{ backgroundColor: form.mau_sac || '#EEF2FF' }}>
                  <div className="text-white font-semibold drop-shadow text-lg">{form.ten_loai_hd || 'Tên loại hoạt động'}</div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">{form.ten_loai_hd || 'Tên loại hoạt động'}</h4>
                  <p className="text-sm text-gray-600 mb-3">{form.mo_ta || 'Mô tả loại hoạt động'}</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-100">
                      {form.diem_mac_dinh} điểm mặc định
                    </span>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-100">
                      {form.diem_toi_da} điểm tối đa
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-xl font-semibold transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 border border-indigo-600 font-semibold disabled:opacity-60 transition"
              >
                <Check className="h-5 w-5" />
                {form.id ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </form>
        </div>
        <style>{`
          .activity-type-modal::-webkit-scrollbar {
            width: 0;
            height: 0;
          }
        `}</style>
      </div>
    </div>
  );
}

