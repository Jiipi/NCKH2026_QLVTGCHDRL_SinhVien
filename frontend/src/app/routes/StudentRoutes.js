import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadingSpinner } from '../../shared/components/common';
import * as LazyComponents from './lazyComponents';

// DEBUG: Direct import to test if lazy loading is the issue
import StudentDashboardPage from '../../features/dashboard/pages/StudentDashboardPage';

const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner text="Đang tải trang..." />
  </div>
);

/**
 * StudentRoutes - Định nghĩa tất cả routes cho Student
 */
export default function StudentRoutes() {
  console.log('[StudentRoutes] Rendering routes...');
  
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route index element={<StudentDashboardPage />} />
        <Route path="activities" element={<LazyComponents.ActivitiesListPage />} />
        <Route path="my-activities" element={<LazyComponents.MyActivitiesPage />} />
        <Route path="scores" element={<LazyComponents.StudentScoresPage />} />
        <Route path="profile" element={<LazyComponents.StudentProfilePage />} />
        <Route path="qr-scanner" element={<LazyComponents.QRScannerPage />} />
      </Routes>
    </Suspense>
  );
}

