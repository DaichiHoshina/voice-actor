import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  const baseStyles = 'rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 transition-shadow duration-200';
  const hoverStyles = onClick ? 'shadow hover:shadow-lg cursor-pointer' : 'shadow';
  
  return (
    <div 
      className={`${baseStyles} ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
