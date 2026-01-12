'use client';

import { StatusBadge } from './card-components/StatusBadge';
import { LanguageTags } from './card-components/LanguageTags';
import { UserInfo } from './card-components/UserInfo';
import { ActionButtons } from './card-components/ActionButtons';
import { ReportSection } from './card-components/ReportSection';
import { HiArrowRight } from 'react-icons/hi';
import Avatar from '~components/shared/Avatar';

export type CardType = 'user' | 'tutor' | 'report';

interface BaseCardProps {
  id: string;
  type: CardType;
}

interface UserCardProps extends BaseCardProps {
  type: 'user';
  name: string;
  email: string;
  avatarUrl: string | null;
  status: 'Active' | 'Blocked';
  languages: string[];
  onToggleStatus?: (id: string) => void;
}

export interface TutorCardProps extends BaseCardProps {
  type: 'tutor';
  name: string;
  email: string;
  avatarUrl: string | null;
  status: 'Active' | 'Blocked';
  verified: boolean;
  rejectionReason: string | null;
  languages: string[];
  experience?: string;
  onToggleStatus?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  customActions?: React.ReactNode;
}

interface ReportCardProps extends BaseCardProps {
  type: 'report';
  status: 'Pending' | 'Resolved' | 'Rejected';
  reporter: {
    name: string;
    email: string;
    avatarUrl: string;
  };
  reported: {
    name: string;
    email: string;
    avatarUrl: string;
  };
  dateTime?: string;
  abuseType?: string;
  channel?: 'chat' | 'video';
  onViewDetails?: (id: string) => void;
}

type CardProps = UserCardProps | TutorCardProps | ReportCardProps;

export const Card = (props: CardProps) => {
  if (props.type === 'report') {
    return <ReportCard {...props} />;
  }

  if (props.type === 'tutor') {
    return <TutorCard {...props} />;
  }

  return <UserCard {...props} />;
};

// User card component
const UserCard = ({
  id,
  name,
  email,
  avatarUrl,
  status,
  languages,
  onToggleStatus,
}: UserCardProps) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition-all">
    <div className="mb-4">
      <div className="flex gap-3 min-w-0 items-start justify-between">
        <div className="flex gap-3 min-w-0 flex-1">
          <Avatar user={{ name, avatarUrl, role: 'admin' }} size="md" />
          <UserInfo name={name} email={email} />
        </div>
        <StatusBadge status={status} />
      </div>
    </div>

    {languages && languages.length > 0 && (
      <LanguageTags languages={languages} variant="default" className="mb-4" />
    )}

    {onToggleStatus && (
      <div className="flex justify-end pt-3 mt-3 border-t border-gray-200">
        <ActionButtons
          variant="toggle"
          status={status}
          onToggle={onToggleStatus}
          itemId={id}
        />
      </div>
    )}
  </div>
);

// Tutor card component
const TutorCard = ({
  id,
  name,
  email,
  avatarUrl,
  status,
  verified,
  rejectionReason,
  languages,
  experience,
  onToggleStatus,
  onViewDetails,
  customActions,
}: TutorCardProps) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition-all">
    <div className="mb-4">
      <div className="flex gap-3 min-w-0 items-start justify-between">
        <div className="flex gap-3 min-w-0 flex-1">
          <Avatar user={{ name, avatarUrl, role: 'admin' }} size="md" />
          <UserInfo name={name} email={email} additionalInfo={experience} />
        </div>
        <StatusBadge status={status} />
      </div>
    </div>

    {languages && languages.length > 0 && (
      <LanguageTags languages={languages} variant="default" className="mb-4" />
    )}

    {(onToggleStatus || onViewDetails || customActions) && (
      <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-gray-200">
        {customActions ? (
          customActions
        ) : (
          <>
            {onViewDetails && (
              <ActionButtons
                variant="verify"
                status={status}
                verified={verified}
                rejectionReason={rejectionReason}
                onView={onViewDetails}
                itemId={id}
              />
            )}
            {onToggleStatus && (
              <ActionButtons
                variant="toggle"
                status={status}
                onToggle={onToggleStatus}
                itemId={id}
              />
            )}
          </>
        )}
      </div>
    )}
  </div>
);

// Report card component
const ReportCard = ({
  id,
  status,
  reporter,
  reported,
  dateTime,
  abuseType,
  channel,
  onViewDetails,
}: ReportCardProps) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all">
    {/* Header with Channel Badge and Status */}
    <div className="flex items-center justify-between mb-4">
      {channel && (
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${
            channel === 'chat'
              ? 'bg-blue-100 text-blue-600'
              : 'bg-purple-100 text-purple-600'
          }`}
        >
          {channel.charAt(0).toUpperCase() + channel.slice(1)}
        </span>
      )}
      <StatusBadge status={status} variant="yellow" />
    </div>

    {/* Reporter and Reported Sections */}
    <div className="flex items-center gap-4 mb-4">
      <ReportSection
        user={reporter}
        role="Reporter (User)"
        variant="reporter"
        className="flex-1"
      />
      <HiArrowRight className="text-gray-400 shrink-0" size={20} />
      <ReportSection
        user={reported}
        role="Reported (Tutor)"
        variant="reported"
        className="flex-1"
      />
    </div>

    {/* Date & Time and Abuse Type */}
    {(dateTime || abuseType) && (
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 text-sm">
        {dateTime && (
          <div>
            <span className="text-gray-500">Date & Time: </span>
            <span className="font-semibold text-gray-900">{dateTime}</span>
          </div>
        )}
        {abuseType && (
          <div>
            <span className="text-gray-500">Abuse Type: </span>
            <span className="font-semibold text-gray-900">{abuseType}</span>
          </div>
        )}
      </div>
    )}

    {/* View Details Button */}
    {onViewDetails && (
      <button
        onClick={() => onViewDetails(id)}
        className="w-full bg-gradient-to-r from-rose-400 to-rose-600 text-white py-2.5 px-4 rounded-lg font-medium hover:from-rose-500 hover:to-rose-700 transition-all"
      >
        View Details
      </button>
    )}
  </div>
);
