'use client';

interface DateAndTimeProps {
  date: string | Date;
  className?: string;
  showTime?: boolean;
  label?: string;
  time?: string;
}

export const DateAndTime = ({
  date,
  className = '',
  showTime = false,
  label = 'Joined',
  time
}: DateAndTimeProps) => {
  const formatDate = (dateInput: string | Date) => {
    const d = new Date(dateInput);
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();

    const getOrdinal = (n: number) => {
      const s = ['th', 'st', 'nd', 'rd'];
      const v = n % 100;
      return s[(v - 20) % 10] || s[v] || s[0];
    };

    return `${day}${getOrdinal(day)} ${month} ${year}`;
  };

  return (
    <div className={`text-[.625rem] text-gray-500 flex items-center gap-1 ${className}`}>
      <span>{label}</span>
      <span className="font-medium text-gray-700">
        {formatDate(date)}
        {showTime && (time || date) && (
          <>
            <span className="mx-1">•</span>
            {time ? new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </>
        )}
      </span>
    </div>
  );
};
