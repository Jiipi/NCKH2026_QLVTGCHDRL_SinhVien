import React from 'react';
import AppLoadingScreen from '../../../../../shared/components/common/AppLoadingScreen';

interface ScoresLoadingProps {
  semester?: string;
  onSemesterChange?: (value: string) => void;
}

export default function ScoresLoading(_props: ScoresLoadingProps) {
  return <AppLoadingScreen />;
}
