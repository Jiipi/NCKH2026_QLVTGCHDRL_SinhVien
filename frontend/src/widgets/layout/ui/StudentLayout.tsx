import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import StudentSidebar from '../../../shared/components/layout/StudentSidebar';
import ModernHeader from '../../../widgets/header/ui/ModernHeader';
import ModernFooter from '../../../widgets/header/ui/ModernFooter';
import MobileSidebarWrapper from '../../../shared/components/layout/MobileSidebarWrapper';
import MobileMenuButton from '../../../shared/components/layout/MobileMenuButton';
import MobileBottomNav from '../../../shared/components/layout/MobileBottomNav';
import { useIsMobile } from '../../../shared/design-system/hooks/useMediaQuery';

export default function StudentLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem('student-sidebar-collapsed');
    return stored === 'true';
  });

  // Mobile sidebar state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // Auto-close mobile sidebar when leaving mobile breakpoint
  useEffect(() => {
    if (!isMobile) {
      setMobileSidebarOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('student-sidebar-collapsed');
      setSidebarCollapsed(stored === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    // Listen to custom events from sidebar toggle for same-tab updates
    const handleCustom = () => {
      const stored = localStorage.getItem('student-sidebar-collapsed');
      setSidebarCollapsed(stored === 'true');
    };
    window.addEventListener('student-sidebar-toggle', handleCustom);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('student-sidebar-toggle', handleCustom);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-[radial-gradient(circle_at_10%_10%,rgba(129,140,248,0.18),transparent_30%),radial-gradient(circle_at_90%_0%,rgba(45,212,191,0.14),transparent_28%),linear-gradient(135deg,#f8fafc,#eef2ff_45%,#f8fafc)] dark:bg-[radial-gradient(circle_at_10%_10%,rgba(99,102,241,0.16),transparent_30%),radial-gradient(circle_at_90%_0%,rgba(20,184,166,0.12),transparent_28%),linear-gradient(135deg,#020617,#0f172a_48%,#020617)]">
      {/* Desktop Sidebar - only render on desktop */}
      {!isMobile && <StudentSidebar />}

      {/* Mobile Sidebar with overlay - only render on mobile */}
      {isMobile && (
        <MobileSidebarWrapper 
          isOpen={mobileSidebarOpen} 
          onClose={() => setMobileSidebarOpen(false)}
        >
          <StudentSidebar />
        </MobileSidebarWrapper>
      )}

      {/* Main Content */}
      <div 
        className="flex-1 min-w-0 h-screen min-h-0 flex flex-col transition-all duration-300 ease-in-out"
        style={{ 
          marginLeft: isMobile ? 0 : (sidebarCollapsed ? '80px' : '288px')
        }}
      >
        <ModernHeader 
          isMobile={isMobile}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />
        <main className="flex-1 min-h-0 overflow-y-auto flex flex-col overscroll-contain">
          <div className="flex-1 flex min-w-0 flex-col px-3 py-3 pb-[max(72px,calc(64px+env(safe-area-inset-bottom)))] sm:px-6 sm:py-6 sm:pb-[max(1rem,env(safe-area-inset-bottom))] lg:px-8 lg:py-8">
            {children || <Outlet />}
          </div>
          <ModernFooter />
        </main>
      </div>

      {isMobile && <MobileBottomNav />}

      {/* Mobile Menu Button - FAB ẨN, dùng nút trong header */}
      {/* {isMobile && (
        <MobileMenuButton onClick={() => setMobileSidebarOpen(true)} />
      )} */}
    </div>
  );
}
