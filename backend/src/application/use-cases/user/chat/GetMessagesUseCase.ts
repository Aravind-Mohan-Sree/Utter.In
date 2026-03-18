import { Message } from '~entities/Message';
import { IMessageRepository } from '~repository-interfaces/IMessageRepository';
import { IConversationRepository } from '~repository-interfaces/IConversationRepository';
import { IGetMessagesUseCase } from '~use-case-interfaces/user/IChatUseCase';
import mongoose from 'mongoose';

export class GetMessagesUseCase implements IGetMessagesUseCase {
  constructor(
    private _messageRepository: IMessageRepository,
    private _conversationRepository: IConversationRepository,
  ) {}

  async execute(
    conversationId: string,
    userId: string,
    options?: { page?: number; limit?: number; targetId?: string },
  ): Promise<{ messages: Message[]; page: number }> {
    const limit = options?.limit || 30;
    let page = options?.page || 1;

    if (options?.targetId) {
      const targetMsg = await this._messageRepository.findOneById(options.targetId);
      if (targetMsg && targetMsg.createdAt) {
        const countNewer = await this._messageRepository.countRecords({
          conversationId: new mongoose.Types.ObjectId(conversationId),
          createdAt: { $gt: targetMsg.createdAt },
        });
        page = Math.floor(countNewer / limit) + 1;
      }
    }

    const skip = (page - 1) * limit;

    const messages = await this._messageRepository.findByConversationId(
      conversationId,
      { limit, skip },
    );

    if (page === 1) {
      await this._messageRepository.markAsRead(conversationId, userId);
      await this._conversationRepository.resetUnreadCount(conversationId, userId);
    }

    return { messages, page };
  }
}
