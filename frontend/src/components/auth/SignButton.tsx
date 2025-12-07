import React from 'react';

interface SignButtonProps {
  text: string;
}

const SignButton: React.FC<SignButtonProps> = ({ text }) => {
  return (
    <button
      type="submit"
      className="cursor-pointer w-full py-3 px-4 bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold rounded-lg hover:from-rose-500 hover:to-pink-600 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none"
    >
      {text}
    </button>
  );
};

export default SignButton;
