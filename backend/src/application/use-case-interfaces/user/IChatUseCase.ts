import { Conversation } from '~entities/Conversation';
import { Message } from '~entities/Message';
import { User } from '~entities/User';

export interface IGetConversationsUseCase {
  execute(userId: string): Promise<Conversation[]>;
}

export interface IGetMessagesUseCase {
  execute(
    conversationId: string,
    userId: string,
    options?: { page?: number; limit?: number; targetId?: string },
  ): Promise<{ messages: Message[]; page: number }>;
}

export interface ISendMessageUseCase {
  execute(
    senderId: string,
    receiverId: string,
    text: string,
  ): Promise<Message>;
}

export interface ISearchChatUseCase {
  execute(
    userId: string,
    params: {
      q: string;
      page?: number;
      limit?: number;
      sort?: string;
      language?: string;
    },
  ): Promise<{
    users: User[];
    messages: Message[];
    totalUsersCount: number;
    filteredUsersCount: number;
  }>;
}

export interface IEditMessageUseCase {
  execute(messageId: string, userId: string, text: string): Promise<Message>;
}

export interface IDeleteMessageUseCase {
  execute(messageId: string, userId: string): Promise<Message>;
}
