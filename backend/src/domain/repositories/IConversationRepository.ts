import { Conversation } from '~entities/Conversation';
import { IBaseRepository } from './IBaseRepository';
import { IConversation } from '~models/ConversationModel';

export interface IConversationRepository
  extends IBaseRepository<Conversation, IConversation> {
  findByParticipants(participants: string[]): Promise<Conversation | null>;
  findUserConversations(userId: string): Promise<Conversation[]>;
  resetUnreadCount(conversationId: string, userId: string): Promise<void>;
}
