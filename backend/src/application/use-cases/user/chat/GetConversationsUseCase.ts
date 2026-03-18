import { Conversation } from '~entities/Conversation';
import { IConversationRepository } from '~repository-interfaces/IConversationRepository';
import { IGetConversationsUseCase } from '~use-case-interfaces/user/IChatUseCase';

export class GetConversationsUseCase implements IGetConversationsUseCase {
  constructor(private _conversationRepository: IConversationRepository) {}

  async execute(userId: string): Promise<Conversation[]> {
    return this._conversationRepository.findUserConversations(userId);
  }
}
