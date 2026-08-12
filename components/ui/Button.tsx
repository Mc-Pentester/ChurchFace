import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-xl transition active:scale-95 disabled:opacity-50 disabled:active:scale-100';
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-emerald-600 to-purple-600 text-white hover:shadow-lg',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
  };
  
  const sizeStyles = {
    sm: 'px-4 py-2 min-h-[40px] text-sm',
    md: 'px-6 py-3 min-h-[44px] text-sm',
    lg: 'px-8 py-4 min-h-[48px] text-base',
  };
  
  const widthStyles = fullWidth ? 'w-full' : '';
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
