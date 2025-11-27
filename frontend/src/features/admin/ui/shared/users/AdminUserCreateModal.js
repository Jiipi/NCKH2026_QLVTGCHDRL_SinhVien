import React from 'react';
import { UserPlus, X, Save } from 'lucide-react';

const buttonStyle = {
  padding: '8px 16px',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'all 0.2s ease'
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none'
};

export default function AdminUserCreateModal({
  isOpen,
  selectedUser,
  createRoleTab,
  onRoleTabChange,
  onClose,
  onSubmit,
  setSelectedUser,
  classes,
  formError,
  submitLoading
}) {
  if (!isOpen || !selectedUser) return null;

  const handleChange = (field, value) => {
    setSelectedUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleStudentChange = (field, value) => {
    setSelectedUser((prev) => ({ ...prev, [field]: value }));
  };

  const roleTabs = ['Admin', 'Giảng viên', 'Lớp trưởng', 'Sinh viên'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-auto shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus size={24} /> Tạo Người Dùng Mới
          </h2>
          <button onClick={onClose} style={{ ...buttonStyle, backgroundColor: '#f3f4f6', color: '#374151' }}>
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {roleTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  onRoleTabChange(tab);
                  setSelectedUser((prev) => ({ ...prev, role: tab }));
                }}
                style={{
                  ...buttonStyle,
                  padding: '6px 12px',
                  backgroundColor: createRoleTab === tab ? '#2563eb' : '#f3f4f6',
                  color: createRoleTab === tab ? '#fff' : '#374151'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Tên đăng nhập *" value={selectedUser.ten_dn || ''} onChange={(value) => handleChange('ten_dn', value)} />
            <Field label="Họ và tên *" value={selectedUser.ho_ten || ''} onChange={(value) => handleChange('ho_ten', value)} />
            <Field label="Email *" type="email" value={selectedUser.email || ''} onChange={(value) => handleChange('email', value)} helper="Chỉ chấp nhận email @dlu.edu.vn" />
            <Field label="Mật khẩu *" type="password" value={selectedUser.mat_khau || ''} onChange={(value) => handleChange('mat_khau', value)} />
            <Field label="Vai trò" value={createRoleTab} readOnly />

            {(createRoleTab === 'Sinh viên' || createRoleTab === 'Lớp trưởng') && (
              <>
                <Field label="MSSV *" value={selectedUser.mssv || ''} onChange={(value) => handleStudentChange('mssv', value)} />
                <SelectField
                  label="Lớp *"
                  value={selectedUser.lop_id || ''}
                  onChange={(value) => handleStudentChange('lop_id', value)}
                  options={[{ value: '', label: 'Chọn lớp' }, ...classes.map((c) => ({ value: c.id, label: `${c.ten_lop} - ${c.khoa}` }))]}
                />
                <Field label="Ngày sinh" type="date" value={selectedUser.ngay_sinh || ''} onChange={(value) => handleStudentChange('ngay_sinh', value)} />
                <SelectField
                  label="Giới tính"
                  value={selectedUser.gt || ''}
                  onChange={(value) => handleStudentChange('gt', value)}
                  options={[
                    { value: '', label: 'Chọn giới tính' },
                    { value: 'nam', label: 'Nam' },
                    { value: 'nu', label: 'Nữ' },
                    { value: 'khac', label: 'Khác' }
                  ]}
                />
                <Field label="SĐT" value={selectedUser.sdt || ''} onChange={(value) => handleStudentChange('sdt', value)} />
                <Field label="Địa chỉ" value={selectedUser.dia_chi || ''} onChange={(value) => handleStudentChange('dia_chi', value)} />
              </>
            )}

            {createRoleTab === 'Giảng viên' && (
              <>
                <Field label="Khoa" value={selectedUser.khoa || ''} onChange={(value) => handleChange('khoa', value)} />
                <Field label="SĐT" value={selectedUser.sdt || ''} onChange={(value) => handleChange('sdt', value)} />
              </>
            )}
          </div>

          {formError && (
            <div className="mt-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl p-3 text-sm font-semibold">{String(formError)}</div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 p-6">
          <button onClick={onClose} style={{ ...buttonStyle, backgroundColor: '#f3f4f6', color: '#374151' }} disabled={submitLoading}>
            <X size={18} />
            Hủy
          </button>
          <button onClick={onSubmit} style={{ ...buttonStyle, backgroundColor: '#10b981', color: 'white' }} disabled={submitLoading}>
            <Save size={18} />
            {submitLoading ? 'Đang tạo...' : 'Tạo Người Dùng'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', readOnly = false, helper }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        style={{ ...inputStyle, backgroundColor: readOnly ? '#f9fafb' : 'white', color: readOnly ? '#6b7280' : '#111827' }}
      />
      {helper && <p className="text-xs text-gray-500 mt-1">{helper}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}




