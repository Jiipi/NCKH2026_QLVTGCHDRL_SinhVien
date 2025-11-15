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
 * MonitorRoutes - Định nghĩa tất cả routes cho Monitor (Lớp trưởng)
 */
export default function MonitorRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route index element={<LazyComponents.MonitorDashboard />} />
        
        {/* Personal section - Phần cá nhân */}
        <Route path="my-activities" element={<LazyComponents.MonitorMyActivitiesPage />} />
        <Route path="qr-scanner" element={<LazyComponents.QRScannerPage />} />
        <Route path="my-profile" element={<LazyComponents.MonitorProfilePage />} />
        <Route path="my-certificates" element={<LazyComponents.StudentCertificatesPage />} />
        
        {/* Class management section - Quản lý lớp */}
        <Route path="activities" element={<LazyComponents.ClassActivitiesPage />} />
        <Route path="activities/create" element={<LazyComponents.ManageActivityPage />} />
        <Route path="approvals" element={<LazyComponents.ClassApprovalsPage />} />
        <Route path="students" element={<LazyComponents.ClassStudentsPage />} />
        <Route path="reports" element={<LazyComponents.MonitorReportsPage />} />
        <Route path="notifications" element={<LazyComponents.MonitorNotificationsPage />} />
      </Routes>
    </Suspense>
  );
}

