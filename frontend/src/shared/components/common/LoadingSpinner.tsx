import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`admin-loading-container ${className}`}>
      <div className={`admin-spinner admin-spinner-${size}`} />
      {text && <span className="admin-loading-text">{text}</span>}
    </div>
  );
}
