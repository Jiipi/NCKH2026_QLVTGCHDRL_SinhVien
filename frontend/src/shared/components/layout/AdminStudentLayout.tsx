import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminStudentSidebar from './AdminStudentSidebar';
import ModernHeader from '../../../widgets/header/ui/ModernHeader';
import ModernFooter from '../../../widgets/header/ui/ModernFooter';
import MobileSidebarWrapper from './MobileSidebarWrapper';

export default function AdminStudentLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem('admin-sidebar-collapsed');
    return stored === 'true';
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('admin-sidebar-collapsed');
      setSidebarCollapsed(stored === 'true');
    };
    const handleCustom = () => {
      const stored = localStorage.getItem('admin-sidebar-collapsed');
      setSidebarCollapsed(stored === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('admin-sidebar-toggle', handleCustom);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('admin-sidebar-toggle', handleCustom);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-[radial-gradient(circle_at_10%_10%,rgba(129,140,248,0.18),transparent_30%),radial-gradient(circle_at_90%_0%,rgba(45,212,191,0.14),transparent_28%),linear-gradient(135deg,#f8fafc,#eef2ff_45%,#f8fafc)] dark:bg-[radial-gradient(circle_at_10%_10%,rgba(99,102,241,0.16),transparent_30%),radial-gradient(circle_at_90%_0%,rgba(20,184,166,0.12),transparent_28%),linear-gradient(135deg,#020617,#0f172a_48%,#020617)]">
      {!isMobile && <AdminStudentSidebar />}
      {isMobile && (
        <MobileSidebarWrapper isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)}>
          <AdminStudentSidebar />
        </MobileSidebarWrapper>
      )}
      <div 
        className="flex-1 min-w-0 h-screen min-h-0 flex flex-col transition-all duration-300 ease-in-out"
        style={{ marginLeft: isMobile ? 0 : (sidebarCollapsed ? '80px' : '288px') }}
      >
        <ModernHeader 
          isMobile={isMobile}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />
        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <div className="min-w-0 px-3 py-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
          <ModernFooter />
        </main>
      </div>
    </div>
  );
}


