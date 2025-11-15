import React from 'react';
import { User, Edit3, Save, X, Eye, EyeOff, Key, Shield, Calendar, Mail, Phone, MapPin, Clock, CheckCircle, GraduationCap, Hash } from 'lucide-react';
import AvatarUpload from '../../../entities/user/ui/Avatar';
import useStudentProfile from '../../student/model/useStudentProfile';

export default function StudentProfilePage() {
  const {
    profile,
    loading,
    editing,
    setEditing,
    changingPassword,
    setChangingPassword,
    activeTab,
    setActiveTab,
    formData,
    setFormData,
    passwordData,
    setPasswordData,
    showPasswords,
    setShowPasswords,
    handleUpdateProfile,
    handleChangePassword,
    getGenderDisplay,
    getStatusText,
    canDisplayImage,
    directImageUrl,
    formatDateVN,
  } = useStudentProfile();

  const renderField = (label, value, formatter, icon) => {
    const val = typeof formatter === 'function' ? formatter(value) : value;
    if (val === undefined || val === null || val === '') return null;
    return (
      <div className="flex items-start gap-3">
        {icon && <div className="text-gray-400 mt-1">{icon}</div>}
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-500">{label}</label>
          <p className="mt-1 text-sm text-gray-900">{val}</p>
        </div>
      </div>
    );
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
        <div className="w-24 h-24 rounded-full shadow-lg overflow-hidden relative">
          {canDisplayImage ? (
            <img
              src={directImageUrl}
              alt="Ảnh đại diện"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white"
            style={{ display: canDisplayImage ? 'none' : 'flex' }}
          >
            {(profile?.ho_ten || profile?.name || profile?.email || 'S').slice(0, 1).toUpperCase()}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{profile?.ho_ten || profile?.name || 'Chưa cập nhật'}</h3>
          <div className="flex items-center gap-2 text-blue-600 font-medium">
            <GraduationCap className="h-5 w-5" />
            <span>{profile?.roleLabel || 'Sinh viên'}</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="h-6 w-6" />
          <h3 className="text-xl font-bold">📚 Thông tin sinh viên</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-2 text-white/80 text-xs mb-1">
              <Hash className="h-3 w-3" />
              <span>MSSV</span>
            </div>
            <div className="text-lg font-bold">{profile?.mssv || profile?.maso || 'Chưa cập nhật'}</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-2 text-white/80 text-xs mb-1">
              <GraduationCap className="h-3 w-3" />
              <span>Lớp</span>
            </div>
            <div className="text-lg font-bold">{profile?.lop || 'Chưa cập nhật'}</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-2 text-white/80 text-xs mb-1">
              <GraduationCap className="h-3 w-3" />
              <span>Khoa</span>
            </div>
            <div className="text-lg font-bold">{profile?.khoa || 'Chưa cập nhật'}</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-2 text-white/80 text-xs mb-1">
              <Calendar className="h-3 w-3" />
              <span>Niên khóa</span>
            </div>
            <div className="text-lg font-bold">{profile?.nienkhoa || 'Chưa cập nhật'}</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-2 text-white/80 text-xs mb-1">
              <Calendar className="h-3 w-3" />
              <span>Ngày sinh</span>
            </div>
            <div className="text-lg font-bold">{(profile?.ngaysinh || profile?.ngay_sinh) ? formatDateVN(profile?.ngaysinh || profile?.ngay_sinh) : 'Chưa cập nhật'}</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-2 text-white/80 text-xs mb-1">
              <User className="h-3 w-3" />
              <span>Giới tính</span>
            </div>
            <div className="text-lg font-bold">{getGenderDisplay(profile?.gt)}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Phone className="h-5 w-5 text-blue-600" />
          Thông tin liên hệ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderField('Email', profile?.email, null, <Mail className="h-5 w-5" />)}
          {renderField('Số điện thoại', profile?.sdt, null, <Phone className="h-5 w-5" />)}
          {renderField('Địa chỉ', profile?.dia_chi, null, <MapPin className="h-5 w-5" />)}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Thông tin tài khoản
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderField('Tên đăng nhập', profile?.ten_dn || profile?.maso, null, <User className="h-5 w-5" />)}
          {renderField('Vai trò', profile?.roleLabel || profile?.vai_tro?.ten_vt, null, <Shield className="h-5 w-5" />)}
          {renderField('Ngày tạo', profile?.ngay_tao || profile?.createdAt, formatDateVN, <Calendar className="h-5 w-5" />)}
          {renderField('Cập nhật cuối', profile?.ngay_cap_nhat || profile?.updatedAt, formatDateVN, <Clock className="h-5 w-5" />)}
          {renderField('Lần đăng nhập cuối', profile?.lan_cuoi_dn, formatDateVN, <Clock className="h-5 w-5" />)}
          {renderField('Trạng thái tài khoản', getStatusText(profile?.trang_thai || profile?.trangthai), null, <CheckCircle className="h-5 w-5" />)}
        </div>
      </div>
    </div>
  );

  const renderBasicEditForm = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-4 border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-700 mb-3">Trường có thể chỉnh sửa</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
            <input
              type="text"
              value={formData.ho_ten}
              onChange={e => setFormData(p => ({ ...p, ho_ten: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">Ảnh đại diện</label>
            <AvatarUpload value={formData.anh_dai_dien} onChange={(url) => setFormData(p => ({ ...p, anh_dai_dien: url }))} size={200} />
          </div>
        </div>
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>⚠️ Lưu ý:</strong> Bạn chỉ có thể chỉnh sửa <strong>Họ tên</strong>, <strong>Email</strong> và <strong>Ảnh đại diện</strong>. Các thông tin khác chỉ được cập nhật bởi Ban chủ nhiệm khoa.
        </p>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Trường không thể chỉnh sửa</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">MSSV</label>
            <input type="text" value={profile?.mssv || profile?.maso || ''} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lớp</label>
            <input type="text" value={profile?.lop || ''} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Khoa</label>
            <input type="text" value={profile?.khoa || ''} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Niên khóa</label>
            <input type="text" value={profile?.nienkhoa || ''} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
            <input type="text" value={(profile?.ngaysinh || profile?.ngay_sinh) ? formatDateVN(profile?.ngaysinh || profile?.ngay_sinh) : ''} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
            <input type="text" value={getGenderDisplay(profile?.gt)} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <input type="text" value={profile?.sdt || ''} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
            <input type="text" value={profile?.dia_chi || ''} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderEditForm = () => (
    <form onSubmit={handleUpdateProfile} className="space-y-6">
      {activeTab === 'info' && renderBasicEditForm()}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <button type="button" onClick={() => setEditing(false)} className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          <X className="h-4 w-4" /> Hủy
        </button>
        <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Save className="h-4 w-4" /> Lưu thay đổi
        </button>
      </div>
    </form>
  );

  const renderTabContent = () => (editing ? renderEditForm() : renderBasicInfo());

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50" data-ref="student-profile-refactored">
        <div className="flex justify-center items-center h-64">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 border-r-indigo-600 absolute inset-0"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50" data-ref="student-profile-refactored">
        <div className="text-center py-8">
          <p className="text-gray-500">Không thể tải thông tin profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-ref="student-profile-refactored">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Thông tin cá nhân</h1>
            <p className="text-gray-600 mt-1">Quản lý thông tin tài khoản sinh viên</p>
          </div>
        </div>
        {!editing && !changingPassword && (
          <div className="flex gap-3">
            <button onClick={() => setChangingPassword(true)} className="flex items-center gap-2 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors shadow-sm">
              <Key className="h-4 w-4" /> Đổi mật khẩu
            </button>
            <button onClick={() => setEditing(true)} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              <Edit3 className="h-4 w-4" /> Chỉnh sửa
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex flex-col items-center gap-1 py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'info' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">👤</span>
                <span>Thông tin cơ bản</span>
              </div>
              <span className="text-xs text-gray-400 font-normal">Họ tên, MSSV, lớp, khoa</span>
            </button>
          </nav>
        </div>
        <div className="p-6">{renderTabContent()}</div>
      </div>

      {changingPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Key className="h-5 w-5 text-yellow-600" />
              Đổi mật khẩu
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                <div className="relative">
                  <input
                    type={showPasswords.old ? 'text' : 'password'}
                    value={passwordData.old_password}
                    onChange={e => setPasswordData(p => ({ ...p, old_password: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(p => ({ ...p, old: !p.old }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.old ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.new_password}
                    onChange={e => setPasswordData(p => ({ ...p, new_password: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirm_password}
                    onChange={e => setPasswordData(p => ({ ...p, confirm_password: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setChangingPassword(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Đổi mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
