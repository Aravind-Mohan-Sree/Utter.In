import { useEffect, useRef, useState, useCallback } from 'react';
import { GoX } from 'react-icons/go';
import { getMyReports } from '~services/user/chatService';
import { DateAndTime } from '~components/ui/DateAndTime';
import Loader from '~components/ui/Loader';
import { errorHandler } from '~utils/errorHandler';
import { utterToast } from '~utils/utterToast';
import { useSelector } from 'react-redux';
import { RootState } from '~store/rootReducer';

interface AbuseReport {
  id: string;
  status: 'Pending' | 'Resolved' | 'Rejected';
  type: string;
  reportedUser: {
    id: string;
    name: string;
  };
  date: string;
  description: string;
  channel: 'video' | 'chat';
  rejectionReason?: string;
}

interface AbuseReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TabState {
  reports: AbuseReport[];
  page: number;
  hasMore: boolean;
  loading: boolean;
}

export default function AbuseReportsModal({
  isOpen,
  onClose,
}: AbuseReportsModalProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<'Pending' | 'Resolved' | 'Rejected'>('Pending');
  const [tabStates, setTabStates] = useState<Record<string, TabState>>({
    Pending: { reports: [], page: 1, hasMore: true, loading: false },
    Resolved: { reports: [], page: 1, hasMore: true, loading: false },
    Rejected: { reports: [], page: 1, hasMore: true, loading: false },
  });

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchReports = useCallback(async (tab: string, pageNum: number) => {
    setTabStates(prev => ({
      ...prev,
      [tab]: { ...prev[tab], loading: true }
    }));

    try {
      const res = await getMyReports({ page: pageNum, limit: 10, status: tab }, user?.role as any);
      
      setTabStates(prev => {
        const currentTab = prev[tab];
        const newReports = pageNum === 1 ? res.reports : [...currentTab.reports, ...res.reports];
        return {
          ...prev,
          [tab]: {
            reports: newReports,
            page: pageNum,
            hasMore: res.reports.length === 10,
            loading: false
          }
        };
      });
    } catch (err) {
      utterToast.error(errorHandler(err));
      setTabStates(prev => ({
        ...prev,
        [tab]: { ...prev[tab], loading: false }
      }));
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const state = tabStates[activeTab];
      if (state.reports.length === 0 && state.hasMore && !state.loading) {
        fetchReports(activeTab, 1);
      }
    }
  }, [isOpen, activeTab, fetchReports, tabStates]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        const state = tabStates[activeTab];
        if (state.hasMore && !state.loading && isOpen) {
          fetchReports(activeTab, state.page + 1);
        }
      }
    });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [activeTab, fetchReports, tabStates, isOpen]);

  if (!isOpen) return null;

  const currentTabState = tabStates[activeTab];

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h3 className="text-xl font-bold text-gray-800">Abuse Reports</h3>
          <button
            onClick={onClose}
            className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
          >
            <GoX size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 shrink-0">
          {(['Pending', 'Resolved', 'Rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-4 font-black uppercase tracking-widest text-[10px] cursor-pointer transition-all ${
                activeTab === tab
                  ? 'text-rose-500 border-b-2 border-rose-500 bg-rose-50/30'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Reports Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6">
          {currentTabState.reports.length > 0 ? (
            <div className="space-y-6">
              {currentTabState.reports.map((report) => (
                <div
                  key={report.id}
                  className="border border-gray-100 rounded-3xl p-6 bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-l-rose-500/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm border ${
                          report.channel === 'video' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'
                        }`}>
                          {report.channel} Interaction
                        </span>
                        <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-100 shadow-sm">
                          {report.type}
                        </span>
                      </div>
                      <h4 className="font-black text-gray-800 text-base">
                        Reported: <span className="text-rose-600">{report.reportedUser.name}</span>
                      </h4>
                    </div>
                    <DateAndTime 
                      date={report.date} 
                      label="Reported on" 
                      showTime={true} 
                      className="bg-gray-50 px-3 py-1 rounded-full border border-gray-100 h-fit"
                    />
                  </div>
                  
                  <div className="relative">
                    <p className="text-sm text-gray-600 leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-gray-100 italic shadow-inner">
                      "{report.description}"
                    </p>
                  </div>
                  
                  {report.status === 'Rejected' && report.rejectionReason && (
                    <div className="mt-4 p-5 rounded-2xl bg-rose-50/50 border border-rose-100/50">
                      <p className="text-[9px] font-black text-rose-400 uppercase tracking-[0.2em] mb-2">Moderator Feedback</p>
                      <p className="text-sm text-gray-700 font-medium leading-relaxed">
                        <span className="text-rose-600 font-bold mr-2">Rejection Reason:</span>
                        {report.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Intersection Observer Target */}
              <div ref={loadMoreRef} className="h-4 w-full" />
              
              {currentTabState.loading && (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          ) : currentTabState.loading ? (
            <div className="h-full w-full flex flex-col items-center justify-center p-12">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-rose-500/10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-rose-500 rounded-full animate-spin"></div>
                <div className="absolute inset-4 bg-rose-500/5 rounded-full animate-pulse"></div>
              </div>
              <p className="mt-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">Syncing History</p>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
              <div className="p-6 bg-gray-50 rounded-full">
                <GoX size={32} className="text-gray-300" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Clear Records</p>
                <p className="text-xs text-gray-400 mt-1">No {activeTab.toLowerCase()} reports found in history.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
