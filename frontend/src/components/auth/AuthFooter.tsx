import { useRouter } from 'next/navigation';
import { UserType } from '~types/auth/UserType';

interface AuthFooterProps {
  text: string;
  linkText: string;
  userType: UserType;
}

export const AuthFooter: React.FC<AuthFooterProps> = ({
  text,
  linkText,
  userType,
}) => {
  const router = useRouter();

  return (
    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
      <p className="text-sm text-gray-600">
        {text}{' '}
        <button
          type="button"
          className="cursor-pointer text-gradient-to-r from-rose-400 to-pink-500 hover:text-rose-600 font-medium transition-colors duration-300"
          onClick={() =>
            router.push(
              `/${
                text.startsWith('New') ? 'signup' : 'signin'
              }?mode=${userType}`,
            )
          }
        >
          {linkText}
        </button>
      </p>
    </div>
  );
};
