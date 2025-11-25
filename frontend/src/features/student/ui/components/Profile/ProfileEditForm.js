import React from 'react';
import AvatarUpload from '../../../../../entities/user/ui/Avatar';

export default function ProfileEditForm({
  formData,
  setFormData,
  profile,
  formatDateVN,
  getGenderDisplay,
  onSubmit,
  onCancel
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="bg-white rounded-lg p-4 border border-blue-200 space-y-4">
        <h4 className="text-sm font-semibold text-blue-700">Trường có thể chỉnh sửa</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Họ và tên *"
            type="text"
            value={formData.ho_ten}
            onChange={(value) => setFormData((prev) => ({ ...prev, ho_ten: value }))}
            required
          />
          <InputField
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(value) => setFormData((prev) => ({ ...prev, email: value }))}
            required
          />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">Ảnh đại diện</label>
            <AvatarUpload
              value={formData.anh_dai_dien}
              onChange={(url) => setFormData((prev) => ({ ...prev, anh_dai_dien: url }))}
              size={200}
            />
          </div>
        </div>
      </section>

      <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
        <strong>⚠️ Lưu ý:</strong> Bạn chỉ có thể chỉnh sửa <strong>Họ tên</strong>, <strong>Email</strong> và
        <strong> Ảnh đại diện</strong>. Các thông tin khác chỉ được cập nhật bởi Ban chủ nhiệm khoa.
      </section>

      <section className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Trường không thể chỉnh sửa</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'MSSV', value: profile?.mssv || profile?.maso || '' },
            { label: 'Lớp', value: profile?.lop || '' },
            { label: 'Khoa', value: profile?.khoa || '' },
            { label: 'Niên khóa', value: profile?.nienkhoa || '' },
            { label: 'Ngày sinh', value: profile?.ngaysinh || profile?.ngay_sinh ? formatDateVN(profile?.ngaysinh || profile?.ngay_sinh) : '' },
            { label: 'Giới tính', value: getGenderDisplay(profile?.gt) },
            { label: 'Số điện thoại', value: profile?.sdt || '' },
            { label: 'Địa chỉ', value: profile?.dia_chi || '' }
          ].map(({ label, value }) => (
            <InputField key={label} label={label} value={value} disabled />
          ))}
        </div>
      </section>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Lưu thay đổi
        </button>
      </div>
    </form>
  );
}

function InputField({ label, type = 'text', value, onChange, disabled, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        required={required}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          disabled ? 'border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed' : 'border-gray-300'
        }`}
      />
    </div>
  );
}

