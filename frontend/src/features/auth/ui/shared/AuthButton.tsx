import React from 'react';

/**
 * AuthButton - Reusable button component for auth forms
 */
interface AuthButtonProps {
  type?: 'submit' | 'button' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>) => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export default function AuthButton({
  type = 'submit',
  onClick,
  disabled = false,
  isLoading = false,
  loadingText,
  children,
  className = 'btn',
  ...props
}: AuthButtonProps) {
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
