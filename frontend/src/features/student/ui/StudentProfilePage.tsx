import { Camera, Edit3, Fingerprint, GraduationCap, Key, User } from 'lucide-react';
import useStudentProfile from '../model/hooks/useStudentProfile';
import ProfileLoading from './components/Profile/ProfileLoading';
import ProfileEmpty from './components/Profile/ProfileEmpty';
import { FaceRegistrationPageContent } from '../../face-recognition/ui/pages/FaceRegistrationPage';
import {
  ProfileEditCard,
  ProfileHeroCard,
  ProfileInfoGrid,
  ProfilePasswordModal,
  ProfileShell,
  ProfileTabs,
  profileThemes
} from '../../profile';

export default function StudentProfilePage() {
  const {
    profile,
    loading,
    editing,
    setEditing,
    changingPassword,
    setChangingPassword,
    fingerprintLoading,
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
    handleRegisterFingerprint,
    getGenderDisplay,
    getStatusText,
    canDisplayImage,
    directImageUrl,
    formatDateVN
  } = useStudentProfile();

  const theme = profileThemes.student;

  if (loading) {
    return <ProfileLoading />;
  }

  if (!profile) {
    return <ProfileEmpty />;
  }

  const infoItems = [
    { label: 'Họ và tên', value: profile.ho_ten, icon: <User className="h-5 w-5" /> },
    { label: 'MSSV', value: profile.mssv || profile.maso, icon: <GraduationCap className="h-5 w-5" /> },
    { label: 'Lớp', value: profile.lop?.ten_lop || profile.ten_lop || profile.lop, icon: <User className="h-5 w-5" /> },
    { label: 'Khoa', value: profile.khoa?.ten_khoa || profile.ten_khoa || profile.khoa, icon: <GraduationCap className="h-5 w-5" /> },
    { label: 'Niên khóa', value: profile.nienkhoa || profile.nien_khoa, icon: <GraduationCap className="h-5 w-5" /> },
    { label: 'Ngày sinh', value: profile.ngaysinh || profile.ngay_sinh ? formatDateVN(profile.ngaysinh || profile.ngay_sinh) : '', icon: <User className="h-5 w-5" /> },
    { label: 'Giới tính', value: getGenderDisplay(profile.gt), icon: <User className="h-5 w-5" /> },
    { label: 'Email', value: profile.email, icon: <Key className="h-5 w-5" /> },
    { label: 'Số điện thoại', value: profile.sdt, icon: <User className="h-5 w-5" /> },
    { label: 'Địa chỉ', value: profile.dia_chi, icon: <User className="h-5 w-5" /> },
    { label: 'Tên đăng nhập', value: profile.ten_dn, icon: <User className="h-5 w-5" /> },
    { label: 'Vai trò', value: profile.vai_tro?.ten_vt || 'Sinh viên', icon: <GraduationCap className="h-5 w-5" /> },
    { label: 'Trạng thái', value: getStatusText(profile.trang_thai), icon: <User className="h-5 w-5" /> },
    { label: 'Ngày tạo', value: profile.ngay_tao ? formatDateVN(profile.ngay_tao) : '', icon: <GraduationCap className="h-5 w-5" /> },
    { label: 'Lần đăng nhập cuối', value: profile.lan_cuoi_dn ? formatDateVN(profile.lan_cuoi_dn) : '', icon: <GraduationCap className="h-5 w-5" /> }
  ];

  const renderContent = editing ? (
    <ProfileEditCard
      formData={formData as Record<string, any>}
      setFormData={setFormData as unknown as (data: Record<string, any>) => void}
      onSubmit={handleUpdateProfile}
      onCancel={() => setEditing(false)}
      theme={theme}
    />
  ) : (
    <ProfileInfoGrid
      title="Thông tin sinh viên"
      description="Thông tin học vụ, liên hệ và tài khoản sinh viên."
      items={infoItems}
      theme={theme}
      columns={2}
    />
  );

  let tabContent = renderContent;
  if (activeTab === 'face') {
    tabContent = (
      <div className="py-2">
        <FaceRegistrationPageContent embedded />
      </div>
    );
  }

  return (
    <ProfileShell theme={theme} className="flex-1">
      <ProfileHeroCard
        profile={profile}
        theme={theme}
        title={profile.ho_ten || 'Sinh viên'}
        subtitle={profile.email || profile.mssv}
        roleLabel={theme.label}
        statusLabel={getStatusText(profile.trang_thai)}
        statusActive={profile.trang_thai !== 'khoa' && profile.trang_thai !== 'khong_hoat_dong'}
        avatarUrl={canDisplayImage ? directImageUrl : null}
        metaItems={[
          { label: 'MSSV', value: profile.mssv || '—', icon: <GraduationCap className="h-4 w-4" /> },
          { label: 'Lớp', value: profile.lop?.ten_lop || profile.ten_lop || '—', icon: <User className="h-4 w-4" /> }
        ]}
        actions={!editing ? [
          { label: fingerprintLoading ? 'Đang đăng ký...' : 'Đăng ký vân tay', onClick: handleRegisterFingerprint, icon: <Fingerprint className="h-4 w-4" />, variant: 'secondary' },
          { label: 'Đổi mật khẩu', onClick: () => setChangingPassword(true), icon: <Key className="h-4 w-4" />, variant: 'secondary' },
          { label: 'Chỉnh sửa', onClick: () => setEditing(true), icon: <Edit3 className="h-4 w-4" /> }
        ] : []}
      />

      <ProfileTabs
        theme={theme}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          { key: 'info', label: 'Thông tin cơ bản', description: 'Hồ sơ, lớp, khoa', icon: <User className="h-5 w-5" /> },
          { key: 'face', label: 'Nhận diện khuôn mặt', description: 'Đăng ký điểm danh', icon: <Camera className="h-5 w-5" /> }
        ]}
      />

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
        {tabContent}
      </div>

      <ProfilePasswordModal
        open={changingPassword}
        onClose={() => setChangingPassword(false)}
        onSubmit={handleChangePassword}
        passwordData={passwordData as Record<string, string>}
        setPasswordData={setPasswordData as unknown as (data: Record<string, string>) => void}
        showPasswords={showPasswords as Record<string, boolean>}
        setShowPasswords={setShowPasswords as unknown as (data: Record<string, boolean>) => void}
        theme={theme}
      />
    </ProfileShell>
  );
}
