import React from 'react';
import { BiCalendar, BiHistory,BiTimer, BiTrophy } from 'react-icons/bi';

interface QuizStatsHeaderProps {
  currentStreak: number;
  highestStreak: number;
  lastParticipation: string | null;
  onOpenLeaderboard: () => void;
  onOpenHistory: () => void;
}

const QuizStatsHeader: React.FC<QuizStatsHeaderProps> = ({
  currentStreak,
  highestStreak,
  lastParticipation,
  onOpenLeaderboard,
  onOpenHistory,
}) => {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 p-6 bg-white/60 backdrop-blur-md rounded-3xl shadow-sm border border-slate-100">
      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-6 w-full lg:w-auto">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-orange-500 mb-1 h-9">
            <BiTimer className="text-2xl sm:text-3xl" />
            <span className="text-lg sm:text-xl font-bold font-heading">{currentStreak}</span>
          </div>
          <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest font-black">Streak</p>
        </div>

        <div className="hidden sm:block h-10 w-[1px] bg-slate-200" />

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-rose-500 mb-1 h-9">
            <BiTrophy className="text-xl sm:text-2xl" />
            <span className="text-lg sm:text-xl font-bold font-heading">{highestStreak}</span>
          </div>
          <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest font-black">High</p>
        </div>

        <div className="hidden md:block h-10 w-[1px] bg-slate-200" />

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-indigo-500 mb-1 h-9">
            <BiCalendar className="text-xl sm:text-2xl" />
            <span className="text-sm sm:text-lg font-bold uppercase whitespace-nowrap">
              {lastParticipation ? new Date(lastParticipation).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest font-black">Last Attempt</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
        <button
          onClick={onOpenHistory}
          className="flex-1 cursor-pointer group relative inline-flex items-center justify-center px-6 py-3 font-black text-[10px] uppercase tracking-widest text-slate-600 transition-all duration-300 bg-slate-100 hover:bg-slate-200 rounded-xl"
        >
          <BiHistory className="mr-2 text-xl" />
          Past Attempts
        </button>

        <button
          onClick={onOpenLeaderboard}
          className="flex-1 cursor-pointer group relative inline-flex items-center justify-center px-6 py-3 font-black text-[10px] uppercase tracking-widest text-white transition-all duration-300 bg-rose-500 hover:bg-rose-600 rounded-xl shadow-lg shadow-rose-200"
        >
          <BiTrophy className="mr-2 text-xl" />
          Leaderboard
        </button>
      </div>
    </div>
  );
};

export default QuizStatsHeader;
