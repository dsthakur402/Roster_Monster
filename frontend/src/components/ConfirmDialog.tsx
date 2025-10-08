import React, { useEffect } from 'react';
import { FiAlertCircle, FiX } from 'react-icons/fi';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'warning'
}) => {
  // Handle Escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, onCancel]);

  // Handle focus trap and body scroll
  useEffect(() => {
    if (isOpen) {
      // Prevent background scrolling when dialog is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-red-600/10',
          icon: 'text-red-500',
          button: 'bg-red-600 hover:bg-red-700'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-600/10',
          icon: 'text-yellow-500',
          button: 'bg-yellow-600 hover:bg-yellow-700'
        };
      default:
        return {
          bg: 'bg-blue-600/10',
          icon: 'text-blue-500',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const colors = getColors();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop with animation */}
      <div 
        className="absolute inset-0 bg-black/50 animate-dialogFadeIn"
        onClick={onCancel}
      />
      
      {/* Dialog content with animation */}
      <div 
        className="relative bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden animate-dialogSlideIn"
      >
        <div className={`p-4 ${colors.bg} flex items-start justify-between`}>
          <div className="flex items-center gap-2">
            <FiAlertCircle className={`w-5 h-5 ${colors.icon}`} />
            <h3 className="text-lg font-medium text-white">{title}</h3>
          </div>
          <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close dialog"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <p className="text-gray-300 mb-4">{message}</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-white rounded transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 ${colors.button}`}
              autoFocus
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog; 