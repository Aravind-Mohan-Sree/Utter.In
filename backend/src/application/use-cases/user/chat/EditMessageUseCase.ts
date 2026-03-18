import { Message } from '~entities/Message';
import { IMessageRepository } from '~repository-interfaces/IMessageRepository';
import { IEditMessageUseCase } from '~use-case-interfaces/user/IChatUseCase';
import { UnauthorizedError, NotFoundError, BadRequestError } from '~errors/HttpError';

export class EditMessageUseCase implements IEditMessageUseCase {
  constructor(private _messageRepository: IMessageRepository) {}

  async execute(
    messageId: string,
    userId: string,
    text: string,
  ): Promise<Message> {
    const message = await this._messageRepository.findOneById(messageId);

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    if (String(message.senderId) !== String(userId)) {
      throw new UnauthorizedError('You can only edit your own messages');
    }

    if (message.isDeleted) {
      throw new Error('Cannot edit a deleted message');
    }

    const FIFTEEN_MINUTES = 15 * 60 * 1000;
    const createdAt = message.createdAt ? new Date(message.createdAt).getTime() : Date.now();
    if (Date.now() - createdAt > FIFTEEN_MINUTES) {
      throw new BadRequestError('Edit period has expired (15 minutes limit)');
    }

    const updatedMessage = await this._messageRepository.updateOneById(
      messageId,
      {
        text,
        isEdited: true,
      },
    );

    return updatedMessage!;
  }
}
