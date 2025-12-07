import { useRouter } from 'next/navigation';
import { UserType } from '~types/auth/UserType';

interface FormOptionsProps {
  userType?: UserType;
}

export const FormOptions: React.FC<FormOptionsProps> = ({ userType }) => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        className="text-gray-600 text-sm text-gradient-to-r from-rose-400 to-pink-500 hover:text-rose-600 transition-colors duration-300 font-medium cursor-pointer"
        onClick={() =>
          router.push(userType === 'user' ? '/user/forgot-password' : '/tutor/forgot-password')
        }
      >
        Forgot password?
      </button>
    </div>
  );
};
