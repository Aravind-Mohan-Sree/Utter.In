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
      className="cursor-pointer w-full py-3 px-4 bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold rounded-lg hover:from-rose-500 hover:to-pink-600 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none flex items-center justify-center space-x-3"
      onClick={onClick}
    >
      <FaGoogle />
      <span>Continue with Google</span>
    </button>
  );
};
