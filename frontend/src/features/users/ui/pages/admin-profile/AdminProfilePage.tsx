import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle, Clock, Edit3, Key, Mail, Shield, User } from 'lucide-react';
import { useNotification } from '../../../../../shared/contexts/NotificationContext';
import { userProfileApi } from '../../../services';
import { formatDateVN } from '../../../../../shared/lib/date';
import {
  ProfileEditCard,
  ProfileHeroCard,
  ProfileInfoGrid,
  ProfilePasswordModal,
  ProfileShell,
  ProfileTabs,
  profileThemes
} from '../../../../profile';

export default function AdminProfile() {
  const { showSuccess, showError } = useNotification();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [formData, setFormData] = useState<Record<string, any>>({
    ho_ten: '',
    email: '',
    anh_dai_dien: '',
    ngay_sinh: '',
    gt: '',
    dia_chi: '',
    sdt: ''
  });
  const [passwordData, setPasswordData] = useState<Record<string, string>>({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  const theme = profileThemes.admin;

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await userProfileApi.getProfile();
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updateData = {
        ho_ten: formData.ho_ten,
        email: formData.email,
        anh_dai_dien: formData.anh_dai_dien
      };

      await userProfileApi.updateProfile(updateData);
      setEditing(false);
      loadProfile();
      showSuccess('Cập nhật thông tin thành công', 'Thành công', 8000);
    } catch (error: any) {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.message || error.message;
      if (errorMessage.includes('quá dài')) {
        showError('URL ảnh đại diện quá dài. Vui lòng sử dụng URL ngắn hơn hoặc ảnh có kích thước nhỏ hơn.');
      } else {
        showError('Lỗi cập nhật: ' + errorMessage);
      }
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      showError('Mật khẩu mới và xác nhận không khớp');
      return;
    }
    try {
      await userProfileApi.changePassword({
        currentPassword: passwordData.old_password,
        newPassword: passwordData.new_password
      });
      setChangingPassword(false);
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      showSuccess('Đổi mật khẩu thành công', 'Thành công', 8000);
    } catch (error: any) {
      showError('Lỗi đổi mật khẩu: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      hoat_dong: 'Hoạt động',
      khong_hoat_dong: 'Không hoạt động',
      khoa: 'Khóa'
    };
    return statusMap[status] || status || 'Hoạt động';
  };

  const infoItems = profile ? [
    { label: 'Họ và tên', value: profile.ho_ten, icon: <User className="h-5 w-5" /> },
    { label: 'Email', value: profile.email, icon: <Mail className="h-5 w-5" /> },
    { label: 'Tên đăng nhập', value: profile.ten_dn, icon: <User className="h-5 w-5" /> },
    { label: 'Vai trò', value: profile.vai_tro?.ten_vt || 'Admin', icon: <Shield className="h-5 w-5" /> },
    { label: 'Ngày tạo tài khoản', value: profile.ngay_tao ? formatDateVN(profile.ngay_tao) : '', icon: <Calendar className="h-5 w-5" /> },
    { label: 'Cập nhật lần cuối', value: profile.ngay_cap_nhat ? formatDateVN(profile.ngay_cap_nhat) : '', icon: <Clock className="h-5 w-5" /> },
    { label: 'Lần đăng nhập cuối', value: profile.lan_cuoi_dn ? formatDateVN(profile.lan_cuoi_dn) : '', icon: <Clock className="h-5 w-5" /> },
    { label: 'Trạng thái tài khoản', value: getStatusText(profile.trang_thai), icon: <CheckCircle className="h-5 w-5" /> }
  ] : [];

  if (loading) {
    return (
      <ProfileShell theme={theme}>
        <div className="flex h-96 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        </div>
      </ProfileShell>
    );
  }

  if (!profile) {
    return (
      <ProfileShell theme={theme}>
        <div className="rounded-xl border border-rose-200 bg-white p-8 text-center text-rose-600 shadow-sm">
          Không thể tải thông tin profile
        </div>
      </ProfileShell>
    );
  }

  return (
    <ProfileShell theme={theme}>
      <ProfileHeroCard
        profile={profile}
        theme={theme}
        title={profile.ho_ten || 'Quản trị viên'}
        subtitle={profile.email}
        roleLabel={profile.vai_tro?.ten_vt || theme.label}
        statusLabel={getStatusText(profile.trang_thai)}
        statusActive={profile.trang_thai !== 'khoa' && profile.trang_thai !== 'khong_hoat_dong'}
        metaItems={[
          { label: 'Tài khoản', value: profile.ten_dn || '—', icon: <User className="h-4 w-4" /> },
          { label: 'Vai trò', value: profile.vai_tro?.ten_vt || 'Admin', icon: <Shield className="h-4 w-4" /> }
        ]}
        actions={!editing ? [
          { label: 'Đổi mật khẩu', onClick: () => setChangingPassword(true), icon: <Key className="h-4 w-4" />, variant: 'secondary' },
          { label: 'Chỉnh sửa', onClick: () => setEditing(true), icon: <Edit3 className="h-4 w-4" /> }
        ] : []}
      />

      <ProfileTabs
        theme={theme}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={[{ key: 'info', label: 'Thông tin cơ bản', description: 'Hồ sơ và tài khoản', icon: <User className="h-5 w-5" /> }]}
      />

      {editing ? (
        <ProfileEditCard
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleUpdateProfile}
          onCancel={() => setEditing(false)}
          theme={theme}
        />
      ) : (
        <ProfileInfoGrid
          title="Thông tin tài khoản"
          description="Các thông tin quản trị viên đang được hệ thống ghi nhận."
          items={infoItems}
          theme={theme}
          columns={2}
        />
      )}

      <ProfilePasswordModal
        open={changingPassword}
        onClose={() => setChangingPassword(false)}
        onSubmit={handleChangePassword}
        passwordData={passwordData}
        setPasswordData={setPasswordData}
        showPasswords={showPasswords}
        setShowPasswords={setShowPasswords}
        theme={theme}
      />
    </ProfileShell>
  );
}
