import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import monitorApi from '../services/monitorApi';
import {
  Users,
  Activity,
  CheckCircle,
  BarChart3,
  Bell,
  Home,
  User,
  QrCode
} from 'lucide-react';

const getActiveState = (currentPath, menuPath) => {
  if (!menuPath) return false;
  const cleanMenuPath = menuPath.replace(/\/$/, '');
  const cleanCurrentPath = currentPath.replace(/\/$/, '');
  return cleanCurrentPath === cleanMenuPath;
};

export function useMonitorSidebar() {
  const location = useLocation();
  const path = location.pathname;

  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('monitor-sidebar-collapsed') === 'true');
  const [pendingCount, setPendingCount] = useState(0);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem('monitor-sidebar-collapsed', newState.toString());
      // Dispatch a custom event for other components to listen to (e.g., layout adjustments)
      window.dispatchEvent(new Event('sidebar-toggle'));
      return newState;
    });
  }, []);

  useEffect(() => {
    const fetchCount = async () => {
      const result = await monitorApi.getPendingApprovalsCount();
      if (result.success) {
        setPendingCount(result.data.count);
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const menuStructure = useMemo(() => [
    {
      key: 'dashboard',
      to: '/monitor',
      label: 'Trang chủ',
      icon: <Home size={20} />,
      active: getActiveState(path, '/monitor'),
    },
    {
      type: 'group',
      key: 'personal',
      title: 'Cá nhân',
      icon: <User size={20} />,
      items: [
        { key: 'my-activities', to: '/monitor/my-activities', label: 'Hoạt động của tôi', icon: <Activity size={16} />, active: getActiveState(path, '/monitor/my-activities') },
        { key: 'qr-scanner', to: '/monitor/qr-scanner', label: 'Quét QR điểm danh', icon: <QrCode size={16} />, active: getActiveState(path, '/monitor/qr-scanner') },
      ],
    },
    {
      type: 'group',
      key: 'management',
      title: 'Quản lý lớp',
      icon: <Users size={20} />,
      items: [
        { key: 'class-activities', to: '/monitor/activities', label: 'Hoạt động lớp', icon: <Activity size={16} />, active: getActiveState(path, '/monitor/activities') },
        { key: 'class-approvals', to: '/monitor/approvals', label: 'Phê duyệt đăng ký', icon: <CheckCircle size={16} />, active: getActiveState(path, '/monitor/approvals'), badge: pendingCount > 0 ? pendingCount : null },
        { key: 'students', to: '/monitor/students', label: 'Sinh viên lớp', icon: <Users size={16} />, active: getActiveState(path, '/monitor/students') },
        { key: 'reports', to: '/monitor/reports', label: 'Báo cáo & Thống kê', icon: <BarChart3 size={16} />, active: getActiveState(path, '/monitor/reports') },
        { key: 'notifications', to: '/monitor/notifications', label: 'Thông báo', icon: <Bell size={16} />, active: getActiveState(path, '/monitor/notifications') },
      ],
    },
  ], [path, pendingCount]);

  return { isCollapsed, toggleSidebar, menuStructure };
}
