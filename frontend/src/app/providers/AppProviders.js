import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { TabSessionProvider } from '../../contexts/TabSessionContext';

/**
 * AppProviders - Tập trung tất cả các providers của ứng dụng
 * Giúp code App.js gọn gàng và dễ quản lý hơn
 */
export function AppProviders({ children }) {
  return (
    <TabSessionProvider>
      <NotificationProvider>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </NotificationProvider>
    </TabSessionProvider>
  );
}

