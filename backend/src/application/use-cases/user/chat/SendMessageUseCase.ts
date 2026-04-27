import { Message } from '~entities/Message';
import { IMessageRepository } from '~repository-interfaces/IMessageRepository';
import { IConversationRepository } from '~repository-interfaces/IConversationRepository';
import { ISendMessageUseCase } from '~use-case-interfaces/user/IChatUseCase';
import { Conversation } from '~entities/Conversation';
import { ICreateNotificationUseCase } from '~use-case-interfaces/shared/INotificationUseCase';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';

/**
 * Use case to handle sending a chat message.
 * Manages conversation creation, message persistence, unread counts, and notifications.
 */
export class SendMessageUseCase implements ISendMessageUseCase {
  constructor(
    private _messageRepository: IMessageRepository,
    private _conversationRepository: IConversationRepository,
    private _userRepository: IUserRepository,
    private _tutorRepository: ITutorRepository,
    private _createNotificationUseCase: ICreateNotificationUseCase,
  ) { }

  /**
   * Sends a message from one user to another.
   * @param senderId The sender's ID.
   * @param receiverId The receiver's ID.
   * @param text The message text (optional if file is present).
   * @param fileUrl URL of any attached file.
   * @param fileType MIME type of the attached file.
   * @param fileName Original name of the attached file.
   * @returns The created message entity.
   */
  async execute(
    senderId: string,
    receiverId: string,
    text = '',
    fileUrl?: string,
    fileType?: string,
    fileName?: string,
  ): Promise<Message> {
    // Check for an existing conversation or create a new one
    let conversation = await this._conversationRepository.findByParticipants([
      senderId,
      receiverId,
    ]);

    if (!conversation) {
      conversation = await this._conversationRepository.create(
        new Conversation([senderId, receiverId].sort()),
      );
    }

    // Persist the new message
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

    // Update unread count for the receiver and set last message reference
    const unreadCount = conversation.unreadCount || {};
    unreadCount[receiverId] = (unreadCount[receiverId] || 0) + 1;

    await this._conversationRepository.updateOneById(conversation.id!, {
      lastMessage: message.id,
      unreadCount,
    });

    // Identify the sender to personalize the notification
    const [senderUser, senderTutor, receiverUser] = await Promise.all([
      this._userRepository.findOneById(senderId),
      this._tutorRepository.findOneById(senderId),
      this._userRepository.findOneById(receiverId),
    ]);

    const senderName = senderUser?.name || senderTutor?.name || 'Someone';
    const recipientRole = receiverUser ? 'user' : 'tutor';

    // Trigger a notification for the recipient
    await this._createNotificationUseCase.execute({
      recipientId: receiverId,
      recipientRole,
      message: `New message from ${senderName}`,
      type: 'message',
    });

    return message;
  }
}
