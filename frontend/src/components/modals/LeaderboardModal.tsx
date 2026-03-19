import React, { useEffect, useRef,useState } from 'react';
import { BiHash,BiTargetLock, BiTimeFive, BiTimer, BiTrophy } from 'react-icons/bi';

import quizService from '../../services/user/quizService';
import { BaseModal } from './BaseModal';

interface LeaderboardUser {
  id: string;
  name: string;
  email: string;
  streak: {
    currentStreak: number;
    highestStreak: number;
  };
  quizStats: {
    totalQuizzes: number;
    averageAccuracy: number;
    averageSpeed: number;
  };
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: { email?: string; quizStats?: { totalQuizzes?: number; averageAccuracy?: number; averageSpeed?: number }; [key: string]: unknown };
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const myRank = users.findIndex(u => u.email === currentUser?.email) + 1;

  const fetchLeaderboard = async (currPage: number, force: boolean = false) => {
    if ((isLoading || !hasMore) && !force) return;
    setIsLoading(true);
    try {
      const response = await quizService.getLeaderboard(currPage, 20);
      const newData = response.data;
      setUsers((prev) => {
        const existingIds = new Set(prev.map(u => u.id));
        const filteredNew = newData.filter((u: LeaderboardUser) => !existingIds.has(u.id));
        return [...prev, ...filteredNew];
      });
      if (newData.length < 20 || currPage * 20 >= 100) setHasMore(false);
    } catch (error) {
      console.error('Failed to fetch leaderboard', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setUsers([]);
      setHasMore(true);
      fetchLeaderboard(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !isLoading) {
      const next = Math.floor(users.length / 20) + 1;
      fetchLeaderboard(next);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Leaderboard">
      <div
        className="max-h-[60vh] overflow-y-auto px-6 py-4 scrollbar-hide"
        onScroll={handleScroll}
        ref={scrollRef}
      >
        {currentUser && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 bg-slate-900 rounded-2xl p-4 flex items-center justify-between text-white shadow-lg shadow-slate-200">
               <div>
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Your Rank</p>
                 <h3 className="text-xl sm:text-2xl font-black">{myRank > 0 ? `#${myRank}` : 'N/A'}</h3>
               </div>
               <BiTrophy className="text-2xl sm:text-3xl text-rose-400" />
            </div>
            <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
               <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Total Quizzes</p>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-800">{currentUser.quizStats?.totalQuizzes || 0}</h3>
               </div>
               <BiHash className="text-3xl sm:text-4xl text-indigo-500" />
            </div>
          </div>
        )}

        <div className="space-y-4">
          {users.map((user, idx) => {
            const rank = idx + 1;
            const isMe = user.email === currentUser?.email;
            let rankColor = 'bg-slate-50 text-slate-400';
            if (rank === 1) rankColor = 'bg-amber-400 text-white shadow-sm ring-4 ring-amber-50';
            if (rank === 2) rankColor = 'bg-slate-300 text-white shadow-sm ring-4 ring-slate-50';
            if (rank === 3) rankColor = 'bg-orange-400 text-white shadow-sm ring-4 ring-orange-50';

            return (
              <div
                key={user.id}
                className={`group flex items-center gap-3 sm:gap-6 p-4 sm:p-5 rounded-2xl sm:rounded-3xl transition-all border ${isMe ? 'bg-rose-50/30 border-rose-100' : 'bg-white border-slate-100'} hover:border-rose-200`}
              >
                <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-sm sm:text-xl flex-shrink-0 transition-transform ${rankColor}`}>
                  {rank <= 3 ? <BiTrophy className="text-lg sm:text-2xl" /> : `#${rank}`}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className={`font-black text-lg flex items-center gap-2 truncate uppercase tracking-tight ${isMe ? 'text-rose-600' : 'text-slate-800'}`}>
                    {isMe ? 'You' : user.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1">
                    <div className="flex items-center gap-1 text-orange-500">
                      <BiTimer className="text-xs sm:text-md" />
                      <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">{user.streak?.currentStreak || 0} Streak</span>
                    </div>
                    <div className="flex items-center gap-1 text-rose-500">
                      <BiTargetLock className="text-xs sm:text-sm" />
                      <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">{user.quizStats?.averageAccuracy?.toFixed(0) || 0}% Acc</span>
                    </div>
                    <div className="flex items-center gap-1 text-indigo-500">
                      <BiTimeFive className="text-xs" />
                      <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">{user.quizStats?.averageSpeed?.toFixed(1) || 0}s Avg</span>
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex flex-col items-end flex-shrink-0">
                  <p className="text-2xl font-black text-slate-900 leading-none">{user.quizStats?.totalQuizzes || 0}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Quizzes</p>
                </div>
              </div>
            );
          })}

          {!isLoading && users.length === 0 && (
            <div className="text-center py-20 px-10 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 animate-in fade-in zoom-in duration-700">
              <BiTrophy className="text-6xl text-slate-200 mx-auto mb-4" />
              <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">The Arena is Quiet</h3>
              <p className="text-slate-400 text-sm font-medium mt-2 max-w-xs mx-auto">First entries are pending. Start a quiz to claim your spot on the global stage.</p>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex gap-2 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="w-2.5 h-2.5 bg-rose-500 rounded-full" />)}
              </div>
            </div>
          )}

          {!hasMore && users.length > 0 && (
            <div className="text-center py-6 select-none">
              <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.3em]">End of List</p>
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  );
};

export default LeaderboardModal;
