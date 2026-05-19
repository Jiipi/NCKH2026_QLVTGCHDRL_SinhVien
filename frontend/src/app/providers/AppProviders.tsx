import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '../routes';
import ErrorBoundary from '../../shared/components/ErrorBoundary';
import { TabSessionProvider } from '../../shared/contexts/TabSessionContext';
import { NotificationProvider } from '../../shared/contexts/NotificationContext';
import { SemesterProvider } from '../../shared/contexts/SemesterContext';
import AppLoadingScreen from '../../shared/components/common/AppLoadingScreen';

const loadingFallback = React.createElement(AppLoadingScreen, { fullScreen: true });

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
