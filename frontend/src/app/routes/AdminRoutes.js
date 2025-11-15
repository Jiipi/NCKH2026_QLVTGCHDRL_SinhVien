import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadingSpinner } from '../../shared/components/common';
import * as LazyComponents from './lazyComponents';

const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner text="Đang tải trang..." />
  </div>
);

/**
 * AdminRoutes - Định nghĩa tất cả routes cho Admin
 */
export default function AdminRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route index element={<LazyComponents.AdminDashboard />} />
        <Route path="users" element={<LazyComponents.AdminUsersPage />} />
        <Route path="activities" element={<LazyComponents.AdminActivitiesPage />} />
        <Route path="roles" element={<LazyComponents.AdminRolesPage />} />
        <Route path="activities/create" element={<LazyComponents.ManageActivityPage />} />
        <Route path="activities/:id/edit" element={<LazyComponents.ManageActivityPage />} />
        <Route path="approvals" element={<LazyComponents.AdminApprovalsPage />} />
        <Route path="reports" element={<LazyComponents.AdminReportsPage />} />
        <Route path="notifications" element={<LazyComponents.AdminNotificationsPage />} />
        <Route path="qr-attendance" element={<LazyComponents.AdminQRAttendancePage />} />
        <Route path="activity-types" element={<LazyComponents.ActivityTypeManagementPage />} />
        <Route path="semesters" element={<LazyComponents.SemesterManagementPage />} />
        <Route path="settings" element={<LazyComponents.AdminSettingsPage />} />
        <Route path="profile" element={<LazyComponents.AdminProfilePage />} />
      </Routes>
    </Suspense>
  );
}

