import React from 'react';

/**
 * AuthErrorMessage - Error message display component
 */
export default function AuthErrorMessage({ 
  message, 
  className = 'error-message',
  ...props 
}) {
  if (!message) return null;
  
  return (
    <div className={className} {...props}>
      {message}
    </div>
  );
}

