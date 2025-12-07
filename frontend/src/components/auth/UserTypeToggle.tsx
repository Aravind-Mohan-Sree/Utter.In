import { UserType } from "~types/auth/UserType";

interface UserTypeToggleProps {
  userType: UserType;
  onChange: (type: UserType) => void;
}

export const UserTypeToggle: React.FC<UserTypeToggleProps> = ({
  userType,
  onChange,
}) => {
  return (
    <div className="flex justify-center mb-6">
      <div className="relative inline-flex bg-gray-100 rounded-full p-1">
        <div
          className="absolute top-1 bottom-1 w-1/2 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-300 ease-in-out"
          style={{
            transform:
              userType === 'tutor' ? 'translateX(92%)' : 'translateX(0)',
            left: '4px',
          }}
        />
        <button
          type="button"
          className={`cursor-pointer relative px-8 py-2 rounded-full font-medium text-sm transition-all duration-300 z-10 ${
            userType === 'user'
              ? 'text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => onChange('user')}
        >
          User
        </button>
        <button
          type="button"
          className={`cursor-pointer relative px-8 py-2 rounded-full font-medium text-sm transition-all duration-300 z-10 ${
            userType === 'tutor'
              ? 'text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => onChange('tutor')}
        >
          Tutor
        </button>
      </div>
    </div>
  );
};
