'use client';

import { StatusBadge } from './card-components/StatusBadge';
import { LanguageTags } from './card-components/LanguageTags';
import { UserInfo } from './card-components/UserInfo';
import { ReportSection } from './card-components/ReportSection';
import { HiArrowRight } from 'react-icons/hi';
import Avatar from '~components/shared/Avatar';
import Button from '~components/shared/Button';
import { FiCheckCircle, FiSlash } from 'react-icons/fi';
import { RiVerifiedBadgeFill } from 'react-icons/ri';
import { DateAndTime } from '~components/shared/DateAndTime';
import { BiTime } from 'react-icons/bi';

export type CardType = 'user' | 'tutor' | 'report' | 'session';

interface BaseCardProps {
  id: string;
  type: CardType;
}

interface UserCardProps extends BaseCardProps {
  type: 'user';
  name: string;
  email: string;
  avatarUrl: string | null;
  joinedAt: Date;
  status: 'Active' | 'Blocked';
  knownLanguages: string[];
  onToggleStatus?: (id: string) => void;
}

export interface TutorCardProps extends BaseCardProps {
  type: 'tutor';
  name: string;
  email: string;
  avatarUrl: string;
  joinedAt: Date;
  knownLanguages: string[];
  yearsOfExperience: string;
  isVerified: boolean;
  rejectionReason: string | null;
  isLoading: boolean;
  status: 'Active' | 'Blocked';
  onViewDetails?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
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

export interface SessionCardProps extends BaseCardProps {
  type: 'session';
  title: string;
  subtitle: string;
  date: string | Date;
  time: string;
  language: string;
  status?: 'Available' | 'Booked';
  onCancel?: (id: string) => void;
}

type CardProps = UserCardProps | TutorCardProps | ReportCardProps | SessionCardProps;

export const Card = (props: CardProps) => {
  if (props.type === 'report') {
    return <ReportCard {...props} />;
  }

  if (props.type === 'tutor') {
    return <TutorCard {...props} />;
  }

  if (props.type === 'session') {
    return <SessionCard {...props} />;
  }

  return <UserCard {...props} />;
};

// User card component
const UserCard = ({
  id,
  name,
  email,
  avatarUrl,
  joinedAt,
  status,
  knownLanguages,
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

    {knownLanguages && knownLanguages.length > 0 && (
      <LanguageTags
        knownLanguages={knownLanguages}
        variant="default"
        className="mb-4"
      />
    )}
    <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200">
      <DateAndTime date={joinedAt} label="Joined" />

      {onToggleStatus && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            icon={
              status === 'Active' ? (
                <FiSlash size={22} />
              ) : (
                <FiCheckCircle size={22} />
              )
            }
            className={`text-gray-400! h-fit rounded-lg p-0.5! transition-colors duration-200! ${status === 'Active'
              ? 'text-gray-400 hover:text-red-500! hover:bg-red-50'
              : 'text-gray-400 hover:text-green-500! hover:bg-green-50'
              }`}
            onClick={onToggleStatus}
            args={[id]}
          />
        </div>
      )}
    </div>
  </div>
);

// Tutor card component
const TutorCard = ({
  id,
  name,
  email,
  avatarUrl,
  joinedAt,
  knownLanguages,
  yearsOfExperience,
  isVerified,
  rejectionReason,
  isLoading,
  status,
  onViewDetails,
  onToggleStatus,
  customActions,
}: TutorCardProps) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition-all">
    <div className="mb-4">
      <div className="flex gap-3 min-w-0 items-start justify-between">
        <div className="flex gap-3 min-w-0 flex-1">
          <Avatar user={{ name, avatarUrl, role: 'admin' }} size="md" />
          <UserInfo
            name={name}
            email={email}
            additionalInfo={yearsOfExperience}
          />
        </div>
        <StatusBadge status={status} />
      </div>
    </div>

    {knownLanguages && knownLanguages.length > 0 && (
      <LanguageTags
        knownLanguages={knownLanguages}
        variant="default"
        className="mb-4"
      />
    )}

    <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200">
      <DateAndTime date={joinedAt} label="Joined" />

      <div className="flex gap-2">
        {(onToggleStatus || onViewDetails || customActions) && (
          <div className="flex justify-end gap-1">
            {customActions ? (
              customActions
            ) : (
              <>
                {onViewDetails && (
                  <Button
                    variant="outline"
                    icon={<RiVerifiedBadgeFill size={23} />}
                    isLoading={isLoading}
                    className={`h-fit rounded-lg p-0.5! transition-colors duration-200! ${rejectionReason
                      ? 'hover:bg-gray-50!'
                      : 'hover:text-amber-500! hover:bg-amber-50!'
                      } ${isVerified ? 'text-amber-500!' : 'text-gray-400!'}`}
                    onClick={onViewDetails}
                    args={[id]}
                  />
                )}
                {onToggleStatus && (
                  <Button
                    variant="outline"
                    icon={
                      status === 'Active' ? (
                        <FiSlash size={22} />
                      ) : (
                        <FiCheckCircle size={22} />
                      )
                    }
                    className={`text-gray-400! h-fit rounded-lg p-0.5! transition-colors duration-200! ${status === 'Active'
                      ? 'text-gray-400 hover:text-red-500! hover:bg-red-50'
                      : 'text-gray-400 hover:text-green-500! hover:bg-green-50'
                      }`}
                    onClick={onToggleStatus}
                    args={[id]}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
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
          className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${channel === 'chat'
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

const SessionCard = ({
  id,
  title,
  subtitle,
  date,
  time,
  language,
  status = 'Available',
  onCancel
}: SessionCardProps) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition-all relative group">
    <div className="flex justify-between items-start mb-2">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-semibold text-gray-900 leading-none">{title}</h3>
        </div>
        <p className="text-sm text-gray-500 font-medium">{subtitle}</p>
      </div>
      <StatusBadge status={status} variant={status === 'Available' ? 'green' : 'blue'} />
    </div>

    <div className="mb-3">
      <LanguageTags knownLanguages={[language]} variant="rose" />
    </div>

    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
      <DateAndTime
        date={date}
        label="Scheduled for"
        showTime={true}
        time={time}
      />

      {onCancel && (
        <Button
          variant="outline"
          icon={
            <FiSlash size={22} />
          }
          className={`text-gray-400! h-fit rounded-lg p-0.5! transition-colors duration-200! text-gray-400 hover:text-red-500! hover:bg-red-50`}
          onClick={onCancel}
          args={[id]}
        />
      )}
    </div>
  </div>
);
