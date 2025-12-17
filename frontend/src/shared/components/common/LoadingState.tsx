import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * LoadingState - Reusable loading state component
 * 
 * @param {Object} props
 * @param {string} props.message - Loading message
 * @param {string} props.className - Additional CSS classes
 * @param {'spinner'|'dots'|'pulse'} props.variant - Loading animation variant
 * @param {boolean} props.fullScreen - Whether to take full screen
 */
export default function LoadingState({
  message = 'Đang tải...',
  className = '',
  variant = 'spinner',
  fullScreen = false
}) {
  const containerClass = fullScreen
    ? 'min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50'
    : 'flex items-center justify-center h-96';

  return (
    <div className={`${containerClass} ${className}`}>
      <div className="text-center">
        {variant === 'spinner' && (
          <div className="relative inline-block mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-purple-600 border-r-indigo-600 absolute inset-0"></div>
          </div>
        )}
        
        {variant === 'dots' && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        )}
        
        {variant === 'pulse' && (
          <div className="relative inline-block mb-4">
            <div className="w-16 h-16 bg-purple-200 rounded-full animate-ping absolute"></div>
            <div className="w-16 h-16 bg-purple-600 rounded-full relative flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          </div>
        )}
        
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

/**
 * LoadingOverlay - Loading overlay for content areas
 */
export function LoadingOverlay({ message = 'Đang xử lý...', className = '' }) {
  return (
    <div className={`absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-600 border-t-transparent mx-auto mb-3"></div>
        <p className="text-gray-600 font-medium text-sm">{message}</p>
      </div>
    </div>
  );
}

/**
 * LoadingInline - Inline loading indicator
 */
export function LoadingInline({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3'
  };

  return (
    <div
      className={`animate-spin rounded-full border-purple-600 border-t-transparent ${sizeClasses[size]} ${className}`}
    ></div>
  );
}
