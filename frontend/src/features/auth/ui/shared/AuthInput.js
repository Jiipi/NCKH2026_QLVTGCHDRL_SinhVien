import React from 'react';

/**
 * AuthInput - Reusable input component for auth forms
 */
export default function AuthInput({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  icon,
  iconComponent,
  className = 'inpt',
  containerClassName = '',
  required = false,
  disabled = false,
  error,
  ...props
}) {
  const Icon = iconComponent;
  const iconClass = icon || (Icon ? '' : 'fa fa-envelope');
  const containerClass = containerClassName || (type === 'password' ? 'password-login' : 'email-login');

  return (
    <div className={containerClass}>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
        required={required}
        disabled={disabled}
        {...props}
      />
      {Icon ? (
        <Icon className="icon-inline" />
      ) : (
        <i className={iconClass}></i>
      )}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

