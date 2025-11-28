import React from 'react';

/**
 * AuthPasswordInput - Password input with show/hide toggle
 */
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
}) {
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

