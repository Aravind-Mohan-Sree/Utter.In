import React from 'react';
import { BiTrophy, BiRefresh, BiTargetLock, BiTimeFive, BiCheckCircle } from 'react-icons/bi';

interface QuizResultProps {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  totalTimeTaken: number;
  onRestart: () => void;
}

const QuizResult: React.FC<QuizResultProps> = ({
  score,
  totalQuestions,
  correctAnswers,
  accuracy,
  totalTimeTaken,
  onRestart,
}) => {
  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 text-center animate-in zoom-in duration-500 transition-all">
      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-rose-500 rotate-12 mx-auto rounded-2xl flex items-center justify-center -mt-10 sm:-mt-12 shadow-lg animate-bounce-slow">
        <BiTrophy className="text-white text-2xl sm:text-3xl -rotate-12" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-6 sm:mt-8 mb-5 tracking-tight">KEEP IT GOING!</h2>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100/50 flex flex-col items-center">
          <BiCheckCircle className="text-emerald-500 text-2xl mb-1" />
          <span className="text-xl font-black text-slate-800">{correctAnswers} / {totalQuestions}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Correct</span>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100/50 flex flex-col items-center">
          <BiTargetLock className="text-rose-500 text-2xl mb-1" />
          <span className="text-xl font-black text-slate-800">{accuracy.toFixed(1)}%</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Accuracy</span>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100/50 flex flex-col items-center">
          <BiTimeFive className="text-indigo-500 text-2xl mb-1" />
          <span className="text-xl font-black text-slate-800">{Math.round(totalTimeTaken / totalQuestions)}s</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Avg Speed</span>
        </div>
        <div className="p-4 bg-slate-900 rounded-xl flex flex-col items-center text-white shadow-sm">
          <BiTrophy className="text-rose-400 text-xl mb-1" />
          <span className="text-xl font-black">{score}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">PTS EARNED</span>
        </div>
      </div>

      <button
        onClick={onRestart}
        className="cursor-pointer group w-full py-4 bg-slate-900 hover:bg-black text-white font-black rounded-xl shadow-md transform hover:-translate-y-0.5 active:translate-y-0 transition-all text-base flex items-center justify-center gap-3 uppercase tracking-widest"
      >
        <BiRefresh className="text-2xl group-hover:rotate-180 transition-transform duration-500" />
        Play Again
      </button>
    </div>
  );
};

export default QuizResult;
