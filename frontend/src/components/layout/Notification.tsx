'use client';

import { formatDistanceToNow } from 'date-fns';
import { useEffect, useRef,useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

import {
  addNotifications,
  incrementPage,
  markAllRead,
  markRead,
  resetNotifications,
  setHasMore,
  setUnreadCount,
} from '~features/notificationSlice';
import { getNotifications, markAllAsRead as apiMarkAllAsRead,markAsRead } from '~services/shared/notificationService';
import { RootState } from '~store/rootReducer';

interface NotificationProps {
  onClose: () => void;
}

export default function Notification({ onClose }: NotificationProps) {
  const dispatch = useDispatch();
  const { notifications, unreadCount, page, hasMore } = useSelector((state: RootState) => state.notification);
  const { user } = useSelector((state: RootState) => state.auth);
  const role = user?.role as 'user' | 'tutor';
  const [filter, setFilter] = useState<'all' | 'unread'>('unread');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async (isFirst = false) => {
    if (loading || (!hasMore && !isFirst)) return;
    setLoading(true);
    try {
      const currentPage = isFirst ? 1 : page;
      const res = await getNotifications(role, { filter, page: currentPage, limit: 10 });
      if (isFirst) {
        dispatch(resetNotifications());
        dispatch(addNotifications(res.data));
      } else {
        dispatch(addNotifications(res.data));
      }
      if (res.data.length < 10) {
        dispatch(setHasMore(false));
      } else {
        dispatch(setHasMore(true));
        dispatch(incrementPage());
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      fetchNotifications();
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markAsRead(role, id);
      dispatch(markRead(id));
      await getNotifications(role, { filter: 'unread', page: 1, limit: 1 });
    } catch {
      // Handle error
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiMarkAllAsRead(role);
      dispatch(markAllRead());
      dispatch(setUnreadCount(0));
    } catch {
      // Handle error
    }
  };

  return (
    <div className="fixed right-4 top-20 w-[calc(100vw-32px)] sm:w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 flex flex-col overflow-hidden max-h-[480px] animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            ✕
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${
              filter === 'all'
                ? 'bg-rose-500 text-white font-medium shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${
              filter === 'unread'
                ? 'bg-rose-500 text-white font-medium shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-200"
      >
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => !notification.isRead && handleMarkRead(notification.id)}
              className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group flex items-start gap-3 ${
                !notification.isRead ? 'bg-rose-50/30' : ''
              }`}
            >
              <div
                className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                  !notification.isRead ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-gray-200'
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <p className={`text-sm leading-relaxed ${!notification.isRead ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                    {notification.message}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                  {!notification.isRead && (
                    <span className="text-[10px] text-rose-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      Mark as read
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center">
            <p className="text-gray-400 text-sm">No notifications found</p>
          </div>
        )}
        {loading && (
          <div className="p-4 flex justify-center">
            <FaSpinner className="animate-spin text-rose-500" />
          </div>
        )}
      </div>

      {notifications.some(n => !n.isRead) && (
        <div className="p-3 border-t border-gray-100 bg-white">
          <button 
            onClick={handleMarkAllRead}
            className="w-full py-2 text-center text-xs text-rose-500 font-bold hover:bg-rose-50 rounded-lg transition-colors border border-rose-100"
          >
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
}
