import React from 'react';
import AppLoadingScreen from '../../../../shared/components/common/AppLoadingScreen';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingState(_props: LoadingStateProps) {
  return <AppLoadingScreen />;
}
