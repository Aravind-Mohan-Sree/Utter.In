import { useRef } from 'react';
import { LuCalendar, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { Card } from '~components/admin/Card';
import { utterToast } from '~utils/utterToast';
import Loader from './Loader';

export interface Session {
    id: string;
    time: string;
    language: string;
    topic: string;
    booked: boolean;
    date: string;
    status: string;
    scheduledAt: string;
}

interface SessionListProps {
    sessions: Session[];
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    userType: 'tutor' | 'user'; // 'tutor' can cancel, 'user' can book (future)
    onAction?: (sessionId: string) => void;
    loading?: boolean;
    minDate?: string;
    maxDate?: string;
}

export default function SessionList({
    sessions,
    selectedDate,
    setSelectedDate,
    userType,
    onAction,
    loading = false,
    minDate,
    maxDate
}: SessionListProps) {
    const dateInputRef = useRef<HTMLInputElement>(null);

    const formatLocalDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const navigateDate = (direction: 'next' | 'prev') => {
        if (!selectedDate) return;

        const curr = new Date(selectedDate);
        if (direction === 'next') {
            curr.setDate(curr.getDate() + 1);
        } else {
            curr.setDate(curr.getDate() - 1);
        }

        const nextDateStr = formatLocalDate(curr.toISOString().split('T')[0]);

        if (minDate && nextDateStr < minDate) {
            utterToast.info('Cannot view past dates.');
            return;
        }

        if (maxDate && nextDateStr > maxDate) {
            utterToast.info('Cannot view beyond date limit.');
            return;
        }

        setSelectedDate(nextDateStr);
    };

    return (
        <div className="flex flex-col items-center w-full animate-fadeIn">
            {loading && <div className="absolute inset-0 z-50 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-xl"><Loader /></div>}

            <h2 className="text-xl font-bold text-gray-900 mb-6">
                {userType === 'tutor' ? 'Your Sessions' : 'Available Sessions'}
            </h2>

            <div className="flex items-center gap-4 mb-8 bg-white p-2 rounded-xl border border-gray-200 shadow-sm z-20">
                <button onClick={() => navigateDate('prev')} className="cursor-pointer p-2 text-gray-500 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                    <LuChevronLeft size={24} />
                </button>
                <div
                    className="flex items-center gap-2 text-lg font-semibold text-gray-700 min-w-[150px] justify-center cursor-pointer relative"
                    onClick={() => {
                        if (dateInputRef.current) {
                            try {
                                dateInputRef.current.showPicker();
                            } catch (error) {
                                console.log('showPicker not supported');
                            }
                        }
                    }}
                >
                    <LuCalendar size={20} className="text-rose-400" />
                    {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    <input
                        ref={dateInputRef}
                        type="date"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 pointer-events-none"
                        value={selectedDate}
                        min={minDate}
                        max={maxDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </div>
                <button onClick={() => navigateDate('next')} className="cursor-pointer p-2 text-gray-500 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                    <LuChevronRight size={24} />
                </button>
            </div>

            <div className="grid grid-cols-1 min-[520px]:grid-cols-2 md:grid-cols-3 gap-6 w-full relative">
                {sessions.map((session, index) => (
                    <Card
                        key={session.id}
                        id={session.id}
                        type="session"
                        title={userType === 'tutor' ? `Session ${index + 1}` : session.topic}
                        subtitle={userType === 'tutor' ? session.topic : session.time}
                        date={session.date}
                        time={session.time}
                        language={session.language}
                        status={session.booked ? 'Booked' : 'Available'}
                        onCancel={userType === 'tutor' ? onAction : undefined}
                    // Add booking action support later for 'user' type if needed
                    />
                ))}
                {sessions.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-white/30 rounded-2xl border border-gray-100 border-dashed">
                        No sessions found for this date.
                    </div>
                )}
            </div>
        </div>
    );
}
