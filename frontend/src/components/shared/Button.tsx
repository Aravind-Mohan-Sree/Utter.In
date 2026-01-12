'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LuLoaderCircle } from 'react-icons/lu';

interface ButtonProps<T extends unknown[]>
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'danger';
  fullWidth?: boolean;
  text?: string;
  icon?: React.ReactNode;
  fontSize?: number;
  size?: number;
  args?: T;
  onClick?: (...args: T) => void | Promise<void>;
}

export default function Button<T extends unknown[]>({
  variant = 'primary',
  fullWidth = false,
  text,
  icon,
  fontSize = 16,
  size = 2,
  className = '',
  onClick,
  args,
  ...props
}: ButtonProps<T>) {
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handlePress = async () => {
    if (isActive) return;

    setIsActive(true);

    if (onClick) {
      await onClick(...(args ?? ([] as unknown as T)));
    }

    timerRef.current = setTimeout(() => {
      setIsActive(false);
    }, 600);
  };

  const baseClasses = `grid items-center justify-center rounded-md bg-gradient-to-r hover:bg-gradient-to-l bg-[length:200%_200%] bg-[position:0%_50%] hover:bg-[position:95%_50%] transition-[background-position] duration-500 ease-out font-medium shadow-sm text-white ${
    isActive ? 'cursor-not-allowed' : 'cursor-pointer'
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

  return (
    <button
      {...props}
      type={props.type || 'button'}
      onClick={handlePress}
      disabled={isActive || props.disabled}
      className={`${baseClasses} ${variants[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      style={{
        fontSize: `${fontSize}px`,
        paddingInline: `${4 * (size ? size + 1 : size)}px`,
        paddingBlock: `${4 * size}px`,
        ...props.style,
      }}
    >
      {isActive && (
        <span className="col-start-1 row-start-1 flex items-center justify-center">
          <LuLoaderCircle className="animate-spin w-6 h-6" />
        </span>
      )}
      <span
        className={`col-start-1 row-start-1 flex items-center justify-center ${
          text && 'space-x-2'
        } ${isActive ? 'invisible' : 'visible'}`}
      >
        {icon}
        <span>{text}</span>
      </span>
    </button>
  );
}
