'use client';

import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from 'react-icons/fi';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  const getPages = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-8 pb-12">
      {/* First Page */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="p-2 rounded-full border border-gray-400 text-gray-600 hover:text-white bg-white hover:bg-rose-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <FiChevronsLeft size={18} />
      </button>

      {/* Prev Page */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-full border border-gray-400 text-gray-600 hover:text-white bg-white hover:bg-rose-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <FiChevronLeft size={18} />
      </button>

      {/* Page Numbers */}
      {getPages().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-10 h-10 rounded-full font-medium transition-all cursor-pointer ${
            currentPage === page
              ? 'bg-rose-400 text-white'
              : 'text-gray-600 border border-gray-400 bg-white hover:bg-rose-400 hover:text-white'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next Page */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-full border border-gray-400 text-gray-600 hover:text-white bg-white hover:bg-rose-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <FiChevronRight size={18} />
      </button>

      {/* Last Page */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-full border border-gray-400 text-gray-600 hover:text-white bg-white hover:bg-rose-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <FiChevronsRight size={18} />
      </button>
    </div>
  );
};
