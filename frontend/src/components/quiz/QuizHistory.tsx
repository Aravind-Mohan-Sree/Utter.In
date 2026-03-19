import React, { useCallback, useEffect, useRef,useState } from 'react';
import { BiAward, BiHistory, BiInfinite,BiTimer } from 'react-icons/bi';

import quizService from '../../services/user/quizService';

interface QuizAttempt {
  id: string;
  language: string;
  difficulty: string;
  volume: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  totalTimeTaken: number;
  completedAt: string;
}

const QuizHistory: React.FC = () => {
  const [history, setHistory] = useState<QuizAttempt[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore],
  );

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await quizService.getHistory(page, 5);
      const newData = response.data;
      
      setHistory((prev) => {
        const existingIds = new Set(prev.map(item => item.id));
        const filteredNew = newData.filter((item: QuizAttempt) => !existingIds.has(item.id));
        return [...prev, ...filteredNew];
      });
      if (newData.length < 5) setHasMore(false);
    } catch (error) {
           console.error('Failed to fetch history', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="max-w-xl mx-auto mt-16 px-4">
      <div className="flex items-center gap-4 mb-10 group cursor-default">
         <div className="p-4 bg-slate-900 text-white rounded-2xl group-hover:rotate-12 transition-transform duration-500 shadow-xl">
           <BiHistory className="text-3xl" />
         </div>
         <div>
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-widest italic">PREVIOUS ATTEMPTS</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Your journey through time</p>
         </div>
      </div>

      <div className="space-y-6">
        {history.map((attempt, idx) => (
          <div
            key={attempt.id}
            ref={idx === history.length - 1 ? lastElementRef : null}
            className="group relative bg-white/50 backdrop-blur-sm border border-slate-100 hover:border-rose-200 p-8 rounded-3xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 bg-slate-50 border border-slate-100/50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-rose-500 transition-colors duration-500">
                  <span className="text-2xl font-black text-slate-800 group-hover:text-white uppercase">
                    {attempt.language[0]}
                  </span>
               </div>
               <div>
                 <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{attempt.language}</h4>
                 <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                       {attempt.difficulty}
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                       {new Date(attempt.completedAt).toLocaleDateString()}
                    </span>
                 </div>
               </div>
            </div>

            <div className="flex gap-8 border-t sm:border-t-0 sm:border-l border-slate-100 pt-6 sm:pt-0 sm:pl-8 flex-shrink-0">
               <div className="text-center group-hover:scale-110 transition-transform">
                  <BiAward className="text-rose-500 text-2xl mx-auto" />
                  <p className="text-xl font-black text-slate-800 mt-1">{attempt.score}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pts</p>
               </div>
               <div className="text-center group-hover:scale-110 transition-transform delay-75">
                  <BiTimer className="text-indigo-500 text-2xl mx-auto" />
                  <p className="text-xl font-black text-slate-800 mt-1">{Math.round(attempt.totalTimeTaken / attempt.totalQuestions)}s</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Avg</p>
               </div>
            </div>
            {/* Ambient light on hover */}
            <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-rose-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
             <BiInfinite className="text-4xl animate-pulse" />
             <span className="text-sm font-black tracking-widest uppercase animate-pulse">Synchronizing your history...</span>
          </div>
        )}

        {!hasMore && history.length > 0 && (
           <p className="text-center py-12 text-slate-300 font-black text-xs uppercase tracking-[0.2em]">The beginning of your legacy</p>
        )}
      </div>
    </div>
  );
};

export default QuizHistory;
