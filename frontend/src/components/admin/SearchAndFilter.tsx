'use client';

import { FiSearch, FiChevronDown } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';

export const SearchAndFilter = ({
  placeholder,
  filters,
  activeFilter,
  onFilterChange,
  searchValue,
  onSearchChange,
}: {
  placeholder: string;
  filters: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  searchValue: string;
  onSearchChange: (val: string) => void;
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div className="relative flex-1 max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400 transition-all text-sm text-black placeholder:text-gray-400"
        />
      </div>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-400 hover:bg-rose-600 border rounded-xl text-sm font-medium text-white transition-colors min-w-[120px] justify-between cursor-pointer"
        >
          <span>{activeFilter}</span>
          <FiChevronDown
            className={`text-white transition-transform ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
            {filters.map((filter) => (
              <button
                hidden={activeFilter === filter}
                key={filter}
                onClick={() => {
                  onFilterChange(filter);
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  activeFilter === filter
                    ? 'bg-rose-400 text-white'
                    : 'text-gray-700 hover:bg-rose-50'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
