interface JoinedDateProps {
  date: string | Date;
  className?: string;
}

export const JoinedDate = ({ date, className = '' }: JoinedDateProps) => {
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
    <div className={`text-[.625rem] text-gray-500 ${className}`}>
      Joined{' '}
      <span className="font-medium text-gray-700">{formatDate(date)}</span>
    </div>
  );
};
