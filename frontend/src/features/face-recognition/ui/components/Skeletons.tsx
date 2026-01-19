/**
 * Face Recognition Skeleton Loading Components
 * =============================================
 * Các component loading UI cho face recognition
 */
import React from 'react';

interface SkeletonProps {
  className?: string;
}

/**
 * Base skeleton element with shimmer animation
 */
export const Skeleton: React.FC<SkeletonProps & { width?: string; height?: string }> = ({
  className = '',
  width,
  height
}) => (
  <div
    className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    style={{ width, height }}
  />
);

/**
 * Skeleton cho Camera preview
 */
export const CameraSkeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`relative ${className}`}>
    <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
      {/* Fake camera frame */}
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-800 to-gray-900" />
      
      {/* Center loading indicator */}
      <div className="relative z-10 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-700/50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <Skeleton width="120px" height="12px" className="mx-auto mb-2" />
        <Skeleton width="80px" height="10px" className="mx-auto" />
      </div>
      
      {/* Fake face oval overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <ellipse 
            cx="50" cy="45" rx="25" ry="35" 
            fill="none" 
            stroke="#6b7280" 
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        </svg>
      </div>
    </div>
    
    {/* Controls skeleton */}
    <div className="flex justify-center gap-4 mt-4">
      <Skeleton width="120px" height="44px" className="rounded-lg" />
      <Skeleton width="100px" height="44px" className="rounded-lg" />
    </div>
  </div>
);

/**
 * Skeleton cho Face Registration Page
 */
export const FaceRegistrationPageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div className="max-w-3xl mx-auto px-4">
      {/* Header skeleton */}
      <div className="mb-8">
        <Skeleton width="200px" height="36px" className="mb-2" />
        <Skeleton width="300px" height="20px" />
      </div>
      
      {/* Status card skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
        {/* Header */}
        <div className="p-6 bg-gray-300 dark:bg-gray-600 animate-pulse">
          <div className="flex items-center gap-4">
            <Skeleton width="56px" height="56px" className="rounded-full" />
            <div>
              <Skeleton width="120px" height="24px" className="mb-2" />
              <Skeleton width="180px" height="16px" />
            </div>
          </div>
        </div>
        
        {/* Body */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <Skeleton width="100px" height="14px" className="mb-2" />
              <Skeleton width="40px" height="32px" />
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <Skeleton width="120px" height="14px" className="mb-2" />
              <Skeleton width="80px" height="32px" />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
            <Skeleton width="100%" height="48px" className="rounded-lg" />
            <Skeleton width="80px" height="48px" className="rounded-lg" />
          </div>
        </div>
      </div>
      
      {/* Info card skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <Skeleton width="250px" height="24px" className="mb-4" />
        
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton width="20px" height="20px" className="rounded-full flex-shrink-0" />
              <div className="flex-1">
                <Skeleton width="120px" height="16px" className="mb-1" />
                <Skeleton width="100%" height="14px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Skeleton cho Face Attendance Card
 */
export const FaceAttendanceCardSkeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${className}`}>
    {/* Header */}
    <div className="p-4 bg-gray-300 dark:bg-gray-600 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton width="40px" height="40px" className="rounded-lg" />
          <div>
            <Skeleton width="160px" height="18px" className="mb-1" />
            <Skeleton width="100px" height="14px" />
          </div>
        </div>
        <Skeleton width="20px" height="20px" className="rounded" />
      </div>
    </div>
  </div>
);

/**
 * Inline loading spinner với text
 */
export const LoadingSpinner: React.FC<{ text?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  text = 'Đang xử lý...',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };
  
  return (
    <div className="flex items-center justify-center gap-2">
      <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${sizeClasses[size]}`} />
      {text && <span className="text-sm">{text}</span>}
    </div>
  );
};

/**
 * Full page loading overlay
 */
export const FullPageLoader: React.FC<{ text?: string }> = ({ text = 'Đang tải...' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto mb-4" />
      <p className="text-gray-700 dark:text-gray-300">{text}</p>
    </div>
  </div>
);

/**
 * Processing overlay for camera
 */
export const CameraProcessingOverlay: React.FC<{ text?: string }> = ({
  text = 'Đang xử lý ảnh...'
}) => (
  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70">
    <div className="text-center">
      <div className="relative w-24 h-24 mx-auto mb-4">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500/30" />
        {/* Spinning ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
        {/* Face icon */}
        <div className="absolute inset-4 flex items-center justify-center">
          <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <p className="text-white font-medium">{text}</p>
    </div>
  </div>
);

export default {
  Skeleton,
  CameraSkeleton,
  FaceRegistrationPageSkeleton,
  FaceAttendanceCardSkeleton,
  LoadingSpinner,
  FullPageLoader,
  CameraProcessingOverlay
};
