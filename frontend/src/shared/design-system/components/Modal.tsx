/**
 * Design System — Modal / Dialog Component
 *
 * @module design-system/components
 */

import React, { useEffect, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/* ============================================================
   Types
   ============================================================ */

type ModalSize   = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
type ModalIntent = 'default' | 'danger' | 'success' | 'warning';

interface ModalProps {
  isOpen:       boolean;
  onClose:      () => void;
  title?:      string;
  description?: string;
  size?:       ModalSize;
  intent?:     ModalIntent;
  hideClose?:  boolean;
  footer?:     ReactNode;
  children:    ReactNode;
  className?:  string;
  closeOnBackdrop?: boolean;
  closeOnEscape?:   boolean;
}

/* ============================================================
   Size Classes
   ============================================================ */

const sizeClasses: Record<ModalSize, string> = {
  xs:    'max-w-xs',
  sm:    'max-w-sm',
  md:    'max-w-lg',
  lg:    'max-w-2xl',
  xl:    'max-w-4xl',
  full:  'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]',
};

const sizeWidth: Record<ModalSize, string> = {
  xs:    'sm:max-w-xs',
  sm:    'sm:max-w-sm',
  md:    'sm:max-w-lg',
  lg:    'sm:max-w-2xl',
  xl:    'sm:max-w-4xl',
  full:  'sm:max-w-[calc(100vw-2rem)]',
};

const headerBorderColors: Record<ModalIntent, string> = {
  default: 'border-t-primary-500',
  danger:  'border-t-red-500',
  success: 'border-t-success-500',
  warning: 'border-t-amber-500',
};

/* ============================================================
   Modal Component
   ============================================================ */

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size       = 'md',
  intent     = 'default',
  hideClose  = false,
  footer,
  children,
  className  = '',
  closeOnBackdrop = true,
  closeOnEscape   = true,
}: ModalProps) {
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) onClose();
  }, [closeOnBackdrop, onClose]);

  useEffect(() => {
    if (!closeOnEscape) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose, closeOnEscape]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn" />

      {/* Panel */}
      <div className={[
        'relative w-full',
        'bg-surface-card dark:bg-slate-800',
        'rounded-2xl shadow-2xl',
        'border border-border-default dark:border-slate-700',
        'border-t-4',
        headerBorderColors[intent],
        'animate-scaleIn',
        sizeWidth[size],
        'max-h-[calc(100vh-2rem)] overflow-y-auto',
        className,
      ].join(' ')}>
        {/* Header */}
        {(title || !hideClose) && (
          <div className="flex items-start justify-between p-5 pb-0">
            <div className="flex flex-col gap-1 min-w-0">
              {title && (
                <h2 id="modal-title" className="text-lg font-semibold text-text-primary dark:text-slate-100">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-text-muted">{description}</p>
              )}
            </div>
            {!hideClose && (
              <button
                onClick={onClose}
                className="shrink-0 ml-4 p-1 rounded-lg text-text-muted
                  hover:bg-surface-muted hover:text-text-primary
                  transition-colors duration-150"
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border-default dark:border-slate-700 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

/* ============================================================
   Confirm Dialog
   ============================================================ */

interface ConfirmDialogProps {
  isOpen:       boolean;
  onClose:      () => void;
  onConfirm:    () => void;
  title?:      string;
  message:     string;
  confirmText?: string;
  cancelText?: string;
  intent?:     ModalIntent;
  isLoading?:  boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title      = 'Xác nhận',
  message,
  confirmText = 'Xác nhận',
  cancelText  = 'Hủy',
  intent     = 'default',
  isLoading  = false,
}: ConfirmDialogProps) {
  const confirmColors: Record<ModalIntent, string> = {
    default: 'bg-primary-600 hover:bg-primary-700 text-white',
    danger:  'bg-red-500 hover:bg-red-600 text-white',
    success: 'bg-success-500 hover:bg-success-600 text-white',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xs"
      intent={intent}
      footer={
        <>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="h-9 px-4 text-sm font-medium rounded-lg
              bg-slate-100 hover:bg-slate-200 text-slate-700
              dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={[
              'h-9 px-4 text-sm font-medium rounded-lg',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors shadow-sm',
              confirmColors[intent],
            ].join(' ')}
          >
            {isLoading ? 'Đang xử lý...' : confirmText}
          </button>
        </>
      }
    >
      <p className="text-sm text-text-secondary dark:text-slate-400">{message}</p>
    </Modal>
  );
}
