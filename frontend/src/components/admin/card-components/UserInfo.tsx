interface UserInfoProps {
  name: string;
  email: string;
  additionalInfo?: string;
  className?: string;
}

export const UserInfo = ({
  name,
  email,
  additionalInfo,
  className = '',
}: UserInfoProps) => {
  return (
    <div className={`min-w-0 ${className}`}>
      <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
      <p className="text-xs text-gray-500 truncate">{email}</p>
      {additionalInfo && (
        <p className="text-[10px] text-gray-500 truncate mt-1">
          {additionalInfo}
        </p>
      )}
    </div>
  );
};
