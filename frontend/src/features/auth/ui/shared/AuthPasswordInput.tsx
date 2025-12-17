import React from 'react';

/**
 * AuthPasswordInput - Password input with show/hide toggle
 */
interface AuthPasswordInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  showPassword: boolean;
  onTogglePassword: () => void;
  className?: string;
  containerClassName?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  [key: string]: any;
}

export default function AuthPasswordInput({
  name,
  value,
  onChange,
  placeholder = 'Mật khẩu',
  showPassword,
  onTogglePassword,
  className = 'inpt',
  containerClassName = 'password-login',
  required = false,
  disabled = false,
  error,
  ...props
}: AuthPasswordInputProps) {
  return (
    <div className={containerClassName}>
      <input
        type={showPassword ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
        required={required}
        disabled={disabled}
        {...props}
      />
      <i
        className={showPassword ? "fa fa-eye" : "fa fa-eye-slash"}
        onClick={onTogglePassword}
        style={{ cursor: 'pointer' }}
      ></i>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
