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
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 3;

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 mt-8 pb-12 px-2">
      <div className="flex gap-1 sm:gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 sm:p-2 rounded-full border border-gray-400 text-gray-600 hover:text-white bg-white hover:bg-rose-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <FiChevronsLeft className="size-4 sm:size-[18px]" />
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 sm:p-2 rounded-full border border-gray-400 text-gray-600 hover:text-white bg-white hover:bg-rose-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <FiChevronLeft className="size-4 sm:size-[18px]" />
        </button>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {visiblePages[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="hidden sm:flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center rounded-full font-medium text-gray-600 border border-gray-400 bg-white hover:bg-rose-400 hover:text-white transition-all cursor-pointer"
            >
              1
            </button>
            <span className="text-gray-400 px-1">...</span>
          </>
        )}

        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full font-medium transition-all cursor-pointer text-xs sm:text-base ${
              currentPage === page
                ? 'bg-rose-400 text-white border border-rose-400'
                : 'text-gray-600 border border-gray-400 bg-white hover:bg-rose-400 hover:text-white'
            }`}
          >
            {page}
          </button>
        ))}

        {visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            <span className="text-gray-400 px-1">...</span>
            <button
              onClick={() => onPageChange(totalPages)}
              className="hidden sm:flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center rounded-full font-medium text-gray-600 border border-gray-400 bg-white hover:bg-rose-400 hover:text-white transition-all cursor-pointer"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      <div className="flex gap-1 sm:gap-2">
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 sm:p-2 rounded-full border border-gray-400 text-gray-600 hover:text-white bg-white hover:bg-rose-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <FiChevronRight className="size-4 sm:size-[18px]" />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 sm:p-2 rounded-full border border-gray-400 text-gray-600 hover:text-white bg-white hover:bg-rose-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <FiChevronsRight className="size-4 sm:size-[18px]" />
        </button>
      </div>
    </div>
  );
};
