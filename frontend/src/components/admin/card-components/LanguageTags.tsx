interface LanguageTagsProps {
  languages: string[];
  variant?: 'default' | 'rose';
  className?: string;
}

export const LanguageTags = ({
  languages,
  variant = 'rose',
  className = '',
}: LanguageTagsProps) => {
  const variantClasses =
    variant === 'rose'
      ? 'bg-rose-50 text-rose-600'
      : 'bg-blue-50 text-blue-600';

  if (!languages || languages.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {languages.map((lang: string) => (
        <span
          key={lang}
          className={`px-2 py-1 ${variantClasses} text-[10px] font-medium rounded-md`}
        >
          {lang}
        </span>
      ))}
    </div>
  );
};
