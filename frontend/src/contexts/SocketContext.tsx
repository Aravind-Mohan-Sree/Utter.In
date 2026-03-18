import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { incrementUnreadCount } from '~features/chatSlice';
import { RootState } from '~store/rootReducer';

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: Set<string>;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: new Set(),
  isConnected: false,
});

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const socketRef = useRef<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api';
    const socketUrl = baseUrl.replace(/\/api\/?$/, '');

    const socket = io(socketUrl, {
      query: { userId: String(user.id) },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('online_users', (userIds: string[]) => {
      setOnlineUsers(new Set(userIds));
    });

    socket.on('user_status_change', (data: { userId: string; status: 'online' | 'offline' }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (data.status === 'online') {
          next.add(data.userId);
        } else {
          next.delete(data.userId);
        }
        return next;
      });
    });

    socket.on('receive_message', () => {
      dispatch(incrementUnreadCount());
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id, dispatch]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, onlineUsers, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
