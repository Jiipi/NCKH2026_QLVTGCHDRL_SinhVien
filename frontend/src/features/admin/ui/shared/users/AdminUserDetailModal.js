import React from 'react';
import {
  User,
  Settings,
  Award,
  Lock,
  Unlock,
  Save,
  Edit,
  X,
  Mail,
  GraduationCap,
  Calendar
} from 'lucide-react';

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

export default function AdminUserDetailModal({
  isOpen,
  selectedUser,
  editMode,
  onClose,
  onSave,
  onLockUser,
  onUnlockUser,
  roles,
  classes,
  activeTab,
  onTabChange,
  userPoints,
  detailLoading,
  setSelectedUser,
  setEditMode,
  handleRoleSelect
}) {
  if (!isOpen || !selectedUser) return null;

  const handleFieldChange = (field, value) => {
    if (!editMode) return;
    setSelectedUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleStudentFieldChange = (field, value) => {
    if (!editMode) return;
    setSelectedUser((prev) => ({
      ...prev,
      sinh_vien: { ...(prev?.sinh_vien || {}), [field]: value }
    }));
  };

  const renderPoints = () => {
    const userRole = selectedUser?.vai_tro?.ten_vt || selectedUser?.role || '';
    const roleLower = userRole.toLowerCase();
    const isStudentRole =
      roleLower.includes('sinh viên') ||
      roleLower.includes('lop truong') ||
      roleLower.includes('lớp trưởng') ||
      ['SINH_VIEN', 'SINH_VIÊN', 'LOP_TRUONG', 'LỚP_TRƯỞNG'].includes(userRole);
    const hasStudentInfo = selectedUser?.sinh_vien && (selectedUser.sinh_vien.id || selectedUser.sinh_vien.mssv);

    if (isStudentRole && !hasStudentInfo && editMode) {
      return (
        <div className="text-center p-10 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
          <Award size={48} className="mx-auto mb-4 opacity-60" />
          <p className="text-sm font-medium">
            Vui lòng thêm thông tin sinh viên (MSSV và Lớp) ở tab "Thông tin cá nhân" để xem điểm rèn luyện
          </p>
        </div>
      );
    }

    if (userPoints?.message && !isStudentRole) {
      return (
        <div className="text-center p-10 bg-gray-50 rounded-xl">
          <Award size={48} className="mx-auto mb-4 opacity-60 text-gray-400" />
          <p className="text-sm text-gray-500">{userPoints.message}</p>
        </div>
      );
    }

    if (!userPoints?.items || !userPoints.items.length) {
      return (
        <div className="text-center p-10">
          <Award size={48} className="mx-auto mb-4 opacity-60 text-gray-400" />
          <p className="text-sm text-gray-500">Chưa có điểm rèn luyện</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {userPoints.items.map((point, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-semibold text-gray-900">{point.activity_name || 'Hoạt động'}</h4>
              <p className="text-sm text-gray-500">
                {point.date ? new Date(point.date).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
              </p>
            </div>
            <div className="text-2xl font-bold text-emerald-600">{point.points || 0} điểm</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-auto shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">{editMode ? 'Chỉnh sửa người dùng' : 'Chi tiết người dùng'}</h2>
            {selectedUser.trang_thai === 'khoa' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold">
                <Lock size={12} /> Đã khóa
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!editMode && selectedUser.id && (
              selectedUser.trang_thai === 'khoa' ? (
                <button
                  onClick={async () => { await onUnlockUser(selectedUser.id); setSelectedUser((prev) => ({ ...prev, trang_thai: 'hoat_dong' })); }}
                  style={{ ...buttonStyle, backgroundColor: '#10b981', color: 'white' }}
                >
                  <Unlock size={16} /> Mở khóa
                </button>
              ) : (
                <button
                  onClick={async () => { await onLockUser(selectedUser.id); setSelectedUser((prev) => ({ ...prev, trang_thai: 'khoa' })); }}
                  style={{ ...buttonStyle, backgroundColor: '#f59e0b', color: 'white' }}
                >
                  <Lock size={16} /> Khóa
                </button>
              )
            )}
            {!editMode ? (
              <button onClick={() => setEditMode(true)} style={{ ...buttonStyle, backgroundColor: '#10b981', color: 'white' }}>
                <Edit size={16} /> Chỉnh sửa
              </button>
            ) : (
              <button onClick={onSave} style={{ ...buttonStyle, backgroundColor: '#10b981', color: 'white' }}>
                <Save size={16} /> Lưu
              </button>
            )}
            <button onClick={onClose} style={{ ...buttonStyle, backgroundColor: '#6b7280', color: 'white' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="border-b border-gray-100 px-6 flex gap-2">
          {[
            { id: 'account', label: 'Tài khoản', icon: <User size={16} /> },
            { id: 'personal', label: 'Thông tin cá nhân', icon: <Settings size={16} /> },
            { id: 'points', label: 'Điểm rèn luyện', icon: <Award size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                ...buttonStyle,
                backgroundColor: activeTab === tab.id ? '#3b82f6' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#6b7280',
                borderRadius: 0,
                borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                paddingBottom: '16px',
                marginBottom: '-1px'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {detailLoading && (
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-700 font-semibold">Đang tải dữ liệu chi tiết...</div>
          )}

          {activeTab === 'account' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Tên đăng nhập" value={selectedUser.ten_dn || ''} onChange={(value) => handleFieldChange('ten_dn', value)} disabled={!editMode} />
              <Field label="Email" type="email" value={selectedUser.email || ''} onChange={(value) => handleFieldChange('email', value)} disabled={!editMode} />
              <Field label="Họ tên" value={selectedUser.ho_ten || ''} onChange={(value) => handleFieldChange('ho_ten', value)} disabled={!editMode} />
              <Field
                label={
                  <>
                    Mật khẩu {editMode && <span className="text-xs text-gray-500 font-normal">(để trống nếu không đổi)</span>}
                  </>
                }
                type="password"
                value={selectedUser.mat_khau || ''}
                onChange={(value) => handleFieldChange('mat_khau', value)}
                disabled={!editMode}
                placeholder={editMode ? 'Nhập mật khẩu mới (tối thiểu 6 ký tự)' : ''}
              />
              <SelectField
                label="Vai trò"
                value={selectedUser.vai_tro_id || ''}
                onChange={(value) => handleRoleSelect(value)}
                disabled={!editMode}
                options={roles.map((role) => ({ value: role.id, label: role.ten_vt }))}
              />
              <SelectField
                label="Trạng thái"
                value={selectedUser.trang_thai || ''}
                onChange={(value) => handleFieldChange('trang_thai', value)}
                disabled={!editMode}
                options={[
                  { value: 'hoat_dong', label: 'Hoạt động' },
                  { value: 'khong_hoat_dong', label: 'Không hoạt động' },
                  { value: 'khoa', label: 'Bị khóa' }
                ]}
              />
            </div>
          )}

          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="MSSV" value={selectedUser.sinh_vien?.mssv || ''} onChange={(value) => handleStudentFieldChange('mssv', value)} disabled={!editMode} placeholder="Nhập mã số sinh viên" />
              <SelectField
                label="Lớp"
                value={selectedUser.sinh_vien?.lop_id || selectedUser.sinh_vien?.lop?.id || ''}
                onChange={(value) => handleStudentFieldChange('lop_id', value)}
                disabled={!editMode}
                options={[{ value: '', label: 'Chọn lớp' }, ...classes.map((c) => ({ value: c.id, label: `${c.ten_lop} - ${c.khoa}` }))]}
              />
              <Field
                label="Ngày sinh"
                type="date"
                value={selectedUser.sinh_vien?.ngay_sinh ? new Date(selectedUser.sinh_vien.ngay_sinh).toISOString().split('T')[0] : ''}
                onChange={(value) => handleStudentFieldChange('ngay_sinh', value)}
                disabled={!editMode}
              />
              <SelectField
                label="Giới tính"
                value={selectedUser.sinh_vien?.gt || ''}
                onChange={(value) => handleStudentFieldChange('gt', value)}
                disabled={!editMode}
                options={[
                  { value: '', label: 'Chọn giới tính' },
                  { value: 'nam', label: 'Nam' },
                  { value: 'nu', label: 'Nữ' },
                  { value: 'khac', label: 'Khác' }
                ]}
              />
              <Field label="Số điện thoại" value={selectedUser.sinh_vien?.sdt || ''} onChange={(value) => handleStudentFieldChange('sdt', value)} disabled={!editMode} placeholder="Nhập số điện thoại" />
              <Field label="Địa chỉ" value={selectedUser.sinh_vien?.dia_chi || ''} onChange={(value) => handleStudentFieldChange('dia_chi', value)} disabled={!editMode} placeholder="Nhập địa chỉ" />
            </div>
          )}

          {activeTab === 'points' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Điểm rèn luyện</h3>
                {userPoints?.total > 0 && (
                  <div className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold">Tổng: {userPoints.total} điểm</div>
                )}
              </div>
              {renderPoints()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, disabled, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, disabled, options }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} style={inputStyle}>
        {options.map((option) => (
          <option key={option.value ?? option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}










