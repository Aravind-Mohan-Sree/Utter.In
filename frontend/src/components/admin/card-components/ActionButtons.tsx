import { ReactNode } from 'react';
import { FiSlash, FiCheckCircle, FiEye } from 'react-icons/fi';
import { RiVerifiedBadgeFill } from 'react-icons/ri';

interface ActionButtonsProps {
  variant?: 'toggle' | 'view' | 'verify';
  status?: 'Active' | 'Blocked' | string;
  verified?: boolean;
  rejectionReason?: string | null;
  onToggle?: (id: string) => void;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  itemId?: string;
  customActions?: ReactNode;
  className?: string;
}

export const ActionButtons = ({
  variant = 'toggle',
  status,
  verified,
  rejectionReason,
  onToggle,
  onView,
  itemId,
  className = '',
}: ActionButtonsProps) => {
  const handleClick = () => {
    if (variant === 'toggle' && onToggle && itemId !== undefined) {
      onToggle(itemId);
    } else if (
      (variant === 'view' || variant === 'verify') &&
      onView &&
      itemId !== undefined
    ) {
      onView(itemId);
    }
  };

  const renderIcon = () => {
    if (variant === 'toggle') {
      return status === 'Active' ? (
        <FiSlash size={22} />
      ) : (
        <FiCheckCircle size={22} />
      );
    }

    if (variant === 'view') {
      return <FiEye size={22} />;
    }

    if (variant === 'verify') {
      return <RiVerifiedBadgeFill size={24} />;
    }

    return null;
  };

  const getButtonClasses = () => {
    if (variant === 'toggle') {
      return status === 'Active'
        ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
        : 'text-gray-400 hover:text-green-500 hover:bg-green-50';
    }
    if (variant === 'view') {
      return 'text-gray-400 hover:text-blue-500 hover:bg-blue-50';
    }
    if (variant === 'verify') {
      return `${
        rejectionReason
          ? 'hover:bg-gray-50'
          : 'hover:text-amber-500 hover:bg-amber-50'
      } ${verified ? 'text-amber-500' : 'text-gray-400'}`;
    }
    return '';
  };

  return (
    <div className={`flex justify-end gap-2 ${className}`}>
      <button
        onClick={handleClick}
        className={`rounded-lg transition-colors cursor-pointer p-1 ${getButtonClasses()}`}
      >
        {renderIcon()}
      </button>
    </div>
  );
};
