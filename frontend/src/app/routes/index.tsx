import React from 'react';
import { Routes, useLocation } from 'react-router-dom';
import { useAppStore } from '../../shared/store';
import { adminRoutes } from './adminRoutes';
import { teacherRoutes } from './teacherRoutes';
import { monitorRoutes } from './monitorRoutes';
import { studentRoutes } from './studentRoutes';
import { commonRoutes } from './commonRoutes';

function RouteLogger() {
  const location = useLocation();
  const role = useAppStore(s => s.role);

  React.useEffect(() => {
    console.log('[RouteLogger] path change =>', location.pathname, 'role:', role);
  }, [location, role]);

  return null;
}

export function AppRoutes() {
  return React.createElement(
    'div',
    { style: { minHeight: '100vh' } },
    React.createElement(RouteLogger, null),
    React.createElement(
      Routes,
      null,
      ...commonRoutes(),
      adminRoutes(),
      teacherRoutes(),
      monitorRoutes(),
      studentRoutes()
    )
  );
}
