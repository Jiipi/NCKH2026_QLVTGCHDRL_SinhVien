import React from 'react';

const VARIANT_CLASS = {
  login: 'auth-container auth-container-login',
  register: 'auth-container auth-container-register',
  forgot: 'auth-container auth-container-forgot',
  reset: 'auth-container auth-container-reset',
  default: 'auth-container',
};

const defaultHeading = [
  { id: 'line1', text: 'HỆ THỐNG QUẢN LÝ' },
  { id: 'line2', text: 'HOẠT ĐỘNG RÈN LUYỆN CỦA SINH VIÊN' },
];

export function AuthLayout({
  variant = 'default',
  heading = defaultHeading,
  backgroundImage = `${process.env.PUBLIC_URL || ''}/images/VNUR.jpg`,
  children,
  className = '',
}) {
  const containerClass = VARIANT_CLASS[variant] || VARIANT_CLASS.default;
  const combinedClass = `${containerClass} ${className}`.trim();

  return (
    <div
      className={combinedClass}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="auth-heading">
        {heading.map((line) => (
          <span key={line.id || line.text} className={line.id}>
            {line.text}
          </span>
        ))}
      </div>
      {children}
    </div>
  );
}

export function AuthPanel({
  children,
  wrapperClassName = 'auth-group2',
  boxClassName = 'box box-auth',
}) {
  const panel = (
    <div className={boxClassName}>
      <div className="flip-card-inner">
        <div className="box-login">
          <ul>{children}</ul>
        </div>
      </div>
    </div>
  );

  if (!wrapperClassName) {
    return panel;
  }

  return <div className={wrapperClassName}>{panel}</div>;
}

export default AuthLayout;

