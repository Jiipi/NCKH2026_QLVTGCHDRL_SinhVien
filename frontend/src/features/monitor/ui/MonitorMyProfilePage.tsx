import { useEffect, useState } from 'react';
import { Camera, Edit3, Key, Shield, Trophy, User } from 'lucide-react';
import useStudentProfile from '../../student/model/hooks/useStudentProfile';
import { dashboardApi } from '../../../shared/api/dashboardApi';
import { formatDateVN } from '../../../shared/lib/date';
import { FaceRegistrationPageContent } from '../../face-recognition/ui/pages/FaceRegistrationPage';
import AppLoadingScreen from '../../../shared/components/common/AppLoadingScreen';
import {
  ProfileEditCard,
  ProfileHeroCard,
  ProfileInfoGrid,
  ProfilePasswordPanel,
  ProfileShell,
  ProfileTabs,
  profileThemes
} from '../../profile';

export default function MonitorMyProfilePage() {
  const [stats, setStats] = useState({ totalActivities: 0, totalPoints: 0, completedActivities: 0 });
  const [activeTab, setActiveTab] = useState('info');

  const {
    profile,
    loading,
    editing,
    setEditing,
    formData,
    setFormData,
    passwordData,
    setPasswordData,
    showPasswords,
    setShowPasswords,
    handleUpdateProfile,
    handleChangePassword,
    canDisplayImage,
    directImageUrl,
    getGenderDisplay,
    getStatusText
  } = useStudentProfile();

  const theme = profileThemes.monitor;
  const infoItems = [
    { label: 'Họ và tên', value: profile?.ho_ten, icon: <User className="h-5 w-5" /> },
    { label: 'MSSV', value: profile?.mssv, icon: <User className="h-5 w-5" /> },
    { label: 'Lớp', value: profile?.lop?.ten_lop || profile?.ten_lop || profile?.lop, icon: <User className="h-5 w-5" /> },
    { label: 'Khoa', value: profile?.khoa?.ten_khoa || profile?.ten_khoa || profile?.khoa, icon: <Shield className="h-5 w-5" /> },
    { label: 'Niên khóa', value: profile?.nienkhoa || profile?.nien_khoa, icon: <Trophy className="h-5 w-5" /> },
    { label: 'Ngày sinh', value: profile?.ngay_sinh ? formatDateVN(profile.ngay_sinh) : '', icon: <User className="h-5 w-5" /> },
    { label: 'Giới tính', value: getGenderDisplay(profile?.gt), icon: <User className="h-5 w-5" /> },
    { label: 'Email', value: profile?.email, icon: <Shield className="h-5 w-5" /> },
    { label: 'Số điện thoại', value: profile?.sdt, icon: <User className="h-5 w-5" /> },
    { label: 'Địa chỉ', value: profile?.dia_chi, icon: <User className="h-5 w-5" /> },
    { label: 'Tên đăng nhập', value: profile?.ten_dn, icon: <User className="h-5 w-5" /> },
    { label: 'Vai trò', value: 'Lớp trưởng', icon: <Shield className="h-5 w-5" /> },
    { label: 'Trạng thái', value: getStatusText(profile?.trang_thai), icon: <Shield className="h-5 w-5" /> },
    { label: 'Ngày tạo', value: profile?.ngay_tao ? formatDateVN(profile.ngay_tao) : '', icon: <Trophy className="h-5 w-5" /> },
    { label: 'Lần đăng nhập cuối', value: profile?.lan_cuoi_dn ? formatDateVN(profile.lan_cuoi_dn) : '', icon: <Trophy className="h-5 w-5" /> }
  ];

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const result = await dashboardApi.getMyActivities('');
      if (result.success && 'data' in result) {
        const registrations = result.data || [];
        const totalActivities = registrations.length;
        const completedActivities = registrations.filter((r: any) => r.trang_thai_dk === 'da_tham_gia').length;
        const totalPoints = registrations.filter((r: any) => r.trang_thai_dk === 'da_tham_gia').reduce((sum: number, r: any) => sum + (parseFloat(r.hoat_dong?.diem_rl) || 0), 0);
        setStats({ totalActivities, completedActivities, totalPoints });
      }
    } catch (error) {
      console.error('Stats load error:', error);
    }
  };

  if (loading) {
    return <AppLoadingScreen />;
  }

  return (
    <ProfileShell theme={theme}>
      <ProfileHeroCard
        profile={profile}
        theme={theme}
        title={profile?.ho_ten || 'Lớp trưởng'}
        subtitle={profile?.email || profile?.mssv}
        roleLabel={theme.label}
        statusLabel={getStatusText(profile?.trang_thai)}
        statusActive={profile?.trang_thai !== 'khoa' && profile?.trang_thai !== 'khong_hoat_dong'}
        avatarUrl={canDisplayImage ? directImageUrl : null}
        metaItems={[
          { label: 'Hoạt động', value: stats.totalActivities, icon: <Trophy className="h-4 w-4" /> },
          { label: 'Đã tham gia', value: stats.completedActivities, icon: <User className="h-4 w-4" /> },
          { label: 'Điểm RL', value: stats.totalPoints, icon: <Shield className="h-4 w-4" /> }
        ]}
        actions={activeTab === 'info' && !editing ? [
          { label: 'Bảo mật', onClick: () => setActiveTab('security'), icon: <Key className="h-4 w-4" />, variant: 'secondary' },
          { label: 'Chỉnh sửa', onClick: () => setEditing(true), icon: <Edit3 className="h-4 w-4" /> }
        ] : []}
      />

      <ProfileTabs
        theme={theme}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          { key: 'info', label: 'Thông tin cá nhân', description: 'Hồ sơ lớp trưởng', icon: <User className="h-5 w-5" /> },
          { key: 'security', label: 'Bảo mật', description: 'Đổi mật khẩu', icon: <Shield className="h-5 w-5" /> },
          { key: 'face', label: 'Nhận diện khuôn mặt', description: 'Đăng ký điểm danh', icon: <Camera className="h-5 w-5" /> }
        ]}
      />

      {activeTab === 'info' && (
        editing ? (
          <ProfileEditCard
            formData={formData as Record<string, any>}
            setFormData={setFormData as unknown as (data: Record<string, any>) => void}
            onSubmit={handleUpdateProfile}
            onCancel={() => setEditing(false)}
            theme={theme}
          />
        ) : (
          <ProfileInfoGrid
            title="Thông tin lớp trưởng"
            description="Thông tin cá nhân, liên hệ và tài khoản lớp trưởng."
            items={infoItems}
            theme={theme}
            columns={2}
          />
        )
      )}

      {activeTab === 'security' && (
        <ProfilePasswordPanel
          onSubmit={handleChangePassword}
          passwordData={passwordData as Record<string, string>}
          setPasswordData={setPasswordData as unknown as (data: Record<string, string>) => void}
          showPasswords={showPasswords as Record<string, boolean>}
          setShowPasswords={setShowPasswords as unknown as (data: Record<string, boolean>) => void}
          theme={theme}
        />
      )}

      {activeTab === 'face' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
          <FaceRegistrationPageContent embedded />
        </div>
      )}
    </ProfileShell>
  );
}
