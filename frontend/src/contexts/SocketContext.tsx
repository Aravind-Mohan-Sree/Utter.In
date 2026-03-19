import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';

import { incrementUnreadCount as incrementChatCount } from '~features/chatSlice';
import { incrementUnreadCount as incrementNotificationCount, prependNotification } from '~features/notificationSlice';
import { RootState } from '~store/rootReducer';

interface IncomingCall {
  callerId: string;
  callerName: string;
  signalData: {
    bookingId: string;
    type: 'chat' | 'session';
    otherId?: string;
  };
}

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: Set<string>;
  isConnected: boolean;
  incomingCall: IncomingCall | null;
  setIncomingCall: (call: IncomingCall | null) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: new Set(),
  isConnected: false,
  incomingCall: null,
  setIncomingCall: () => { },
});

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api';
    const socketUrl = baseUrl.replace(/\/api\/?$/, '');

    const newSocket = io(socketUrl, {
      query: { userId: String(user.id) },
      transports: ['websocket'],
    });

    setTimeout(() => {
      setSocket(newSocket);
    }, 0);

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('online_users', (userIds: string[]) => {
      setOnlineUsers(new Set(userIds));
    });

    newSocket.on('user_status_change', (data: { userId: string; status: 'online' | 'offline' }) => {
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

    newSocket.on('receive_message', () => {
      dispatch(incrementChatCount());
    });

    newSocket.on('new_notification', (notification) => {
      dispatch(incrementNotificationCount());
      dispatch(prependNotification(notification));
    });

    newSocket.on('incoming_call', (data: IncomingCall) => {
      setIncomingCall(data);
    });

    newSocket.on('call_ended', () => {
      setIncomingCall(null);
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIncomingCall(null);
    };
  }, [user?.id, dispatch]);

  return (
    <SocketContext.Provider value={{
      socket,
      onlineUsers,
      isConnected,
      incomingCall,
      setIncomingCall
    }}>
      {children}
    </SocketContext.Provider>
  );
};
