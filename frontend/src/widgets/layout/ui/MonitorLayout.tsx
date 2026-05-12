import React, { useState, useEffect } from 'react';
import MonitorSidebar from '../../../shared/components/layout/MonitorSidebar';
import ModernHeader from '../../../widgets/header/ui/ModernHeader';
import ModernFooter from '../../../widgets/header/ui/ModernFooter';
import MobileSidebarWrapper from '../../../shared/components/layout/MobileSidebarWrapper';
import MobileMenuButton from '../../../shared/components/layout/MobileMenuButton';
import { Outlet } from 'react-router-dom';

export default function MonitorLayout({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem('monitor-sidebar-collapsed');
    return stored === 'true';
  });

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
      const stored = localStorage.getItem('monitor-sidebar-collapsed');
      setSidebarCollapsed(stored === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    const handleCustom = () => {
      const stored = localStorage.getItem('monitor-sidebar-collapsed');
      setSidebarCollapsed(stored === 'true');
    };
    window.addEventListener('monitor-sidebar-toggle', handleCustom);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('monitor-sidebar-toggle', handleCustom);
    };
  }, []);

  return React.createElement(
    'div',
    { className: 'fixed inset-0 flex overflow-hidden bg-[radial-gradient(circle_at_10%_10%,rgba(129,140,248,0.18),transparent_30%),radial-gradient(circle_at_90%_0%,rgba(45,212,191,0.14),transparent_28%),linear-gradient(135deg,#f8fafc,#eef2ff_45%,#f8fafc)] dark:bg-[radial-gradient(circle_at_10%_10%,rgba(99,102,241,0.16),transparent_30%),radial-gradient(circle_at_90%_0%,rgba(20,184,166,0.12),transparent_28%),linear-gradient(135deg,#020617,#0f172a_48%,#020617)]' },
    [
      // Desktop Sidebar - only show on desktop
      !isMobile && React.createElement('div', { key: 'desktop-sidebar' },
        React.createElement(MonitorSidebar)
      ),

      // Mobile Sidebar - only show on mobile
      isMobile && React.createElement(MobileSidebarWrapper, {
        key: 'mobile-sidebar',
        isOpen: mobileSidebarOpen,
        onClose: () => setMobileSidebarOpen(false),
        children: React.createElement(MonitorSidebar)
      }),

      // Main Content
      React.createElement('div', {
        key: 'content',
        className: 'flex-1 min-w-0 h-screen min-h-0 flex flex-col transition-all duration-300 ease-in-out',
        style: { marginLeft: isMobile ? 0 : (sidebarCollapsed ? '80px' : '288px') }
      }, [
        React.createElement(ModernHeader, {
          key: 'hdr',
          isMobile: isMobile,
          onMenuClick: () => setMobileSidebarOpen(true)
        }),
        React.createElement('main', { key: 'main', className: 'flex-1 min-h-0 overflow-y-auto overscroll-contain' }, [
          React.createElement('div', { key: 'content-div', className: 'min-w-0 px-3 py-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-6 lg:px-8 lg:py-8' },
            children || React.createElement(Outlet)
          ),
          React.createElement(ModernFooter, { key: 'footer' })
        ])
      ])

      // Mobile Menu Button - ẨN, dùng nút trong header
      // isMobile && React.createElement(MobileMenuButton, { 
      //   key: 'mobile-btn',
      //   onClick: () => setMobileSidebarOpen(true) 
      // })
    ]
  );
}
