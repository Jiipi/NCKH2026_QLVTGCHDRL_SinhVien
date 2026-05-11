import React, { useEffect, useState } from 'react';
import { BookOpen, Calendar, CheckCircle, Clock, Edit3, Key, Mail, Shield, User } from 'lucide-react';
import { useNotification } from '../../../../../shared/contexts/NotificationContext';
import { teacherClassesApi, teacherDashboardApi } from '../../../services';
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

export default function TeacherProfilePage() {
  const { showSuccess, showError } = useNotification();
  const [profile, setProfile] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
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

  const theme = profileThemes.teacher;

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await teacherDashboardApi.getProfile();

      try {
        const classesResponse = await teacherClassesApi.getClasses();
        const classesData = classesResponse?.data?.classes || [];
        setClasses(Array.isArray(classesData) ? classesData : []);
      } catch (e) {
        console.log('Could not load classes:', e);
        setClasses([]);
      }

      if (!response.success) throw new Error((response as { error?: string }).error || 'Không thể tải thông tin profile');
      const profileData = (response.data || {}) as Record<string, any>;
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

      const result = await teacherDashboardApi.updateProfile(updateData);
      if (!result.success) throw new Error((result as { error?: string }).error || 'Không thể cập nhật thông tin');
      setEditing(false);
      loadProfile();

      const updatedProfile = { ...profile, ...updateData };
      setProfile(updatedProfile);
      window.dispatchEvent(new CustomEvent('profileUpdated', {
        detail: { profile: updatedProfile }
      }));

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
      const result = await teacherDashboardApi.changePassword({
        currentPassword: passwordData.old_password,
        newPassword: passwordData.new_password
      });
      if (!result.success) throw new Error((result as { error?: string }).error || 'Không thể đổi mật khẩu');
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

  const classNames = classes.length > 0 ? classes.map((item) => item.ten_lop).join(', ') : '—';
  const infoItems = profile ? [
    { label: 'Họ và tên', value: profile.ho_ten, icon: <User className="h-5 w-5" /> },
    { label: 'Email', value: profile.email, icon: <Mail className="h-5 w-5" /> },
    { label: 'Tên đăng nhập', value: profile.ten_dn, icon: <User className="h-5 w-5" /> },
    { label: 'Vai trò', value: profile.vai_tro?.ten_vt || 'Giảng viên', icon: <Shield className="h-5 w-5" /> },
    { label: 'Lớp phụ trách', value: classNames, icon: <BookOpen className="h-5 w-5" />, helper: `${classes.length} lớp đang phụ trách` },
    { label: 'Ngày tạo tài khoản', value: profile.ngay_tao ? formatDateVN(profile.ngay_tao) : '', icon: <Calendar className="h-5 w-5" /> },
    { label: 'Cập nhật lần cuối', value: profile.ngay_cap_nhat ? formatDateVN(profile.ngay_cap_nhat) : '', icon: <Clock className="h-5 w-5" /> },
    { label: 'Lần đăng nhập cuối', value: profile.lan_cuoi_dn ? formatDateVN(profile.lan_cuoi_dn) : '', icon: <Clock className="h-5 w-5" /> },
    { label: 'Trạng thái tài khoản', value: getStatusText(profile.trang_thai), icon: <CheckCircle className="h-5 w-5" /> }
  ] : [];

  if (loading) {
    return (
      <ProfileShell theme={theme}>
        <div className="flex h-96 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
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
        title={profile.ho_ten || 'Giảng viên'}
        subtitle={profile.email}
        roleLabel={profile.vai_tro?.ten_vt || theme.label}
        statusLabel={getStatusText(profile.trang_thai)}
        statusActive={profile.trang_thai !== 'khoa' && profile.trang_thai !== 'khong_hoat_dong'}
        metaItems={[
          { label: 'Tài khoản', value: profile.ten_dn || '—', icon: <User className="h-4 w-4" /> },
          { label: 'Lớp phụ trách', value: classes.length, icon: <BookOpen className="h-4 w-4" /> }
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
        tabs={[{ key: 'info', label: 'Thông tin cơ bản', description: 'Hồ sơ, lớp phụ trách', icon: <User className="h-5 w-5" /> }]}
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
          title="Thông tin giảng viên"
          description="Thông tin cá nhân, tài khoản và lớp đang phụ trách."
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
