import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '../routes';
import ErrorBoundary from '../../shared/components/ErrorBoundary';
import { TabSessionProvider } from '../../shared/contexts/TabSessionContext';
import { NotificationProvider } from '../../shared/contexts/NotificationContext';
import { SemesterProvider } from '../../shared/contexts/SemesterContext';

const loadingFallback = React.createElement(
  'div',
  { className: 'flex items-center justify-center min-h-screen text-sm text-gray-500' },
  'Đang tải...'
);

export function AppProviders() {
  return React.createElement(
    TabSessionProvider,
    null,
    React.createElement(
      NotificationProvider,
      null,
      React.createElement(
        SemesterProvider,
        null,
        React.createElement(
          ErrorBoundary,
          null,
          React.createElement(
            React.Suspense,
            { fallback: loadingFallback },
            React.createElement(
              BrowserRouter,
              null,
              React.createElement(AppRoutes)
            )
          )
        )
      )
    )
  );
}
