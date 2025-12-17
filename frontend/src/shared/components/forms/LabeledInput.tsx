import React, { ReactNode } from 'react';

export interface LabeledInputProps {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

/**
 * LabeledInput component
 */
export function LabeledInput({ id, label, hint, error, className = '', children }: LabeledInputProps): React.JSX.Element {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default LabeledInput;
