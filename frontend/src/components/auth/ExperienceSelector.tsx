interface ExperienceProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error: string;
}

export const ExperienceSelector: React.FC<ExperienceProps> = ({
  id,
  value,
  onChange,
  error,
}) => {
  return (
    <div className="space-y-2">
      <label
        htmlFor="experience"
        className="block text-sm font-medium text-gray-700"
      >
        Years of Experience
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-transparent text-gray-700 appearance-none cursor-pointer"
      >
        <option value="" hidden>
          Select your experience level
        </option>
        <option value="0-1">0-1 years</option>
        <option value="1-2">1-2 years</option>
        <option value="2-3">2-3 years</option>
        <option value="3-5">3-5 years</option>
        <option value="5-10">5-10 years</option>
        <option value="10+">10+ years</option>
      </select>

      {error && (
        <span className="text-sm text-red-500 wrap-break-word">{error}</span>
      )}
    </div>
  );
};
