import React from 'react';
import { User, Settings, Award, X, Edit, Save, Lock, Unlock } from 'lucide-react';

const buttonStyle =
  'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-200';
const inputStyle =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100';

export default function AdminUserDetailModal({
  isOpen,
  selectedUser,
  editMode,
  onEditModeChange,
  onClose,
  onSaveUser,
  onLockUser,
  onUnlockUser,
  roles,
  classes,
  activeTab,
  onTabChange,
  setSelectedUser,
  userPoints,
  detailLoading
}) {
  if (!isOpen || !selectedUser) return null;

  const isLocked = selectedUser.trang_thai === 'khoa' || selectedUser.khoa === true;

  const updateUser = (updates) => {
    if (!editMode) return;
    setSelectedUser((prev) => ({
      ...prev,
      ...updates
    }));
  };

  const updateStudentField = (field, value) => {
    if (!editMode) return;
    setSelectedUser((prev) => ({
      ...prev,
      sinh_vien: { ...(prev?.sinh_vien || {}), [field]: value }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <header className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-gray-900">
              {editMode ? 'Chỉnh sửa người dùng' : 'Chi tiết người dùng'}
            </h2>
            {isLocked && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-sm font-semibold">
                <Lock size={14} />
                Đã khóa
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!editMode && selectedUser.id && (
              isLocked ? (
                <button
                  type="button"
                  onClick={() => onUnlockUser && onUnlockUser(selectedUser.id)}
                  className={`${buttonStyle} bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer`}
                >
                  <Unlock size={16} />
                  Mở khóa
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onLockUser && onLockUser(selectedUser.id)}
                  className={`${buttonStyle} bg-amber-500 hover:bg-amber-600 text-white cursor-pointer`}
                >
                  <Lock size={16} />
                  Khóa
                </button>
              )
            )}
            {!editMode ? (
              <button
                type="button"
                onClick={() => onEditModeChange && onEditModeChange(true)}
                className={`${buttonStyle} bg-indigo-500 hover:bg-indigo-600 text-white cursor-pointer`}
              >
                <Edit size={16} />
                Chỉnh sửa
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSaveUser && onSaveUser()}
                className={`${buttonStyle} bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer`}
              >
                <Save size={16} />
                Lưu
              </button>
            )}
            <button type="button" onClick={onClose} className={`${buttonStyle} bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer`}>
              <X size={16} />
            </button>
          </div>
        </header>

        <nav className="flex border-b border-gray-100 text-sm font-semibold">
          {[
            { id: 'account', label: 'Tài khoản', icon: <User size={16} /> },
            { id: 'personal', label: 'Thông tin cá nhân', icon: <Settings size={16} /> },
            { id: 'points', label: 'Điểm rèn luyện', icon: <Award size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 ${
                activeTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <section className="p-6 space-y-4">
          {detailLoading && (
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-700 font-medium">
              Đang tải dữ liệu chi tiết...
            </div>
          )}

          {activeTab === 'account' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Tên đăng nhập"
                value={selectedUser.ten_dn || ''}
                onChange={(value) => updateUser({ ten_dn: value })}
                disabled={!editMode}
              />
              <InputField
                type="email"
                label="Email"
                value={selectedUser.email || ''}
                onChange={(value) => updateUser({ email: value })}
                disabled={!editMode}
              />
              <InputField
                label="Họ tên"
                value={selectedUser.ho_ten || ''}
                onChange={(value) => updateUser({ ho_ten: value })}
                disabled={!editMode}
              />
              <InputField
                type="password"
                label="Mật khẩu"
                placeholder={editMode ? 'Nhập mật khẩu mới (tối thiểu 6 ký tự)' : ''}
                value={selectedUser.mat_khau || ''}
                onChange={(value) => updateUser({ mat_khau: value })}
                disabled={!editMode}
              />
              <SelectField
                label="Vai trò"
                options={roles.map((role) => ({ value: role.id, label: role.ten_vt }))}
                value={selectedUser.vai_tro_id || ''}
                onChange={(value) => {
                  if (!editMode) return;
                  const selectedRole = roles.find((r) => String(r.id) === String(value));
                  setSelectedUser((prev) => ({
                    ...prev,
                    vai_tro_id: value,
                    role: selectedRole?.ten_vt || prev?.role || '',
                    vai_tro: selectedRole ? { id: selectedRole.id, ten_vt: selectedRole.ten_vt } : prev?.vai_tro || null
                  }));
                }}
                disabled={!editMode}
              />
              <SelectField
                label="Trạng thái"
                options={[
                  { value: 'hoat_dong', label: 'Hoạt động' },
                  { value: 'khong_hoat_dong', label: 'Không hoạt động' },
                  { value: 'khoa', label: 'Bị khóa' }
                ]}
                value={selectedUser.trang_thai || ''}
                onChange={(value) => updateUser({ trang_thai: value })}
                disabled={!editMode}
              />
            </div>
          )}

          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="MSSV"
                  value={selectedUser.sinh_vien?.mssv || ''}
                  onChange={(value) => updateStudentField('mssv', value)}
                  disabled={!editMode}
                />
                <SelectField
                  label="Lớp"
                  value={selectedUser.sinh_vien?.lop_id || selectedUser.sinh_vien?.lop?.id || ''}
                  options={[{ value: '', label: 'Chọn lớp' }, ...classes.map((c) => ({ value: c.id, label: `${c.ten_lop} - ${c.khoa}` }))]}
                  onChange={(value) => updateStudentField('lop_id', value)}
                  disabled={!editMode}
                />
                <InputField
                  type="date"
                  label="Ngày sinh"
                  value={
                    selectedUser.sinh_vien?.ngay_sinh
                      ? new Date(selectedUser.sinh_vien.ngay_sinh).toISOString().split('T')[0]
                      : ''
                  }
                  onChange={(value) => updateStudentField('ngay_sinh', value)}
                  disabled={!editMode}
                />
                <SelectField
                  label="Giới tính"
                  value={selectedUser.sinh_vien?.gt || ''}
                  options={[
                    { value: '', label: 'Chọn giới tính' },
                    { value: 'nam', label: 'Nam' },
                    { value: 'nu', label: 'Nữ' },
                    { value: 'khac', label: 'Khác' }
                  ]}
                  onChange={(value) => updateStudentField('gt', value)}
                  disabled={!editMode}
                />
                <InputField
                  label="Số điện thoại"
                  value={selectedUser.sinh_vien?.sdt || ''}
                  onChange={(value) => updateStudentField('sdt', value)}
                  disabled={!editMode}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <textarea
                  value={selectedUser.sinh_vien?.dia_chi || ''}
                  onChange={(e) => updateStudentField('dia_chi', e.target.value)}
                  disabled={!editMode}
                  rows={3}
                  className={`${inputStyle} resize-y`}
                />
              </div>
            </div>
          )}

          {activeTab === 'points' && <PointsTab selectedUser={selectedUser} userPoints={userPoints} editMode={editMode} />}
        </section>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, disabled, type = 'text', placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={inputStyle}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, disabled }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={inputStyle}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function PointsTab({ selectedUser, userPoints, editMode }) {
  const userRole = selectedUser?.vai_tro?.ten_vt || selectedUser?.role || '';
  const roleLower = userRole.toLowerCase();
  const isStudentRole =
    roleLower.includes('sinh viên') ||
    roleLower.includes('lop truong') ||
    roleLower.includes('lớp trưởng') ||
    userRole === 'SINH_VIEN' ||
    userRole === 'SINH_VIÊN' ||
    userRole === 'LOP_TRUONG' ||
    userRole === 'LỚP_TRƯỞNG';
  const hasStudentInfo = selectedUser?.sinh_vien && (selectedUser.sinh_vien.id || selectedUser.sinh_vien.mssv);

  if (isStudentRole && !hasStudentInfo && editMode) {
    return (
      <div className="text-center p-10 bg-amber-50 rounded-xl border border-amber-200 text-amber-800">
        Vui lòng thêm thông tin sinh viên (MSSV và Lớp) ở tab "Thông tin cá nhân" để xem điểm rèn luyện
      </div>
    );
  }

  if (userPoints?.message && !isStudentRole) {
    return (
      <div className="text-center p-10 bg-gray-50 rounded-xl border border-gray-200 text-gray-500">
        {userPoints.message}
      </div>
    );
  }

  if (!userPoints?.items || userPoints.items.length === 0) {
    return (
      <div className="text-center p-10 bg-gray-50 rounded-xl border border-gray-200 text-gray-500">
        Chưa có điểm rèn luyện
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {userPoints.total > 0 && (
        <div className="px-4 py-2 bg-emerald-50 rounded-xl text-emerald-700 font-semibold inline-flex items-center gap-2">
          Tổng: {userPoints.total} điểm
        </div>
      )}
      {userPoints.items.map((point, index) => (
        <div key={index} className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex items-center justify-between">
          <div>
            <h4 className="text-base font-semibold text-gray-900">{point.activity_name || 'Hoạt động'}</h4>
            <p className="text-sm text-gray-500">
              {point.date ? new Date(point.date).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
            </p>
          </div>
          <span className="text-lg font-bold text-emerald-600">{point.points || 0} điểm</span>
        </div>
      ))}
    </div>
  );
}

