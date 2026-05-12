import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  type?: 'confirm' | 'success' | 'error' | 'warning';
  confirmText?: string;
  cancelText?: string;
  showInput?: boolean;
  inputPlaceholder?: string;
  inputValue?: string;
  onInputChange?: (value: string) => void;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'confirm',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  showInput = false,
  inputPlaceholder = '',
  inputValue = '',
  onInputChange = () => { }
}: ConfirmModalProps): React.ReactElement | null {
  if (!isOpen) return null;

  const typeStyles = {
    confirm: {
      icon: <AlertTriangle className="w-12 h-12 text-blue-600" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      iconBg: 'bg-blue-100'
    },
    success: {
      icon: <CheckCircle className="w-12 h-12 text-green-600" />,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      iconBg: 'bg-green-100'
    },
    error: {
      icon: <XCircle className="w-12 h-12 text-red-600" />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      buttonColor: 'bg-red-600 hover:bg-red-700',
      iconBg: 'bg-red-100'
    },
    warning: {
      icon: <AlertTriangle className="w-12 h-12 text-amber-600" />,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      buttonColor: 'bg-amber-600 hover:bg-amber-700',
      iconBg: 'bg-amber-100'
    }
  };

  const style = typeStyles[type] || typeStyles.confirm;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 p-3 backdrop-blur-sm animate-fadeIn sm:items-center sm:p-4">
      <div className="max-h-[90svh] w-full max-w-md transform overflow-y-auto rounded-2xl bg-white shadow-2xl transition-all animate-slideUp sm:max-h-[90vh]">
        {/* Header */}
        <div className="relative p-5 pb-4 sm:p-6 sm:pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className={`${style.iconBg} rounded-full p-3 mb-4`}>
              {style.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Input Field (if needed) */}
        {showInput && (
          <div className="px-6 pb-4">
            <textarea
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={inputPlaceholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              rows={3}
              autoFocus
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 p-5 pt-3 sm:flex-row sm:p-6 sm:pt-2">
          <button
            onClick={onClose}
            className="touch-target flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`touch-target flex-1 rounded-lg px-4 py-2.5 ${style.buttonColor} text-sm font-medium text-white shadow-sm transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
