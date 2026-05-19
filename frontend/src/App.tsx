import React from 'react';
import './shared/styles/sidebar-fix.css';
import './shared/styles/layout-fix.css';
import './shared/styles/modern-admin.css';
import { useAppLifecycle } from './app/model/useAppLifecycle';
import { AppProviders } from './app/providers/AppProviders';
import AppLoadingScreen from './shared/components/common/AppLoadingScreen';

function App() {
  const { hydrated } = useAppLifecycle();

  if (!hydrated) {
    return React.createElement(AppLoadingScreen, { fullScreen: true, title: 'Đang khôi phục phiên', message: 'Vui lòng chờ trong giây lát...' });
  }

  return React.createElement(AppProviders);
}

export default App;
