import React from 'react';
import './shared/styles/sidebar-fix.css';
import './shared/styles/layout-fix.css';
import './shared/styles/modern-admin.css';
import { useAppLifecycle } from './app/model/useAppLifecycle';
import { AppProviders } from './app/providers/AppProviders';

function App() {
  const { hydrated } = useAppLifecycle();

  if (!hydrated) {
    return React.createElement('div', { className: 'flex items-center justify-center min-h-screen text-sm text-gray-500' }, 'Đang tải phiên...');
  }

  return React.createElement(AppProviders);
}

export default App;
