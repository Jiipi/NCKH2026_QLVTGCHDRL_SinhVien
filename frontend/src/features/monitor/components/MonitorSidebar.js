import React, { useRef, useEffect } from 'react';
import { Users, ChevronsLeft, Menu } from 'lucide-react';
import { useMonitorSidebar } from '../hooks/useMonitorSidebar';
import { SidebarMenuItem } from '../../../shared/components/layout/sidebar/SidebarMenuItem';
import { SidebarMenuGroup } from '../../../shared/components/layout/sidebar/SidebarMenuGroup';

const SidebarHeader = ({ collapsed, onToggle }) => (
  <div className={`h-16 flex items-center border-b border-gray-700/50 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 relative ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
    {collapsed ? (
      <button
        onClick={onToggle}
        className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg hover:shadow-blue-500/50 hover:scale-105 transition-all cursor-pointer"
        title="Mở rộng sidebar"
      >
        <Menu className="w-6 h-6 text-white" />
      </button>
    ) : (
      <>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm">Lớp trưởng</div>
            <div className="text-gray-400 text-xs">Quản lý lớp</div>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="relative p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300 group ring-2 ring-white/20 hover:ring-white/40"
          title="Thu gọn sidebar"
        >
          <ChevronsLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </>
    )}
  </div>
);

export default function MonitorSidebar() {
  const { isCollapsed, toggleSidebar, menuStructure } = useMonitorSidebar();
  const asideRef = useRef(null);

  useEffect(() => {
    const updateCssVar = () => {
      const width = isCollapsed ? 80 : 288;
      document.documentElement.style.setProperty('--sidebar-w', `${width}px`);
    };
    updateCssVar();
    window.addEventListener('sidebar-toggle', updateCssVar);
    return () => window.removeEventListener('sidebar-toggle', updateCssVar);
  }, [isCollapsed]);

  return (
    <aside
      ref={asideRef}
      className={`fixed left-0 top-0 h-screen z-30 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-72'} bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-r border-gray-700/50 shadow-2xl`}
    >
      <SidebarHeader collapsed={isCollapsed} onToggle={toggleSidebar} />
      <nav className={`flex-1 py-6 space-y-2 ${isCollapsed ? 'px-2' : 'px-3'}`}>
        {!isCollapsed && (
          <div className="px-4 mb-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Menu chính</div>
          </div>
        )}
        {menuStructure.map(item => {
          if (item.type === 'group') {
            return (
              <SidebarMenuGroup
                key={item.key}
                title={item.title}
                groupKey={item.key}
                icon={item.icon}
                collapsed={isCollapsed}
                defaultOpen={true}
              >
                {item.items.map(subItem => (
                  <SidebarMenuItem
                    key={subItem.key}
                    to={subItem.to}
                    icon={subItem.icon}
                    label={subItem.label}
                    badge={subItem.badge}
                    active={subItem.active}
                    collapsed={isCollapsed}
                    inDropdown={isCollapsed}
                  />
                ))}
              </SidebarMenuGroup>
            );
          }
          return (
            <SidebarMenuItem
              key={item.key}
              to={item.to}
              icon={item.icon}
              label={item.label}
              badge={item.badge}
              active={item.active}
              collapsed={isCollapsed}
            />
          );
        })}
      </nav>
    </aside>
  );
}
