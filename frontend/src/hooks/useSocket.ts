import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (userId: string | undefined) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_BASE_URL, {
      query: { userId },
    });

    setTimeout(() => {
      setSocket(socketInstance);
    }, 0);

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('user_status_change', (data: { userId: string; status: 'online' | 'offline' }) => {
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

    return () => {
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [userId]);

  return { socket, isConnected, onlineUsers };
};
