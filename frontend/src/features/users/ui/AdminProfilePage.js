import React, { useState, useEffect } from 'react';
import { User, Edit3, Save, X, Eye, EyeOff, Key, Shield, Calendar, Mail, Phone, MapPin, Clock, CheckCircle } from 'lucide-react';
import http from '../../../shared/api/http';
import { useAppStore } from '../../../shared/store';
import { useNotification } from '../../../shared/contexts/NotificationContext';
import { formatDateVN } from '../../../shared/lib/date';
import { AvatarUpload } from '../../../shared/components/common';
import { getUserAvatar, getAvatarGradient } from '../../../shared/lib/avatar';

export default function AdminProfile() {
  const { showSuccess, showError } = useNotification();
  const { user } = useAppStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [formData, setFormData] = useState({
    ho_ten: '',
    email: '',
    anh_dai_dien: '',
    ngay_sinh: '',
    gt: '',
    dia_chi: '',
    sdt: ''
  });
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await http.get('/core/profile');
      const profileData = response?.data?.data || response?.data || {};
      setProfile(profileData);
      setFormData({
        ho_ten: profileData.ho_ten || '',
        email: profileData.email || '',
        anh_dai_dien: profileData.anh_dai_dien || '',
        ngay_sinh: profileData.ngay_sinh ? new Date(profileData.ngay_sinh).toISOString().split('T')[0] : '',
        gt: profileData.gt || '',
        dia_chi: profileData.dia_chi || '',
        sdt: profileData.sdt || ''
      });
    } catch (error) {
      showError('Không thể tải thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      // Chỉ gửi các trường có thể cập nhật cho admin
      const updateData = {
        ho_ten: formData.ho_ten,
        email: formData.email,
        anh_dai_dien: formData.anh_dai_dien
        // Bỏ qua các trường sinh_vien vì admin không có bản ghi sinh_vien
      };
      
      await http.put('/core/profile', updateData);
      setEditing(false);
      loadProfile();
      showSuccess('Cập nhật thông tin thành công', 'Thành công', 8000);
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.message || error.message;
      if (errorMessage.includes('quá dài')) {
        showError('URL ảnh đại diện quá dài. Vui lòng sử dụng URL ngắn hơn hoặc ảnh có kích thước nhỏ hơn.');
      } else {
        showError('Lỗi cập nhật: ' + errorMessage);
      }
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      showError('Mật khẩu mới và xác nhận không khớp');
      return;
    }
    try {
      await http.put('/users/change-password', passwordData);
      setChangingPassword(false);
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      showSuccess('Đổi mật khẩu thành công', 'Thành công', 8000);
    } catch (error) {
      showError('Lỗi đổi mật khẩu: ' + (error.response?.data?.message || error.message));
    }
  };

  const getGenderText = (gender) => {
    const genderMap = {
      'nam': 'Nam',
      'nu': 'Nữ', 
      'khac': 'Khác'
    };
    return genderMap[gender] || '';
  };

  const getStatusText = (status) => {
    const statusMap = {
      'hoat_dong': 'Hoạt động',
      'khong_hoat_dong': 'Không hoạt động',
      'khoa': 'Khóa'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'hoat_dong': 'text-green-600 bg-green-100',
      'khong_hoat_dong': 'text-yellow-600 bg-yellow-100',
      'khoa': 'text-red-600 bg-red-100'
    };
    return colorMap[status] || 'text-gray-600 bg-gray-100';
  };

  const renderField = (label, value, formatter, icon) => {
    const val = typeof formatter === 'function' ? formatter(value) : value;
    if (val === undefined || val === null || val === '') return null;
    return (
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
        {icon && <div className="text-gray-500 mt-0.5">{icon}</div>}
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-500 block mb-1">{label}</label>
          <p className="text-sm text-gray-900">{val}</p>
        </div>
      </div>
    );
  };

  const renderBasicInfo = () => {
    const avatar = getUserAvatar(profile);
    
    return (
    <div className="space-y-6">
      {/* Avatar và thông tin cơ bản */}
      <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
        <div className="w-24 h-24 rounded-full shadow-lg overflow-hidden relative">
          {avatar.hasValidAvatar ? (
            <img 
              src={avatar.src} 
              alt={avatar.alt} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                const next = e.target.nextSibling;
                if (next) next.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className={`absolute inset-0 w-full h-full bg-gradient-to-br ${getAvatarGradient(profile.ho_ten || profile.email)} flex items-center justify-center text-2xl font-bold text-white`}
            style={{ display: avatar.hasValidAvatar ? 'none' : 'flex' }}
          >
            {avatar.fallback}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{profile.ho_ten || 'Chưa cập nhật'}</h3>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="text-lg font-medium text-blue-600">{profile.vai_tro?.ten_vt || 'Admin'}</span>
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(profile.trang_thai)}`}>
            <CheckCircle className="h-4 w-4 mr-1" />
            {getStatusText(profile.trang_thai)}
          </div>
        </div>
      </div>

      {/* Thông tin chi tiết */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderField('Họ và tên', profile.ho_ten, null, <User className="h-5 w-5" />)}
        {renderField('Email', profile.email, null, <Mail className="h-5 w-5" />)}
        {renderField('Tên đăng nhập', profile.ten_dn, null, <User className="h-5 w-5" />)}
        {renderField('Vai trò', profile.vai_tro?.ten_vt, null, <Shield className="h-5 w-5" />)}
        {renderField('Ngày tạo tài khoản', profile.ngay_tao, formatDateVN, <Calendar className="h-5 w-5" />)}
        {renderField('Cập nhật lần cuối', profile.ngay_cap_nhat, formatDateVN, <Clock className="h-5 w-5" />)}
        {renderField('Lần đăng nhập cuối', profile.lan_cuoi_dn, formatDateVN, <Clock className="h-5 w-5" />)}
        {renderField('Trạng thái tài khoản', getStatusText(profile.trang_thai), null, <CheckCircle className="h-5 w-5" />)}
      </div>

    </div>
    );
  };

  const renderBasicEditForm = () => {
    return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
        <input 
          type="text" 
          value={formData.ho_ten} 
          onChange={e => setFormData(p => ({...p, ho_ten: e.target.value}))} 
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          required 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input 
          type="email" 
          value={formData.email} 
          onChange={e => setFormData(p => ({...p, email: e.target.value}))} 
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          required 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">Ảnh đại diện</label>
        <AvatarUpload
          value={formData.anh_dai_dien}
          onChange={(url) => setFormData(p => ({...p, anh_dai_dien: url}))}
          size={200}
        />
      </div>
    </div>
    );
  };

  const renderEditForm = () => (
    <form onSubmit={handleUpdateProfile} className="space-y-6">
      {activeTab === 'info' && renderBasicEditForm()}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <button 
          type="button" 
          onClick={() => setEditing(false)} 
          className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <X className="h-4 w-4" /> Hủy
        </button>
        <button 
          type="submit" 
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="h-4 w-4" /> Lưu thay đổi
        </button>
      </div>
    </form>
  );

  const renderTabContent = () => (editing ? renderEditForm() : renderBasicInfo());

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="text-center py-8">
          <p className="text-gray-500">Không thể tải thông tin profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Thông tin cá nhân Admin</h1>
              <p className="text-gray-600 mt-1">Quản lý thông tin tài khoản quản trị viên</p>
            </div>
          </div>
          {!editing && !changingPassword && (
            <div className="flex gap-3">
              <button 
                onClick={() => setChangingPassword(true)} 
                className="flex items-center gap-2 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors shadow-sm"
              >
                <Key className="h-4 w-4" /> Đổi mật khẩu
              </button>
              <button 
                onClick={() => setEditing(true)} 
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Edit3 className="h-4 w-4" /> Chỉnh sửa
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button 
                onClick={() => setActiveTab('info')} 
                className={`flex flex-col items-center gap-2 py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'info' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span>Thông tin cơ bản</span>
                </div>
                <span className="text-xs text-gray-400 font-normal">Họ tên, email, ảnh đại diện</span>
              </button>
            </nav>
          </div>
          <div className="p-8">{renderTabContent()}</div>
        </div>

        {/* Change Password Modal */}
        {changingPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Key className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Đổi mật khẩu</h3>
              </div>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
                  <div className="relative">
                    <input 
                      type={showPasswords.old ? 'text' : 'password'} 
                      value={passwordData.old_password} 
                      onChange={e => setPasswordData(p => ({...p, old_password: e.target.value}))} 
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPasswords(p => ({...p, old: !p.old}))} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.old ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                  <div className="relative">
                    <input 
                      type={showPasswords.new ? 'text' : 'password'} 
                      value={passwordData.new_password} 
                      onChange={e => setPasswordData(p => ({...p, new_password: e.target.value}))} 
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPasswords(p => ({...p, new: !p.new}))} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                  <div className="relative">
                    <input 
                      type={showPasswords.confirm ? 'text' : 'password'} 
                      value={passwordData.confirm_password} 
                      onChange={e => setPasswordData(p => ({...p, confirm_password: e.target.value}))} 
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPasswords(p => ({...p, confirm: !p.confirm}))} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6">
                  <button 
                    type="button" 
                    onClick={() => setChangingPassword(false)} 
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Đổi mật khẩu
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
