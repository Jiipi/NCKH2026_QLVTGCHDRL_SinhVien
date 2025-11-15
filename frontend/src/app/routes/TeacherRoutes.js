import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingSpinner } from '../../shared/components/common';
import * as LazyComponents from './lazyComponents';

const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner text="Đang tải trang..." />
  </div>
);

/**
 * TeacherRoutes - Định nghĩa tất cả routes cho Teacher (Giảng viên)
 */
export default function TeacherRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route index element={<LazyComponents.TeacherDashboardPage />} />
        <Route path="activities" element={<LazyComponents.TeacherActivitiesPage />} />
        <Route path="approve" element={<LazyComponents.TeacherActivityApprovalPage />} />
        <Route path="registrations/approve" element={<LazyComponents.TeacherRegistrationApprovalPage />} />
        <Route path="activity-types" element={<LazyComponents.ActivityTypeManagementPage />} />
        <Route path="students" element={<LazyComponents.StudentManagementPage />} />
        <Route path="students/import" element={<LazyComponents.ImportStudentsPage />} />
        <Route path="classes" element={<Navigate to="/teacher/students" replace />} />
        <Route path="notifications" element={<LazyComponents.TeacherNotificationsPage />} />
        <Route path="notifications/create" element={<LazyComponents.TeacherNotificationsPage />} />
        <Route path="reports" element={<LazyComponents.TeacherReportsPage />} />
        <Route path="reports/export" element={<LazyComponents.TeacherReportsPage />} />
        <Route path="profile" element={<LazyComponents.TeacherProfilePage />} />
        <Route path="preferences" element={<LazyComponents.TeacherPreferencesPage />} />
      </Routes>
    </Suspense>
  );
}

