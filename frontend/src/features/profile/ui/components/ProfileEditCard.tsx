import React from 'react';
import { Save, X } from 'lucide-react';
import AvatarUpload from '../../../../shared/components/common/AvatarUpload';
import type { ProfileTheme } from '../profileTheme';

interface ProfileEditCardProps {
  title?: string;
  formData: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
  theme: ProfileTheme;
  saving?: boolean;
  showAvatarUpload?: boolean;
  children?: React.ReactNode;
}

export default function ProfileEditCard({
  title = 'Chỉnh sửa hồ sơ',
  formData,
  setFormData,
  onSubmit,
  onCancel,
  theme,
  saving = false,
  showAvatarUpload = true,
  children
}: ProfileEditCardProps) {
  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md md:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-black text-slate-950 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">Cập nhật các thông tin được phép chỉnh sửa.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {showAvatarUpload && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <label className="mb-3 block text-sm font-black text-slate-700 dark:text-slate-200">Ảnh đại diện</label>
            <AvatarUpload value={formData.anh_dai_dien || ''} onChange={(value) => updateField('anh_dai_dien', value)} size={144} disabled={saving} />
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">Họ và tên</span>
            <input
              type="text"
              value={formData.ho_ten || ''}
              onChange={(event) => updateField('ho_ten', event.target.value)}
              disabled={saving}
              className={`w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm outline-none transition-all focus:border-transparent focus:ring-4 disabled:opacity-60 ${theme.ring}`}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">Email</span>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(event) => updateField('email', event.target.value)}
              disabled={saving}
              className={`w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm outline-none transition-all focus:border-transparent focus:ring-4 disabled:opacity-60 ${theme.ring}`}
            />
          </label>
        </div>

        {children}

        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-black text-gray-700 transition-all duration-200 hover:bg-gray-100 disabled:opacity-60"
          >
            <X className="h-4 w-4" />
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-black text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${theme.primaryButton}`}
          >
            <Save className="h-4 w-4" />
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </section>
  );
}
