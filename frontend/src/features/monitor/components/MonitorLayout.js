import React from 'react';
import { Outlet } from 'react-router-dom';
import { useMonitorLayout } from '../hooks/useMonitorLayout';
import MonitorSidebar from './MonitorSidebar';
import ModernHeader from '../../../widgets/header/ui/ModernHeader';
import ModernFooter from '../../../widgets/header/ui/ModernFooter';
import MobileSidebarWrapper from '../../../components/MobileSidebarWrapper';

export default function MonitorLayout({ children }) {
  const {
    mobileSidebarOpen,
    isMobile,
    sidebarCollapsed,
    closeMobileSidebar,
    openMobileSidebar
  } = useMonitorLayout();

  return React.createElement(
    'div',
    { className: 'fixed inset-0 flex bg-gray-50 dark:bg-slate-950' },
    [
      // Desktop Sidebar - only show on desktop
      !isMobile && React.createElement('div', { key: 'desktop-sidebar' }, 
        React.createElement(MonitorSidebar)
      ),
      
      // Mobile Sidebar - only show on mobile
      isMobile && React.createElement(MobileSidebarWrapper, { 
        key: 'mobile-sidebar',
        isOpen: mobileSidebarOpen, 
        onClose: closeMobileSidebar
      }, React.createElement(MonitorSidebar)),

      // Main Content
      React.createElement('div', { 
        key: 'content', 
        className: 'flex-1 min-w-0 h-screen flex flex-col transition-all duration-300 ease-in-out', 
        style: { marginLeft: isMobile ? 0 : (sidebarCollapsed ? '80px' : '288px') } 
      }, [
        React.createElement(ModernHeader, { 
          key: 'hdr',
          isMobile: isMobile,
          onMenuClick: openMobileSidebar
        }),
        React.createElement('main', { key: 'main', className: 'flex-1 overflow-y-auto' }, [
          React.createElement('div', { key: 'content-div', className: 'px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8' }, 
            children || React.createElement(Outlet)
          ),
          React.createElement(ModernFooter, { key: 'footer' })
        ])
      ])
    ]
  );
}

