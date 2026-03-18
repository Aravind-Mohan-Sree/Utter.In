import Avatar from '~components/ui/Avatar';

import { UserInfo } from './UserInfo';

interface ReportSectionProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
  role: string;
  variant?: 'reporter' | 'reported';
  className?: string;
}

export const ReportSection = ({
  user,
  role,
  // variant = 'reporter',
  className = '',
}: ReportSectionProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Avatar
        user={{
          id: user.id,
          name: user.name,
          role: 'user',
        }}
        size="md"
      />
      <UserInfo name={user.name} email={user.email} additionalInfo={role} />
    </div>
  );
};
