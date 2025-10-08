'use client';

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label,
    error,
    leftIcon,
    rightIcon,
    className = '',
    variant = 'default',
    disabled,
    ...props
  }, ref) => {
    const baseStyles = 'w-full transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      default: 'bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500',
      filled: 'bg-gray-800 border-2 border-transparent focus:bg-gray-700 focus:border-blue-500',
    };

    const inputStyles = `
      ${baseStyles}
      ${variants[variant]}
      ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
      ${leftIcon ? 'pl-10' : 'pl-4'}
      ${rightIcon ? 'pr-10' : 'pr-4'}
      py-2 text-white placeholder-gray-400 rounded-lg
    `;

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`${inputStyles} ${className}`}
            disabled={disabled}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
); 