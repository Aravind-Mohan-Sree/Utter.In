import { Message } from '~entities/Message';
import { IMessageRepository } from '~repository-interfaces/IMessageRepository';
import { IConversationRepository } from '~repository-interfaces/IConversationRepository';
import { ISendMessageUseCase } from '~use-case-interfaces/user/IChatUseCase';
import { Conversation } from '~entities/Conversation';
import { ICreateNotificationUseCase } from '~use-case-interfaces/shared/INotificationUseCase';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';

export class SendMessageUseCase implements ISendMessageUseCase {
  constructor(
    private _messageRepository: IMessageRepository,
    private _conversationRepository: IConversationRepository,
    private _userRepository: IUserRepository,
    private _tutorRepository: ITutorRepository,
    private _createNotificationUseCase: ICreateNotificationUseCase,
  ) { }

  async execute(
    senderId: string,
    receiverId: string,
    text = '',
    fileUrl?: string,
    fileType?: string,
    fileName?: string,
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
      new Message(
        senderId,
        receiverId,
        text,
        conversation.id!,
        false,
        false,
        false,
        [],
        fileUrl,
        fileType,
        fileName,
      ),
    );
    const unreadCount = conversation.unreadCount || {};
    unreadCount[receiverId] = (unreadCount[receiverId] || 0) + 1;

    await this._conversationRepository.updateOneById(conversation.id!, {
      lastMessage: message.id,
      unreadCount,
    });

    const [senderUser, senderTutor, receiverUser] = await Promise.all([
      this._userRepository.findOneById(senderId),
      this._tutorRepository.findOneById(senderId),
      this._userRepository.findOneById(receiverId),
    ]);

    const senderName = senderUser?.name || senderTutor?.name || 'Someone';
    const recipientRole = receiverUser ? 'user' : 'tutor';

    await this._createNotificationUseCase.execute({
      recipientId: receiverId,
      recipientRole,
      message: `New message from ${senderName}`,
      type: 'message',
    });

    return message;
  }
}
