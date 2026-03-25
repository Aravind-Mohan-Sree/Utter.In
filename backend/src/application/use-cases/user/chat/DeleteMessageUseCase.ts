import { Message } from '~entities/Message';
import { IMessageRepository } from '~repository-interfaces/IMessageRepository';
import { IDeleteMessageUseCase } from '~use-case-interfaces/user/IChatUseCase';
import { NotFoundError } from '~errors/HttpError';
import { ICloudService } from '~service-interfaces/ICloudService';

export class DeleteMessageUseCase implements IDeleteMessageUseCase {
  constructor(
    private _messageRepository: IMessageRepository,
    private _cloudService: ICloudService,
  ) {}

  async execute(messageId: string, userId: string, forEveryone: boolean): Promise<Message> {
    const message = await this._messageRepository.findOneById(messageId);

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
    const createdAt = message.createdAt ? new Date(message.createdAt).getTime() : Date.now();
    const isWithinTwoDays = Date.now() - createdAt < TWO_DAYS;
    const isSender = String(message.senderId) === String(userId);

    if (forEveryone && isSender && isWithinTwoDays) {
      if (message.fileUrl) {
        await this._cloudService.delete(message.fileUrl).catch(() => {});
      }

      const updatedMessage = await this._messageRepository.updateOneById(
        messageId,
        {
          text: 'This message was deleted',
          isDeleted: true,
          fileUrl: undefined,
          fileType: undefined,
          fileName: undefined,
        },
      );
      return updatedMessage!;
    } else {
      const hiddenBy = message.hiddenBy || [];
      if (!hiddenBy.includes(userId)) {
        hiddenBy.push(userId);
      }
      const updatedMessage = await this._messageRepository.updateOneById(
        messageId,
        {
          hiddenBy,
        },
      );
      return updatedMessage!;
    }
  }
}
