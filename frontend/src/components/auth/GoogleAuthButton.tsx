import { FaGoogle } from 'react-icons/fa';

interface GoogleSignInButtonProps {
  onClick?: () => void;
}

export const GoogleAuthButton: React.FC<GoogleSignInButtonProps> = ({
  onClick,
}) => {
  return (
    <button
      type="button"
      className="btn relative overflow-hidden inline-flex w-full items-center justify-center rounded-md bg-gradient-to-r from-rose-400 to-rose-900 hover:bg-gradient-to-l hover:to-rose-900 hover:from-rose-400 bg-[length:200%_200%] bg-[position:0%_50%] hover:bg-[position:100%_50%] transition-[background-position] duration-500 ease-out px-4 py-3 font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer space-x-3"
      onClick={onClick}
    >
      <FaGoogle />
      <span>Continue with Google</span>
    </button>
  );
};
