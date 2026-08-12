import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export default function Input({
  label,
  error,
  fullWidth = false,
  className = '',
  ...props
}: InputProps) {
  const baseStyles = 'bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition';
  const sizeStyles = 'p-3 min-h-[44px]';
  const errorStyles = error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200';
  const widthStyles = fullWidth ? 'w-full' : '';
  
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={`${baseStyles} ${sizeStyles} ${errorStyles} ${widthStyles} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
