/**
 * Design System — Button Component
 *
 * Quy tắc:
 * - variants: solid, outline, ghost, link
 * - sizes: xs, sm, md, lg
 * - Luôn dùng forwardRef để hỗ trợ leftIcon, rightIcon
 * - Loading state: disabled + spinner, giữ nguyên kích thước
 *
 * @module design-system/components
 */

import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

/* ============================================================
   Types
   ============================================================ */

type Variant = 'solid' | 'outline' | 'ghost' | 'link';
type Size    = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   Variant;
  size?:      Size;
  leftIcon?:  ReactNode;
  rightIcon?: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  colorScheme?: 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'slate';
}

type ButtonStyle = Record<string, string>;
type ButtonVariantStyles = Record<Variant, Record<string, ButtonStyle>>;
type ButtonSizeStyles   = Record<Size,    Record<string, string>>;

/* ============================================================
   Variant Styles
   ============================================================ */

const variants: ButtonVariantStyles = {
  solid: {
    primary: {
      base: 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-sm',
      dark:  'dark:bg-primary-500 dark:hover:bg-primary-600 dark:active:bg-primary-700 dark:text-white',
    },
    success: {
      base: 'bg-success-600 hover:bg-success-700 active:bg-success-800 text-white shadow-sm',
      dark:  'dark:bg-success-500 dark:hover:bg-success-600 dark:text-white',
    },
    danger: {
      base: 'bg-danger-500 hover:bg-danger-600 active:bg-danger-700 text-white shadow-sm',
      dark:  'dark:bg-red-500 dark:hover:bg-red-600 dark:text-white',
    },
    warning: {
      base: 'bg-warning-500 hover:bg-warning-600 active:bg-warning-700 text-white shadow-sm',
      dark:  'dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-white',
    },
    info: {
      base: 'bg-info-500 hover:bg-info-600 active:bg-info-700 text-white shadow-sm',
      dark:  'dark:bg-sky-500 dark:hover:bg-sky-600 dark:text-white',
    },
    slate: {
      base: 'bg-slate-600 hover:bg-slate-700 active:bg-slate-800 text-white shadow-sm',
      dark:  'dark:bg-slate-500 dark:hover:bg-slate-600 dark:text-white',
    },
  },

  outline: {
    primary: {
      base: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 active:bg-primary-100',
      dark:  'dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900/20',
    },
    success: {
      base: 'border-2 border-success-500 text-success-600 hover:bg-success-50 active:bg-success-100',
      dark:  'dark:border-success-400 dark:text-success-400 dark:hover:bg-success-900/20',
    },
    danger: {
      base: 'border-2 border-danger-500 text-danger-500 hover:bg-danger-50 active:bg-danger-100',
      dark:  'dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20',
    },
    warning: {
      base: 'border-2 border-warning-500 text-warning-600 hover:bg-warning-50 active:bg-warning-100',
      dark:  'dark:border-amber-400 dark:text-amber-400 dark:hover:bg-amber-900/20',
    },
    info: {
      base: 'border-2 border-info-500 text-info-500 hover:bg-info-50 active:bg-info-100',
      dark:  'dark:border-sky-400 dark:text-sky-400 dark:hover:bg-sky-900/20',
    },
    slate: {
      base: 'border-2 border-slate-300 text-slate-600 hover:bg-slate-50 active:bg-slate-100',
      dark:  'dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:active:bg-slate-700',
    },
  },

  ghost: {
    primary: {
      base: 'text-primary-600 hover:bg-primary-50 active:bg-primary-100',
      dark:  'dark:text-primary-400 dark:hover:bg-primary-900/20 dark:active:bg-primary-900/30',
    },
    success: {
      base: 'text-success-600 hover:bg-success-50 active:bg-success-100',
      dark:  'dark:text-success-400 dark:hover:bg-success-900/20',
    },
    danger: {
      base: 'text-danger-500 hover:bg-danger-50 active:bg-danger-100',
      dark:  'dark:text-red-400 dark:hover:bg-red-900/20',
    },
    warning: {
      base: 'text-warning-600 hover:bg-warning-50 active:bg-warning-100',
      dark:  'dark:text-amber-500 dark:hover:bg-amber-900/20',
    },
    info: {
      base: 'text-info-500 hover:bg-info-50 active:bg-info-100',
      dark:  'dark:text-sky-400 dark:hover:bg-sky-900/20',
    },
    slate: {
      base: 'text-slate-600 hover:bg-slate-100 active:bg-slate-200',
      dark:  'dark:text-slate-300 dark:hover:bg-slate-800 dark:active:bg-slate-700',
    },
  },

  link: {
    primary: {
      base: 'text-primary-600 hover:underline active:text-primary-700 p-0',
      dark:  'dark:text-primary-400 dark:hover:text-primary-300',
    },
    success: {
      base: 'text-success-600 hover:underline active:text-success-700 p-0',
      dark:  'dark:text-success-400',
    },
    danger: {
      base: 'text-danger-500 hover:underline active:text-danger-600 p-0',
      dark:  'dark:text-red-400',
    },
    warning: {
      base: 'text-warning-600 hover:underline active:text-warning-700 p-0',
      dark:  'dark:text-amber-500',
    },
    info: {
      base: 'text-info-500 hover:underline active:text-info-600 p-0',
      dark:  'dark:text-sky-400',
    },
    slate: {
      base: 'text-slate-600 hover:underline active:text-slate-700 p-0',
      dark:  'dark:text-slate-400',
    },
  },
};

/* ============================================================
   Size Styles
   ============================================================ */

const sizes: ButtonSizeStyles = {
  xs: {
    base: 'h-7 px-2.5 text-xs gap-1',
    icon: 'h-7 w-7',
  },
  sm: {
    base: 'h-8 px-3 text-sm gap-1.5',
    icon: 'h-8 w-8',
  },
  md: {
    base: 'h-10 px-4 text-sm gap-2',
    icon: 'h-10 w-10',
  },
  lg: {
    base: 'h-12 px-6 text-base gap-2.5',
    icon: 'h-12 w-12',
  },
};

/* ============================================================
   Component
   ============================================================ */

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant       = 'solid',
  size          = 'md',
  colorScheme   = 'primary',
  leftIcon,
  rightIcon,
  isLoading,
  loadingText,
  children,
  disabled,
  className     = '',
  ...props
}, ref) => {
  const variantClass = variants[variant]?.[colorScheme]?.base || variants[variant]?.slate?.base;
  const variantDark  = variants[variant]?.[colorScheme]?.dark  || variants[variant]?.slate?.dark;
  const sizeClass    = sizes[size]?.base;
  const iconSize     = sizes[size]?.icon;

  const isIconOnly = (leftIcon && !children && !rightIcon) || (rightIcon && !children && !leftIcon);
  const effectiveSizeClass = isIconOnly ? iconSize : sizeClass;

  const classes = [
    'inline-flex items-center justify-center',
    'font-medium rounded-lg',
    'transition-colors duration-150',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-primary-500',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'cursor-pointer select-none',
    variantClass,
    variantDark,
    effectiveSizeClass,
    variant === 'link' ? '' : 'whitespace-nowrap',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={classes}
      {...props}
    >
      {isLoading && (
        <Loader2 className="animate-spin shrink-0" size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />
      )}
      {!isLoading && leftIcon}
      {isLoading && loadingText ? loadingText : children}
      {!isLoading && rightIcon}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;

/* ============================================================
   Button Group
   ============================================================ */

interface ButtonGroupProps {
  children: React.ReactNode;
  size?:    Size;
  className?: string;
}

export function ButtonGroup({ children, className = '' }: ButtonGroupProps) {
  return (
    <div className={`inline-flex rounded-lg overflow-hidden ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return null;
        const isFirst = index === 0;
        const isLast  = index === React.Children.count(children) - 1;
        const buttonChild = child as React.ReactElement<{ className?: string }>;
        return React.cloneElement(buttonChild, {
          className: [
            buttonChild.props.className || '',
            isFirst ? 'rounded-r-none' : '',
            isLast  ? 'rounded-l-none' : '',
            !isFirst && !isLast ? 'rounded-none border-l-0' : '',
            !isFirst ? 'border-l-0' : '',
          ].filter(Boolean).join(' '),
        });
      })}
    </div>
  );
}
