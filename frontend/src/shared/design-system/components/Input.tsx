/**
 * Design System — Input Components
 *
 * Gồm: Input, Textarea, Select, Checkbox, Radio, Switch
 *
 * @module design-system/components
 */

import React, { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

/* ============================================================
   Input
   ============================================================ */

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?:        string;
  hint?:         string;
  error?:        string;
  leftIcon?:     ReactNode;
  rightIcon?:    ReactNode;
  helperText?:   string;
  size?:         'sm' | 'md' | 'lg';
  variant?:      'outlined' | 'filled';
}

const inputSizes = {
  sm: 'h-8 text-sm px-3',
  md: 'h-10 text-sm px-4',
  lg: 'h-12 text-base px-4',
};

const iconSizes = {
  sm: 14,
  md: 16,
  lg: 18,
};

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  hint,
  error,
  leftIcon,
  rightIcon,
  helperText,
  size       = 'md',
  variant    = 'outlined',
  className  = '',
  disabled,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).slice(2)}`;
  const hasError = !!error;

  const baseClasses = [
    'w-full',
    'font-sans text-text-primary',
    'transition-colors duration-150',
    'placeholder:text-text-muted',
    'focus:outline-none',
    inputSizes[size],
  ];

  const outlinedClasses = [
    'bg-surface-card',
    'border rounded-lg',
    hasError
      ? 'border-danger-500 focus:border-danger-500 focus:ring-2 focus:ring-danger-500/20'
      : 'border-border-default hover:border-border-hover',
    'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
    'dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100',
  ];

  const filledClasses = [
    'bg-surface-muted',
    'border border-transparent',
    'hover:bg-slate-200 dark:hover:bg-slate-700',
    'focus:bg-surface-card focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
    'dark:bg-slate-800',
  ];

  const inputClasses = [
    ...baseClasses,
    variant === 'outlined' ? outlinedClasses : filledClasses,
    leftIcon  ? 'pl-9' : '',
    rightIcon ? 'pr-9' : '',
    disabled  ? 'opacity-50 cursor-not-allowed' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-primary dark:text-slate-200"
        >
          {label}
        </label>
      )}
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            {React.cloneElement(leftIcon as React.ReactElement<{ size?: number }>, { size: iconSizes[size] })}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={inputClasses}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
            {React.cloneElement(rightIcon as React.ReactElement<{ size?: number }>, { size: iconSizes[size] })}
          </div>
        )}
      </div>
      {(hint || error || helperText) && (
        <p className={[
          'text-xs',
          hasError ? 'text-danger-500' : 'text-text-muted',
        ].join(' ')}>
          {error || hint || helperText}
        </p>
      )}
    </div>
  );
});
Input.displayName = 'Input';

/* ============================================================
   Textarea
   ============================================================ */

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:    string;
  hint?:     string;
  error?:    string;
  resizable?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  hint,
  error,
  resizable = true,
  className  = '',
  disabled,
  id,
  ...props
}, ref) => {
  const inputId = id || `textarea-${Math.random().toString(36).slice(2)}`;
  const hasError = !!error;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-primary dark:text-slate-200"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        disabled={disabled}
        className={[
          'w-full min-h-[100px]',
          'px-4 py-3',
          'text-sm text-text-primary',
          'bg-surface-card',
          'border rounded-lg',
          hasError
            ? 'border-danger-500 focus:border-danger-500 focus:ring-2 focus:ring-danger-500/20'
            : 'border-border-default hover:border-border-hover focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
          'focus:outline-none transition-colors duration-150',
          'placeholder:text-text-muted',
          resizable ? 'resize-y' : 'resize-none',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
          'dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100',
          className,
        ].filter(Boolean).join(' ')}
        {...props}
      />
      {(hint || error) && (
        <p className={[
          'text-xs',
          hasError ? 'text-danger-500' : 'text-text-muted',
        ].join(' ')}>
          {error || hint}
        </p>
      )}
    </div>
  );
});
Textarea.displayName = 'Textarea';

/* ============================================================
   Select
   ============================================================ */

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?:    string;
  hint?:     string;
  error?:    string;
  options:   Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  size?:     'sm' | 'md' | 'lg';
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  hint,
  error,
  options,
  placeholder,
  size     = 'md',
  className = '',
  disabled,
  id,
  ...props
}, ref) => {
  const inputId = id || `select-${Math.random().toString(36).slice(2)}`;
  const hasError = !!error;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-primary dark:text-slate-200"
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={inputId}
        disabled={disabled}
        className={[
          'w-full',
          'text-sm text-text-primary',
          'bg-surface-card',
          'border rounded-lg',
          inputSizes[size],
          hasError
            ? 'border-danger-500 focus:border-danger-500 focus:ring-2 focus:ring-danger-500/20'
            : 'border-border-default hover:border-border-hover focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
          'focus:outline-none transition-colors duration-150',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          'dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100',
          className,
        ].filter(Boolean).join(' ')}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      {(hint || error) && (
        <p className={[
          'text-xs',
          hasError ? 'text-danger-500' : 'text-text-muted',
        ].join(' ')}>
          {error || hint}
        </p>
      )}
    </div>
  );
});
Select.displayName = 'Select';

/* ============================================================
   Checkbox
   ============================================================ */

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?:    string;
  error?:    string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  error,
  className = '',
  disabled,
  id,
  ...props
}, ref) => {
  const inputId = id || `checkbox-${Math.random().toString(36).slice(2)}`;

  return (
    <div className="flex items-start gap-2.5">
      <input
        ref={ref}
        type="checkbox"
        id={inputId}
        disabled={disabled}
        className={[
          'mt-0.5 w-4 h-4 shrink-0',
          'rounded border-border-default',
          'text-primary-600',
          'focus:ring-2 focus:ring-primary-500/30',
          'cursor-pointer',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
          error ? 'border-danger-500' : '',
          className,
        ].filter(Boolean).join(' ')}
        {...props}
      />
      {label && (
        <label
          htmlFor={inputId}
          className={[
            'text-sm text-text-primary cursor-pointer',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
          ].join(' ')}
        >
          {label}
        </label>
      )}
    </div>
  );
});
Checkbox.displayName = 'Checkbox';

/* ============================================================
   Switch
   ============================================================ */

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?:   string;
  size?:    'sm' | 'md';
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(({
  label,
  size   = 'md',
  className = '',
  disabled,
  id,
  ...props
}, ref) => {
  const inputId = id || `switch-${Math.random().toString(36).slice(2)}`;
  const trackSize = size === 'sm' ? 'w-8 h-4' : 'w-11 h-6';
  const thumbSize = size === 'sm' ? 'w-3 h-3' : 'w-5 h-5';
  const translate = size === 'sm' ? 'translate-x-4' : 'translate-x-5';

  return (
    <label
      htmlFor={inputId}
      className={[
        'inline-flex items-center gap-3 cursor-pointer',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      <div className="relative">
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          id={inputId}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        <div className={[
          'bg-slate-200 peer-focus:ring-2 peer-focus:ring-primary-500/30',
          'rounded-full transition-colors duration-200',
          'dark:bg-slate-700',
          trackSize,
        ].join(' ')} />
        <div className={[
          'absolute top-0.5 left-0.5 bg-white rounded-full shadow-sm',
          'transition-transform duration-200',
          'peer-checked:translate-x-full',
          translate,
          thumbSize,
        ].join(' ')} />
        <div className={[
          'absolute top-0.5 left-0.5 bg-white rounded-full shadow-sm',
          'transition-transform duration-200',
          translate,
          thumbSize,
          'peer-checked:translate-x-0',
        ].join(' ')} />
      </div>
      {label && (
        <span className="text-sm text-text-primary dark:text-slate-200">
          {label}
        </span>
      )}
    </label>
  );
});
Switch.displayName = 'Switch';
