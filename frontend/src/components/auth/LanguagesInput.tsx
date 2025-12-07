import React, { useState, useEffect, useRef } from 'react';

interface LanguagesInputProps {
  languages: string[];
  onLanguagesChange: (languages: string[]) => void;
  maxLanguages?: number;
  error: string;
}

const commonLanguages = [
  'English',
  'Spanish',
  'French',
  'German',
  'Chinese',
  'Japanese',
  'Korean',
  'Hindi',
  'Arabic',
  'Russian',
  'Portuguese',
  'Italian',
  'Dutch',
  'Turkish',
  'Vietnamese',
];

export const LanguagesInput: React.FC<LanguagesInputProps> = ({
  languages,
  onLanguagesChange,
  maxLanguages = 3,
  error,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = commonLanguages.filter(
    (lang) =>
      lang.toLowerCase().includes(inputValue.toLowerCase()) &&
      !languages.includes(lang),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddLanguage = (language: string) => {
    if (
      languages.length < maxLanguages &&
      language.trim() &&
      !languages.includes(language)
    ) {
      onLanguagesChange([...languages, language]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const handleRemoveLanguage = (languageToRemove: string) => {
    onLanguagesChange(languages.filter((lang) => lang !== languageToRemove));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(value.length > 0);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      handleAddLanguage(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && languages.length > 0) {
      handleRemoveLanguage(languages[languages.length - 1]);
    }
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700">
        Known Languages {maxLanguages && `(Max ${maxLanguages})`}
      </label>

      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Type a language (e.g., English, Spanish, French...)"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all duration-300 bg-transparent text-gray-700"
          disabled={languages.length >= maxLanguages}
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.map((language) => (
              <button
                key={language}
                type="button"
                className="w-full px-4 py-2 text-left hover:bg-rose-50 transition-colors duration-150 text-gray-600 cursor-pointer"
                onClick={() => handleAddLanguage(language)}
              >
                {language}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <span className="text-sm text-red-500 wrap-break-word">{error}</span>
      )}

      {/* Selected Languages Tags */}
      {languages.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {languages.map((language) => (
            <div
              key={language}
              className="inline-flex items-center gap-1 bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 px-3 py-1.5 rounded-full border border-rose-200"
            >
              <span className="text-sm font-medium">{language}</span>
              <button
                type="button"
                onClick={() => handleRemoveLanguage(language)}
                className="text-rose-500 hover:text-rose-700 ml-1 cursor-pointer"
                aria-label={`Remove ${language}`}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
