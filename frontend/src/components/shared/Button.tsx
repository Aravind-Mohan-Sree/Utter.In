import React from 'react';
import { LuLoaderCircle } from 'react-icons/lu';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'danger';
  fullWidth?: boolean;
  isLoading?: boolean;
  text?: string;
  icon?: React.ReactNode;
  fontSize?: number;
  size?: number;
}

export default function Button({
  variant = 'primary',
  fullWidth = false,
  isLoading,
  text,
  icon,
  fontSize = 16,
  size = 2,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = `grid items-center justify-center rounded-md bg-gradient-to-r hover:bg-gradient-to-l bg-[length:200%_200%] bg-[position:0%_50%] hover:bg-[position:95%_50%] transition-[background-position] duration-500 ease-out font-medium shadow-sm text-white ${
    isLoading ? 'cursor-not-allowed' : 'cursor-pointer'
  }`;

  const variants = {
    primary: 'from-rose-400 to-rose-900 hover:to-rose-900 hover:from-rose-400',
    secondary:
      'from-blue-400 to-blue-900 hover:to-blue-900 hover:from-blue-400',
    outline: 'bg-transparent shadow-none!',
    success:
      'from-green-400 to-green-900 hover:to-green-900 hover:from-green-400',
    danger: 'from-red-500 to-red-900 hover:to-red-900 hover:from-red-500',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      disabled={isLoading ? true : false}
      className={`${baseClasses} ${variants[variant]} ${widthClass} ${className}`}
      style={{
        fontSize: `${fontSize}px`,
        paddingInline: `${4 * (size && size + 1)}px`,
        paddingBlock: `${4 * size}px`,
      }}
      {...props}
    >
      {isLoading && (
        <span className="col-start-1 row-start-1 flex items-center justify-center">
          <LuLoaderCircle className="animate-spin w-6 h-6" />
        </span>
      )}
      <span
        className={`col-start-1 row-start-1 flex items-center justify-center ${
          text && 'space-x-2'
        } ${isLoading ? 'invisible' : 'visible'}`}
      >
        {icon}
        <span>{text}</span>
      </span>
    </button>
  );
}
