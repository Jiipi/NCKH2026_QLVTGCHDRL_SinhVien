import React from 'react';

/**
 * AuthSuccessMessage - Success message display component
 */
export default function AuthSuccessMessage({ 
  message, 
  className = 'success-message',
  ...props 
}) {
  if (!message) return null;
  
  return (
    <div className={className} {...props}>
      {message}
    </div>
  );
}

