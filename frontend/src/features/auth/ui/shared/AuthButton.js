import React from 'react';

/**
 * AuthButton - Reusable button component for auth forms
 */
export default function AuthButton({
  type = 'submit',
  onClick,
  disabled = false,
  isLoading = false,
  loadingText,
  children,
  className = 'btn',
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={className}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (loadingText || 'Đang xử lý...') : children}
    </button>
  );
}

