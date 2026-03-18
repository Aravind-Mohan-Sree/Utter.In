import { Message } from '~entities/Message';
import { IMessageRepository } from '~repository-interfaces/IMessageRepository';
import { IConversationRepository } from '~repository-interfaces/IConversationRepository';
import { ISendMessageUseCase } from '~use-case-interfaces/user/IChatUseCase';
import { Conversation } from '~entities/Conversation';

export class SendMessageUseCase implements ISendMessageUseCase {
  constructor(
    private _messageRepository: IMessageRepository,
    private _conversationRepository: IConversationRepository,
  ) {}

  async execute(
    senderId: string,
    receiverId: string,
    text: string,
  ): Promise<Message> {
    let conversation = await this._conversationRepository.findByParticipants([
      senderId,
      receiverId,
    ]);

    if (!conversation) {
      conversation = await this._conversationRepository.create(
        new Conversation([senderId, receiverId].sort()),
      );
    }

    const message = await this._messageRepository.create(
      new Message(senderId, receiverId, text, conversation.id!),
    );
    const unreadCount = conversation.unreadCount || {};
    unreadCount[receiverId] = (unreadCount[receiverId] || 0) + 1;

    await this._conversationRepository.updateOneById(conversation.id!, {
      lastMessage: message.id,
      unreadCount,
    });

    return message;
  }
}
