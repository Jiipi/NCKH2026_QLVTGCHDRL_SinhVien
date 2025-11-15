import { useState, useEffect } from 'react';

export function useMonitorLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem('monitor-sidebar-collapsed');
    return stored === 'true';
  });

  // Handle mobile detection
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

  // Handle sidebar collapse state sync
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

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(prev => !prev);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  const openMobileSidebar = () => {
    setMobileSidebarOpen(true);
  };

  return {
    mobileSidebarOpen,
    isMobile,
    sidebarCollapsed,
    toggleMobileSidebar,
    closeMobileSidebar,
    openMobileSidebar
  };
}

