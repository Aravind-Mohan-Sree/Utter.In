import React, { useCallback, useEffect, useRef,useState } from 'react';
import { BiAward, BiHistory, BiTimer } from 'react-icons/bi';

import quizService from '../../services/user/quizService';
import { BaseModal } from './BaseModal';

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

interface QuizHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuizHistoryModal: React.FC<QuizHistoryModalProps> = ({ isOpen, onClose }) => {
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

  const fetchHistory = async (currPage: number, force: boolean = false) => {
    if ((isLoading || (!hasMore && currPage > 1)) && !force) return;
    setIsLoading(true);
    try {
      const response = await quizService.getHistory(currPage, 5);
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
    if (isOpen) {
      setHistory([]);
      setPage(1);
      setHasMore(true);
      fetchHistory(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (page > 1) {
      fetchHistory(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Past Attempts">
      <div className="max-h-[60vh] overflow-y-auto px-6 py-4 scrollbar-hide">
        <div className="space-y-6">
          {history.map((attempt, idx) => (
            <div
              key={attempt.id}
              ref={idx === history.length - 1 ? lastElementRef : null}
              className="group relative bg-white backdrop-blur-sm border border-slate-100 hover:border-rose-200 p-4 sm:p-6 rounded-2xl sm:rounded-3xl transition-all flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6"
            >
              <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white border border-slate-100 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs">
                  <span className="text-sm sm:text-lg font-black text-slate-800 uppercase">
                    {attempt.language[0]}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">{attempt.language}</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest leading-none">
                      {attempt.difficulty}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest leading-none">
                      {new Date(attempt.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 sm:gap-6 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-8 w-full sm:w-auto justify-around sm:justify-start flex-shrink-0">
                <div className="text-center">
                  <BiAward className="text-rose-500 text-lg sm:text-xl mx-auto" />
                  <p className="text-base sm:text-lg font-black text-slate-800 mt-1">{attempt.score}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Pts</p>
                </div>
                <div className="text-center">
                  <BiTimer className="text-indigo-500 text-lg sm:text-xl mx-auto" />
                  <p className="text-base sm:text-lg font-black text-slate-800 mt-1">{Math.round(attempt.totalTimeTaken / attempt.totalQuestions)}s</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Avg</p>
                </div>
              </div>
            </div>
          ))}

          {!isLoading && history.length === 0 && (
            <div className="text-center py-10 select-none">
               <BiHistory className="text-4xl mx-auto mb-2" />
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No Attempts Yet</p>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-8">
               <div className="flex gap-2 animate-pulse">
                 {[1,2,3].map(i => <div key={i} className="w-2.5 h-2.5 bg-rose-500 rounded-full" />)}
               </div>
            </div>
          )}

          {!hasMore && history.length > 0 && (
             <p className="text-center py-6 text-slate-300 font-black text-[10px] uppercase tracking-[0.2em]">End of List</p>
          )}
        </div>
      </div>
    </BaseModal>
  );
};

export default QuizHistoryModal;
