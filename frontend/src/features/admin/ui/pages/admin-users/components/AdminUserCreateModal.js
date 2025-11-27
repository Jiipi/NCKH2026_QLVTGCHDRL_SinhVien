import React from 'react';
import { UserPlus, X, Save } from 'lucide-react';

const inputStyle =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';

export default function AdminUserCreateModal({
  isOpen,
  draft,
  onClose,
  onChange,
  createRoleTab,
  onRoleTabChange,
  onSubmit,
  submitLoading,
  classes,
  formError
}) {
  if (!isOpen) return null;

  const handleChange = (field, value) => {
    onChange((prev) => ({ ...prev, [field]: value }));
  };

  const showStudentFields = createRoleTab === 'Sinh viên' || createRoleTab === 'Lớp trưởng';
  const showTeacherFields = createRoleTab === 'Giảng viên';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto">
        <header className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <UserPlus size={24} />
            Tạo Người Dùng Mới
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200">
            <X size={18} />
          </button>
        </header>

        <section className="p-6 space-y-6">
          <div className="flex flex-wrap gap-3">
            {['Admin', 'Giảng viên', 'Lớp trưởng', 'Sinh viên'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  onRoleTabChange(tab);
                  onChange((prev) => ({ ...prev, role: tab }));
                }}
                className={`px-4 py-2 rounded-xl border-2 font-semibold ${
                  createRoleTab === tab
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Tên đăng nhập *"
              value={draft.ten_dn || ''}
              onChange={(value) => handleChange('ten_dn', value)}
            />
            <InputField label="Họ và tên *" value={draft.ho_ten || ''} onChange={(value) => handleChange('ho_ten', value)} />
            <InputField
              type="email"
              label="Email *"
              helper="Chỉ chấp nhận email @dlu.edu.vn"
              value={draft.email || ''}
              onChange={(value) => handleChange('email', value)}
            />
            <InputField
              type="password"
              label="Mật khẩu *"
              value={draft.mat_khau || ''}
              onChange={(value) => handleChange('mat_khau', value)}
            />
            <InputField label="Vai trò" value={createRoleTab} readOnly />
            {showTeacherFields && (
              <>
                <InputField label="Khoa" value={draft.khoa || ''} onChange={(value) => handleChange('khoa', value)} />
                <InputField label="SĐT" value={draft.sdt || ''} onChange={(value) => handleChange('sdt', value)} />
              </>
            )}
          </div>

          {showStudentFields && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="MSSV *" value={draft.mssv || ''} onChange={(value) => handleChange('mssv', value)} />
              <SelectField
                label="Lớp *"
                value={draft.lop_id || ''}
                onChange={(value) => handleChange('lop_id', value)}
                options={[{ value: '', label: 'Chọn lớp' }, ...classes.map((c) => ({ value: c.id, label: `${c.ten_lop} - ${c.khoa}` }))]}
              />
              <InputField
                type="date"
                label="Ngày sinh"
                value={draft.ngay_sinh || ''}
                onChange={(value) => handleChange('ngay_sinh', value)}
              />
              <SelectField
                label="Giới tính"
                value={draft.gt || ''}
                onChange={(value) => handleChange('gt', value)}
                options={[
                  { value: '', label: 'Chọn giới tính' },
                  { value: 'nam', label: 'Nam' },
                  { value: 'nu', label: 'Nữ' },
                  { value: 'khac', label: 'Khác' }
                ]}
              />
              <InputField label="SĐT" value={draft.sdt || ''} onChange={(value) => handleChange('sdt', value)} />
              <InputField label="Địa chỉ" value={draft.dia_chi || ''} onChange={(value) => handleChange('dia_chi', value)} />
              {createRoleTab === 'Lớp trưởng' && (
                <label className="inline-flex items-center gap-3 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={!!draft.set_lop_truong}
                    onChange={(e) => handleChange('set_lop_truong', e.target.checked)}
                  />
                  Đặt làm lớp trưởng cho lớp đã chọn
                </label>
              )}
            </div>
          )}

          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-sm">{String(formError)}</div>
          )}
        </section>

        <footer className="flex justify-end gap-3 p-6 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">
            Hủy
          </button>
          <button
            onClick={onSubmit}
            disabled={submitLoading}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 disabled:opacity-60 inline-flex items-center gap-2"
          >
            <Save size={18} />
            {submitLoading ? 'Đang tạo...' : 'Tạo người dùng'}
          </button>
        </footer>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', helper, readOnly }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputStyle}
        readOnly={readOnly}
      />
      {helper && <p className="text-xs text-gray-500 mt-1">{helper}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputStyle}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

