import React, { useState } from 'react';

import { commonLanguages } from '../form/LanguagesInput';

interface QuizConfigProps {
  onStart: (language: string, difficulty: 'Easy' | 'Medium' | 'Hard', volume: number) => void;
  isLoading: boolean;
}

const QuizConfig: React.FC<QuizConfigProps> = ({ onStart, isLoading }) => {
  const [language, setLanguage] = useState(commonLanguages[0]);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [volume, setVolume] = useState(10);

  return (
    <div className="w-full max-w-sm mx-auto p-4 sm:p-6 bg-white shadow-sm rounded-2xl border border-slate-100">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 tracking-wider mb-3">
            Select Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-4 border-2 border-slate-100 rounded-xl focus:border-rose-400 focus:outline-none cursor-pointer text-gray-700 transition-all font-semibold"
          >
            {commonLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 tracking-wider mb-3">
            Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setDifficulty(level)}
                className={`cursor-pointer py-2 rounded-xl font-bold transition-all border-2 ${
                  difficulty === level
                    ? 'bg-rose-500 text-white border-rose-500 shadow-lg'
                    : 'bg-white text-gray-600 border-slate-100 hover:border-rose-400'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 tracking-wider mb-3">
            Number of Questions
          </label>
          <div className="flex gap-4">
            {[5, 10, 20].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVolume(v)}
                className={`cursor-pointer flex-1 py-2 rounded-xl font-bold transition-all border-2 ${
                  volume === v
                    ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                    : 'bg-white text-gray-600 border-slate-100 hover:border-rose-400'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onStart(language, difficulty, volume)}
          disabled={isLoading}
          className="cursor-pointer w-full relative overflow-hidden group bg-gradient-to-r from-rose-500 to-rose-600 text-white font-black py-3 rounded-xl shadow-[0_10px_20px_-10px_rgba(244,63,94,0.5)] transform hover:-translate-y-0.5 active:translate-y-0.5 transition-all text-xl disabled:opacity-50 tracking-wider disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </div>
          ) : (
            'Start Quiz'
          )}
        </button>
      </div>
    </div>
  );
};

export default QuizConfig;
