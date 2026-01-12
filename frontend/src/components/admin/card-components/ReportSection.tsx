import Avatar from '~components/shared/Avatar';
import { UserInfo } from './UserInfo';

interface ReportSectionProps {
  user: {
    name: string;
    email: string;
    avatarUrl: string;
  };
  role: string;
  variant?: 'reporter' | 'reported';
  className?: string;
}

export const ReportSection = ({
  user,
  role,
  variant = 'reporter',
  className = '',
}: ReportSectionProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Avatar
        user={{
          name: user.name,
          avatarUrl: user.avatarUrl,
          role: 'admin',
        }}
        size="md"
      />
      <UserInfo name={user.name} email={user.email} additionalInfo={role} />
    </div>
  );
};
