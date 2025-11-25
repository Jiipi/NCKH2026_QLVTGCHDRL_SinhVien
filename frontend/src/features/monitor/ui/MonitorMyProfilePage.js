import React, { useState, useEffect } from 'react';
import { User, Edit3, Shield, Key } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import useStudentProfile from '../../student/model/hooks/useStudentProfile';
import { studentActivitiesApi } from '../../student/services/studentActivitiesApi';
import ProfileHeader from './components/Profile/ProfileHeader';
import ProfileInfoSection from './components/Profile/ProfileInfoSection';
import ProfileEditForm from './components/Profile/ProfileEditForm';
import PasswordChangeForm from './components/Profile/PasswordChangeForm';

export default function MonitorMyProfilePage() {
  const { user } = useAppStore();
  const [stats, setStats] = useState({ totalActivities: 0, totalPoints: 0, completedActivities: 0 });
  const [activeTab, setActiveTab] = useState('info');

  const {
    profile,
    loading,
    editing,
    setEditing,
    changingPassword,
    setChangingPassword,
    formData,
    setFormData,
    passwordData,
    setPasswordData,
    showPasswords,
    setShowPasswords,
    loadProfile,
    handleUpdateProfile,
    handleChangePassword
  } = useStudentProfile();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const result = await studentActivitiesApi.getMyActivities();
      if (result.success) {
        const registrations = result.data || [];
        const totalActivities = registrations.length;
        const completedActivities = registrations.filter(r => r.trang_thai_dk === 'da_tham_gia').length;
        const totalPoints = registrations.filter(r => r.trang_thai_dk === 'da_tham_gia').reduce((sum, r) => sum + (parseFloat(r.hoat_dong?.diem_rl) || 0), 0);
        setStats({ totalActivities, completedActivities, totalPoints });
      }
    } catch (error) {
      console.error('Stats load error:', error);
    }
  };

  const getGenderDisplay = (gt) => {
    if (!gt) return 'Chưa cập nhật';
    const genderMap = { 'nam': '👨 Nam', 'nu': '👩 Nữ', 'khac': '🧑 Khác' };
    return genderMap[gt?.toLowerCase()] || gt;
  };
  const getStatusText = (status) => ({ 'hoat_dong': '✅ Hoạt động', 'khoa': '🔒 Đã khóa', 'cho_duyet': '⏳ Chờ duyệt' }[status] || status);
  const isValidImageUrl = (url) => !!url && (url.startsWith('data:image/') || url.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i) || ['i.pinimg.com','images.unsplash.com','cdn','imgur.com','googleusercontent.com'].some(d => url.includes(d)));
  const getDirectImageUrl = (url) => { if (!url) return null; if (url.startsWith('data:image/')) return url; if (url.includes('drive.google.com')) { const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/); if (match) return `https://drive.google.com/uc?export=view&id=${match[1]}`; } return url; };

  if (loading) return (<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>);

  const avatarUrl = getDirectImageUrl(profile?.anh_dai_dien);
  const hasValidAvatar = isValidImageUrl(avatarUrl);

  return (
    <div className="p-6 space-y-6">
      <ProfileHeader
        profile={profile}
        stats={stats}
        avatarUrl={avatarUrl}
        hasValidAvatar={hasValidAvatar}
      />

      <div className="bg-white border rounded-lg">
        <div className="flex border-b">
          <button onClick={() => setActiveTab('info')} className={`flex-1 px-6 py-4 font-semibold transition-all ${activeTab === 'info' ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}>
            <div className="flex items-center justify-center gap-2"><User className="h-5 w-5" />Thông tin cá nhân</div>
          </button>
          <button onClick={() => setActiveTab('security')} className={`flex-1 px-6 py-4 font-semibold transition-all ${activeTab === 'security' ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}>
            <div className="flex items-center justify-center gap-2"><Shield className="h-5 w-5" />Bảo mật</div>
          </button>
        </div>
        <div className="p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {editing ? (
                <ProfileEditForm
                  formData={formData}
                  setFormData={setFormData}
                  profile={profile}
                  handleUpdateProfile={handleUpdateProfile}
                  setEditing={setEditing}
                />
              ) : (
                <>
                  <ProfileInfoSection
                    profile={profile}
                    getGenderDisplay={getGenderDisplay}
                    getStatusText={getStatusText}
                  />
                  <button 
                    onClick={() => setEditing(true)} 
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all"
                  >
                    <Edit3 className="h-4 w-4" />Chỉnh sửa thông tin
                  </button>
                </>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {changingPassword ? (
                <PasswordChangeForm
                  passwordData={passwordData}
                  setPasswordData={setPasswordData}
                  showPasswords={showPasswords}
                  setShowPasswords={setShowPasswords}
                  handleChangePassword={handleChangePassword}
                  setChangingPassword={setChangingPassword}
                />
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 rounded-lg p-3">
                        <Key className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">Mật khẩu</h4>
                        <p className="text-sm text-gray-600 mb-4">Đổi mật khẩu thường xuyên để bảo vệ tài khoản của bạn</p>
                        <button 
                          onClick={() => setChangingPassword(true)} 
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all"
                        >
                          <Key className="h-4 w-4" />Đổi mật khẩu
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
