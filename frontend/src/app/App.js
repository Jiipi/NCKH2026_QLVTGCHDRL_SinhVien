import React, { Suspense, useLayoutEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';

// Route components
import AdminRoutes from './routes/AdminRoutes';
import StudentRoutes from './routes/StudentRoutes';
import TeacherRoutes from './routes/TeacherRoutes';
import MonitorRoutes from './routes/MonitorRoutes';
import PublicRoutes from './routes/PublicRoutes';

// Guards và Providers
import { RoleGuard, HomeRouter } from './guards';
import { AppProviders } from './providers';

// Store và Services
import { useAppStore } from '../shared/store/useAppStore';
import sessionStorageManager from '../shared/api/sessionStorageManager';

// Layouts
import AdminStudentLayout from '../components/AdminStudentLayout';
import StudentLayout from '../widgets/layout/ui/StudentLayout';
import ModernTeacherLayout from '../widgets/layout/ui/TeacherLayout';
import MonitorLayout from '../widgets/layout/ui/MonitorLayout';

// Shared Components
import LoadingSpinner from '../shared/components/common/LoadingSpinner';

/**
 * App Component - Root component của ứng dụng
 * Quản lý routing và authentication state hydration
 */
export default function App() {
  const [isHydrated, setIsHydrated] = useState(false);

  // Khôi phục auth state từ session storage trước khi render
  useLayoutEffect(() => {
    try {
      const session = sessionStorageManager.getSession();
      if (session?.token && session?.role) {
        const { token: curToken, role: curRole } = useAppStore.getState();
        const nextToken = session.token;
        const nextRole = (session.user?.role || session.role || '').toString().toUpperCase();
        const nextUser = session.user || null;
        
        // Chỉ cập nhật store khi giá trị thực sự thay đổi
        if (curToken !== nextToken || curRole !== nextRole) {
          useAppStore.getState().setAuth({ 
            token: nextToken, 
            role: nextRole, 
            user: nextUser 
          });
        }
      }
    } catch (error) {
      console.warn('Failed to hydrate auth state:', error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Hiển thị loading trong khi hydrate
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Đang tải phiên làm việc...</p>
        </div>
      </div>
    );
  }

  return (
    <AppProviders>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/*" element={<PublicRoutes />} />

              {/* Admin Routes */}
          <Route 
            path="/admin/*" 
            element={
              <RoleGuard allow={['ADMIN']}>
                <AdminStudentLayout>
                  <AdminRoutes />
                </AdminStudentLayout>
              </RoleGuard>
            } 
          />

              {/* Teacher Routes */}
          <Route 
            path="/teacher/*" 
            element={
              <RoleGuard allow={['GIANG_VIEN']}>
                <ModernTeacherLayout>
                  <TeacherRoutes />
                </ModernTeacherLayout>
              </RoleGuard>
            } 
          />

              {/* Monitor Routes */}
          <Route 
            path="/monitor/*" 
            element={
              <RoleGuard allow={['LOP_TRUONG']}>
                <MonitorLayout>
                  <MonitorRoutes />
                </MonitorLayout>
              </RoleGuard>
            } 
          />

              {/* Student Routes */}
          <Route 
            path="/student/*" 
            element={
              <RoleGuard allow={['SINH_VIEN', 'STUDENT']}>
                <StudentLayout>
                  <StudentRoutes />
                </StudentLayout>
              </RoleGuard>
            } 
          />
              
          {/* Root path - redirect dựa trên role */}
          <Route 
            path="/" 
            element={
              <RoleGuard>
                <HomeRouter />
              </RoleGuard>
            } 
          />

          {/* Fallback cho các route không xác định */}
          <Route 
            path="*" 
            element={
              <RoleGuard>
                <HomeRouter />
              </RoleGuard>
            } 
          />
            </Routes>
          </Suspense>
    </AppProviders>
  );
}

