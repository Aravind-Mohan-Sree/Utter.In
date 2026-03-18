import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

export interface ISocketManager {
  init(server: HttpServer, frontendUrl: string): Server;
  getIO(): Server;
  getSocketId(userId: string): string | undefined;
  isUserOnline(userId: string): boolean;
}
