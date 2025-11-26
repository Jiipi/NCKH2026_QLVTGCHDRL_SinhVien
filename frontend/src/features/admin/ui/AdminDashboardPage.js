/**
 * Admin Dashboard Page (Tier 1: UI Layer)
 * ========================================
 * Single Responsibility: Orchestrate dashboard UI components
 * 
 * @module features/admin/ui/AdminDashboardPage
 */

import React from 'react';
import { Zap } from 'lucide-react';
import useAdminDashboardPage from '../model/useAdminDashboardPage';
import { 
  AdminDashboardHero,
  AdminStatsGrid,
  AdminTabContent,
  AdminSidebar,
  ClassDetailModal,
  TeacherDetailModal
} from './components/dashboard';

export default function AdminDashboardPage() {
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
    adminActionFeed
  } = useAdminDashboardPage();

  const handleApprove = async (id) => {
    const result = await handleApproveRegistration(id);
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const handleReject = async (id) => {
    const result = await handleRejectRegistration(id);
    if (result.success) {
      alert(result.message);
      } else {
      alert(result.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-red-50 to-orange-50">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-red-600 border-r-orange-600 absolute inset-0"></div>
            <Zap className="absolute inset-0 m-auto h-6 w-6 text-red-600 animate-pulse" />
          </div>
          <p className="text-gray-700 font-semibold text-lg">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-ref="admin-dashboard-refactored">
      {/* Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          <AdminDashboardHero />
        </div>
        <AdminStatsGrid stats={stats} />
      </div>

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
}
