import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { logger } from '~logger/logger';
import { ISocketManager } from '~service-interfaces/ISocketManager';

export class SocketManager implements ISocketManager {
  private static _instance: SocketManager;
  private _io: Server | null = null;
  private _userSocketMap = new Map<string, string>();
  private _socketUserMap = new Map<string, string>();

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): SocketManager {
    if (!SocketManager._instance) {
      SocketManager._instance = new SocketManager();
    }
    return SocketManager._instance;
  }

  public init(server: HttpServer, frontendUrl: string): Server {
    this._io = new Server(server, {
      cors: {
        origin: frontendUrl,
        credentials: true,
      },
      transports: ['websocket'],
    });

    this._io.on('connection', (socket: Socket) => {
      const userId = socket.handshake.query.userId as string;

      if (userId) {
        this._userSocketMap.set(userId, socket.id);
        this._socketUserMap.set(socket.id, userId);
        logger.info(`User connected: ${userId} (${socket.id})`);

        socket.broadcast.emit('user_status_change', { userId, status: 'online' });

        socket.emit('online_users', Array.from(this._userSocketMap.keys()));
      }

      socket.on('disconnect', () => {
        const userId = this._socketUserMap.get(socket.id);
        if (userId) {
          if (this._userSocketMap.get(userId) === socket.id) {
            this._userSocketMap.delete(userId);
          }
          this._socketUserMap.delete(socket.id);
          logger.info(`User disconnected: ${userId} (${socket.id})`);

          socket.broadcast.emit('user_status_change', { userId, status: 'offline' });
        }
      });
      
      socket.on('send_message', (data: { receiverId: string; message: Record<string, unknown> }) => {
        const receiverSocketId = this._userSocketMap.get(data.receiverId);
        if (receiverSocketId) {
          this._io?.to(receiverSocketId).emit('receive_message', data.message);
        }
      });

      socket.on('edit_message', (data: { receiverId: string; message: Record<string, unknown> }) => {
        const receiverSocketId = this._userSocketMap.get(data.receiverId);
        if (receiverSocketId) {
          this._io?.to(receiverSocketId).emit('message_edited', data.message);
        }
      });

      socket.on('delete_message', (data: { receiverId: string; message: Record<string, unknown> }) => {
        const receiverSocketId = this._userSocketMap.get(data.receiverId);
        if (receiverSocketId) {
          this._io?.to(receiverSocketId).emit('message_deleted', data.message);
        }
      });

      socket.on('initiate_call', (data: { receiverId: string; callerId: string; callerName: string; signalData: Record<string, unknown> }) => {
        logger.info(`Initiating call from ${data.callerId} to ${data.receiverId}`);
        const receiverSocketId = this._userSocketMap.get(data.receiverId);
        if (receiverSocketId) {
          this._io?.to(receiverSocketId).emit('incoming_call', {
            callerId: data.callerId,
            callerName: data.callerName,
            signalData: data.signalData,
          });
        }
      });

      socket.on('answer_call', (data: { callerId: string; signalData: Record<string, unknown> }) => {
        const callerSocketId = this._userSocketMap.get(data.callerId);
        if (callerSocketId) {
          this._io?.to(callerSocketId).emit('call_answered', {
            signalData: data.signalData,
          });
        }
      });
      
      socket.on('end_call', (data: { otherPartyId: string }) => {
        logger.info(`Ending call: targeting ${data.otherPartyId}`);
        const otherSocketId = this._userSocketMap.get(data.otherPartyId);
        if (otherSocketId) {
          logger.info(`Found socket ${otherSocketId} for user ${data.otherPartyId}, emitting call_ended`);
          this._io?.to(otherSocketId).emit('call_ended');
        } else {
          logger.warn(`Could not find socket for user ${data.otherPartyId} in map`);
        }
      });

      socket.on('session_completed', (data: { otherPartyId: string }) => {
        const otherSocketId = this._userSocketMap.get(data.otherPartyId);
        if (otherSocketId) {
          this._io?.to(otherSocketId).emit('session_completed');
        }
      });
    });

    return this._io;
  }

  public getIO(): Server {
    if (!this._io) {
      throw new Error('Socket.io not initialized');
    }
    return this._io;
  }

  public getSocketId(userId: string): string | undefined {
    return this._userSocketMap.get(userId);
  }

  public isUserOnline(userId: string): boolean {
    return this._userSocketMap.has(userId);
  }
}
