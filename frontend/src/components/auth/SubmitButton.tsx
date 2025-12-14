import React from 'react';
import { LuLoaderCircle } from 'react-icons/lu';

interface SubmitButtonProps {
  text: string;
  isLoading: boolean;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  text,
  isLoading,
}) => {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className={`btn relative overflow-hidden inline-flex w-full items-center justify-center rounded-md bg-gradient-to-r from-rose-400 to-rose-900 hover:bg-gradient-to-l hover:to-rose-900 hover:from-rose-400 bg-[length:200%_200%] bg-[position:0%_50%] hover:bg-[position:100%_50%] transition-[background-position] duration-500 ease-out px-4 py-3 font-semibold text-white shadow-sm ${
        isLoading ? 'cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <LuLoaderCircle className="animate-spin w-6 h-6" />
        </span>
      ) : (
        text
      )}
    </button>
  );
};
