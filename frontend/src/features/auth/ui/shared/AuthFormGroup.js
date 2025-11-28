import React from 'react';

/**
 * AuthFormGroup - Form group wrapper for register page
 */
export default function AuthFormGroup({ 
  children, 
  className = 'input-group',
  ...props 
}) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

