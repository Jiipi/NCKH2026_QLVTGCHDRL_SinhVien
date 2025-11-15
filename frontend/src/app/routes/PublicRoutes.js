import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadingSpinner } from '../../shared/components/common';
import * as LazyComponents from './lazyComponents';

const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner text="Đang tải..." />
  </div>
);

/**
 * PublicRoutes - Định nghĩa tất cả routes công khai (không cần đăng nhập)
 */
export default function PublicRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<LazyComponents.LoginModern />} />
        <Route path="/register" element={<LazyComponents.RegisterModern />} />
        <Route path="/forgot-password" element={<LazyComponents.ForgotPasswordModern />} />
        <Route path="/reset-password" element={<LazyComponents.ResetPasswordModern />} />
      </Routes>
    </Suspense>
  );
}

