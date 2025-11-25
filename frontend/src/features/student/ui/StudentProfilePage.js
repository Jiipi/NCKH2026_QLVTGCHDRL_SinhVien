import React from 'react';
import useStudentProfile from '../model/hooks/useStudentProfile';
import ProfileHero from './components/Profile/ProfileHero';
import ProfileDetails from './components/Profile/ProfileDetails';
import ProfileEditForm from './components/Profile/ProfileEditForm';
import PasswordChangeModal from './components/Profile/PasswordChangeModal';
import ProfileLoading from './components/Profile/ProfileLoading';
import ProfileEmpty from './components/Profile/ProfileEmpty';

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
    formatDateVN
  } = useStudentProfile();

  if (loading) {
    return <ProfileLoading />;
  }

  if (!profile) {
    return <ProfileEmpty />;
  }

  const renderContent = editing ? (
    <ProfileEditForm
      formData={formData}
      setFormData={setFormData}
      profile={profile}
      formatDateVN={formatDateVN}
      getGenderDisplay={getGenderDisplay}
      onSubmit={handleUpdateProfile}
      onCancel={() => setEditing(false)}
    />
  ) : (
    <ProfileDetails
      profile={profile}
      canDisplayImage={canDisplayImage}
      directImageUrl={directImageUrl}
      formatDateVN={formatDateVN}
      getGenderDisplay={getGenderDisplay}
      getStatusText={getStatusText}
    />
  );

  return (
    <div className="space-y-6" data-ref="student-profile-refactored">
      <ProfileHero
        profile={profile}
        canDisplayImage={canDisplayImage}
        directImageUrl={directImageUrl}
        editing={editing}
        changingPassword={changingPassword}
        onEdit={() => setEditing(true)}
        onChangePassword={() => setChangingPassword(true)}
      />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex flex-col items-center gap-1 py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500'
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
        <div className="p-6">{renderContent}</div>
      </div>

      <PasswordChangeModal
        visible={changingPassword}
        passwordData={passwordData}
        setPasswordData={setPasswordData}
        showPasswords={showPasswords}
        setShowPasswords={setShowPasswords}
        onClose={() => setChangingPassword(false)}
        onSubmit={handleChangePassword}
      />
    </div>
  );
}

