/**
 * Admin Dashboard Page (Tier 1: UI Layer)
 * ========================================
 * Single Responsibility: Orchestrate dashboard UI components
 * 
 * @module features/admin/ui/AdminDashboardPage
 */

import React from 'react';
import { Zap } from 'lucide-react';
import { useAdminDashboardPage } from '../../../model';
import AppLoadingScreen from '../../../../../shared/components/common/AppLoadingScreen';
import { 
  AdminDashboardHero,
  AdminStatsGrid,
  AdminTabContent,
  AdminSidebar,
  ClassDetailModal,
  TeacherDetailModal,
  SemesterClosureRequestsWidget,
  AdminChartsSection
} from '../../shared/dashboard';

const AdminDashboardPage: React.FC = () => {
  const {
    stats,
    loading,
    activeTab,
    setActiveTab,
    sidebarTab,
    setSidebarTab,
    classes,
    loadingClasses,
    selectedClass,
    showClassDetail,
    classStudents,
    loadingClassDetail,
    classDetailError,
    handleClassDetail,
    closeClassDetail,
    semesters,
    loadingSemesters,
    registrations,
    loadingRegistrations,
    processingId,
    pendingRegistrationsCount,
    pendingRegistrations,
    handleApproveRegistration,
    handleRejectRegistration,
    teachers,
    loadingTeachers,
    selectedTeacher,
    showTeacherDetail,
    loadingTeacherDetail,
    teacherDetailError,
    handleTeacherDetail,
    closeTeacherDetail,
    adminActionFeed,
    userProfile
  } = useAdminDashboardPage();

  const handleApprove = async (id: string): Promise<void> => {
    const result = await handleApproveRegistration(id);
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const handleReject = async (id: string): Promise<void> => {
    const result = await handleRejectRegistration(id);
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  if (loading) {
    return <AppLoadingScreen />;
  }

  return (
    <div className="space-y-6" data-ref="admin-dashboard-refactored">
      {/* Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          <AdminDashboardHero userProfile={userProfile} />
          {/* Widget yêu cầu đóng học kỳ */}
          <SemesterClosureRequestsWidget />
        </div>
        <AdminStatsGrid stats={stats} />
      </div>

      {/* Charts Section */}
      <AdminChartsSection />

      {/* Main Content: Tabs (left) + Sidebar (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 xl:col-span-7">
          <AdminTabContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            adminActionFeed={adminActionFeed}
            semesters={semesters}
            loadingSemesters={loadingSemesters}
            pendingRegistrations={pendingRegistrations}
            pendingRegistrationsCount={pendingRegistrationsCount}
            loadingRegistrations={loadingRegistrations}
            processingId={processingId}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>

        <AdminSidebar
          sidebarTab={sidebarTab}
          setSidebarTab={setSidebarTab}
          classes={classes}
          loadingClasses={loadingClasses}
          teachers={teachers}
          loadingTeachers={loadingTeachers}
          onClassClick={handleClassDetail}
          onTeacherClick={handleTeacherDetail}
        />
      </div>

      {/* Modals */}
      <ClassDetailModal
        isOpen={showClassDetail}
        selectedClass={selectedClass}
        classStudents={classStudents}
        loadingClassDetail={loadingClassDetail}
        classDetailError={classDetailError}
        onClose={closeClassDetail}
      />

      <TeacherDetailModal
        isOpen={showTeacherDetail}
        selectedTeacher={selectedTeacher}
        loadingTeacherDetail={loadingTeacherDetail}
        teacherDetailError={teacherDetailError}
        onClose={closeTeacherDetail}
      />
    </div>
  );
};

export default AdminDashboardPage;
