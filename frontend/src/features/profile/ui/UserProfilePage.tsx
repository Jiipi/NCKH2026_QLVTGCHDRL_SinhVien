import React, { useState, useEffect } from 'react';
import { User, Edit3, Save, X, Eye, EyeOff, Key } from 'lucide-react';
import http from '../../../shared/api/http';
import Header from '../../../shared/components/layout/Header';
import StudentSidebar from '../../../shared/components/layout/StudentSidebar';
import { useAppStore } from '../../../shared/store';
import { useNotification } from '../../../shared/contexts/NotificationContext';
import { formatDateVN } from '../../../shared/lib/date';

export default function UserProfilePage() {
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
      let response;
      try {
        response = await http.get('/core/profile');
      } catch (e) {
        response = await http.get('/auth/profile');
      }
      const profileData = response?.data?.data || response?.data || {};
      setProfile(profileData);
      setFormData({
        ho_ten: profileData.ho_ten || '',
        email: profileData.email || '',
        ngay_sinh: profileData.sinh_vien?.ngay_sinh ? new Date(profileData.sinh_vien.ngay_sinh).toISOString().split('T')[0] : '',
        gt: profileData.sinh_vien?.gt || '',
        dia_chi: profileData.sinh_vien?.dia_chi || '',
        sdt: profileData.sinh_vien?.sdt || ''
      });
    } catch (error) {
      showError('Không thể tải profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updateData = { ...formData };
      await http.put('/core/profile', updateData);
      setEditing(false);
      loadProfile();
      showSuccess('Cập nhật thông tin thành công', 'Thành công', 8000);
    } catch (error) {
      showError('Lỗi cập nhật: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      showError('Mật khẩu mới và xác nhận không khớp');
      return;
    }
    try {
      await http.post('/auth/change-password', passwordData);
      setChangingPassword(false);
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      showSuccess('Đổi mật khẩu thành công', 'Thành công', 8000);
    } catch (error) {
      showError('Lỗi đổi mật khẩu: ' + (error.response?.data?.message || error.message));
    }
  };

  const getGenderText = (gender) => ({ nam: 'Nam', nu: 'Nữ', khac: 'Khác' }[gender] || '');
  const role = (user?.role || 'student').toLowerCase();

  const renderField = (label, value, formatter?) => {
    const val = typeof formatter === 'function' ? formatter(value) : value;
    if (val === undefined || val === null || val === '') return null;
    return (
      <div>
        <label className="text-sm font-medium text-gray-500">{label}</label>
        <p className="mt-1 text-sm text-gray-900">{val}</p>
      </div>
    );
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-6 mb-6">
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-700">
          {(profile.ho_ten || profile.email || 'U').slice(0,1).toUpperCase()}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{profile.ho_ten || 'Chưa cập nhật'}</h3>
          {renderField('MSSV', profile.sinh_vien?.mssv)}
          {(profile.sinh_vien?.lop?.ten_lop || profile.sinh_vien?.lop?.khoa) && (
            <p className="text-sm text-gray-500">
              {profile.sinh_vien?.lop?.ten_lop || ''}{profile.sinh_vien?.lop?.ten_lop && profile.sinh_vien?.lop?.khoa ? ' • ' : ''}{profile.sinh_vien?.lop?.khoa || ''}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderField('Họ và tên', profile.ho_ten)}
        {renderField('Email', profile.email)}
        {renderField('Tên đăng nhập', profile.ten_dn)}
        {renderField('Ngày sinh', profile.sinh_vien?.ngay_sinh, formatDateVN)}
        {renderField('Giới tính', getGenderText(profile.sinh_vien?.gt))}
        {profile.sinh_vien?.lop?.ten_lop && renderField('Lớp', profile.sinh_vien.lop.ten_lop)}
        {profile.sinh_vien?.lop?.khoa && renderField('Khoa', profile.sinh_vien.lop.khoa)}
        {profile.sinh_vien?.lop?.nien_khoa && renderField('Niên khóa', profile.sinh_vien.lop.nien_khoa)}
        {renderField('Địa chỉ hiện tại', profile.sinh_vien?.dia_chi)}
        {renderField('Số điện thoại', profile.sinh_vien?.sdt)}
        {renderField('Email sinh viên', profile.sinh_vien?.email)}
      </div>
    </div>
  );

  const renderBasicEditForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
        <input type="text" value={formData.ho_ten} onChange={e=>setFormData(p=>({...p,ho_ten:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input type="email" value={formData.email} onChange={e=>setFormData(p=>({...p,email:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
        <input type="date" value={formData.ngay_sinh} onChange={e=>setFormData(p=>({...p,ngay_sinh:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
        <select value={formData.gt} onChange={e=>setFormData(p=>({...p,gt:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="">Chọn giới tính</option>
          <option value="nam">Nam</option>
          <option value="nu">Nữ</option>
          <option value="khac">Khác</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
        <textarea value={formData.dia_chi} onChange={e=>setFormData(p=>({...p,dia_chi:e.target.value}))} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
        <input type="tel" value={formData.sdt} onChange={e=>setFormData(p=>({...p,sdt:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
      </div>
    </div>
  );

  const renderEditForm = () => (
    <form onSubmit={handleUpdateProfile} className="space-y-6">
      {activeTab === 'info' && renderBasicEditForm()}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <button type="button" onClick={()=>setEditing(false)} className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          <X className="h-4 w-4" /> Hủy
        </button>
        <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Save className="h-4 w-4" /> Lưu thay đổi
        </button>
      </div>
    </form>
  );

  const renderTabContent = () => (editing ? renderEditForm() : renderBasicInfo());

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <StudentSidebar role={role} />
          <main className="flex-1">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <StudentSidebar role={role} />
          <main className="flex-1">
            <div className="text-center py-8">
              <p className="text-gray-500">Không thể tải thông tin profile</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <StudentSidebar role={role} />
        <main className="flex-1">
          <div className="max-w-4xl mx-auto space-y-6 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
                  <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
                </div>
              </div>
              {!editing && !changingPassword && (
                <div className="flex gap-2">
                  <button onClick={()=>setChangingPassword(true)} className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                    <Key className="h-4 w-4" /> Đổi mật khẩu
                  </button>
                  <button onClick={()=>setEditing(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <Edit3 className="h-4 w-4" /> Chỉnh sửa
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg border">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  <button onClick={()=>setActiveTab('info')} className={`flex flex-col items-center gap-1 py-4 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab==='info' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">👤</span>
                      <span>Thông tin cơ bản</span>
                    </div>
                    <span className="text-xs text-gray-400 font-normal">Họ tên, email, lớp</span>
                  </button>
                </nav>
              </div>
              <div className="p-6">{renderTabContent()}</div>
            </div>

            {changingPassword && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-medium mb-4">Đổi mật khẩu</h3>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                      <div className="relative">
                        <input type={showPasswords.old ? 'text' : 'password'} value={passwordData.old_password} onChange={e=>setPasswordData(p=>({...p,old_password:e.target.value}))} className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                        <button type="button" onClick={()=>setShowPasswords(p=>({...p,old:!p.old}))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPasswords.old ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                      <div className="relative">
                        <input type={showPasswords.new ? 'text' : 'password'} value={passwordData.new_password} onChange={e=>setPasswordData(p=>({...p,new_password:e.target.value}))} className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                        <button type="button" onClick={()=>setShowPasswords(p=>({...p,new:!p.new}))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                      <div className="relative">
                        <input type={showPasswords.confirm ? 'text' : 'password'} value={passwordData.confirm_password} onChange={e=>setPasswordData(p=>({...p,confirm_password:e.target.value}))} className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                        <button type="button" onClick={()=>setShowPasswords(p=>({...p,confirm:!p.confirm}))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <button type="button" onClick={()=>setChangingPassword(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Hủy</button>
                      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Đổi mật khẩu</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
