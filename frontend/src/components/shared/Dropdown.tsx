'use client';

import { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';

interface DropdownProps {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  className?: string;
}

export const Dropdown = ({
  options,
  selected,
  onSelect,
  className = '',
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-rose-50 border border-gray-200 rounded-xl text-sm font-medium text-rose-400 transition-colors min-w-[120p] justify-between cursor-pointer"
      >
        <span>{selected}</span>
        <FiChevronDown
          className={`text-rose-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-auto bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              hidden={selected === option}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
