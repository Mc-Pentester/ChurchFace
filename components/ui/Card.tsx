import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  className = '',
  hoverable = false,
  onClick,
}: CardProps) {
  const baseStyles = 'bg-white rounded-2xl shadow-sm border border-gray-200';
  const hoverStyles = hoverable ? 'hover:shadow-md cursor-pointer active:scale-98 transition' : '';
  const clickableStyles = onClick ? 'cursor-pointer active:scale-98 transition' : '';
  
  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${clickableStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
