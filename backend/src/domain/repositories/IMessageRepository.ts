import { Message } from '~entities/Message';
import { IBaseRepository } from './IBaseRepository';
import { IMessage } from '~models/MessageModel';

export interface IMessageRepository
  extends IBaseRepository<Message, IMessage> {
  findByConversationId(
    conversationId: string,
    options?: { limit?: number; skip?: number },
  ): Promise<Message[]>;
  markAsRead(conversationId: string, receiverId: string): Promise<void>;
  searchMessages(userId: string, query: string): Promise<Message[]>;
}
