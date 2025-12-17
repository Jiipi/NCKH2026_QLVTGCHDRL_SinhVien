import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * AuthLink - Link component for auth pages navigation
 */
export default function AuthLink({ 
  to, 
  children, 
  className = 'register-link',
  ...props 
}) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    if (to) {
      navigate(to);
    }
  };

  return (
    <div className={className}>
      <p>
        {children}
        {to && (
          <a href={to} onClick={handleClick} {...props}>
            {props.text || to}
          </a>
        )}
      </p>
    </div>
  );
}

