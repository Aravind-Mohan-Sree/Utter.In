import { ICreateNotificationUseCase } from '~use-case-interfaces/shared/INotificationUseCase';
import { INotificationRepository } from '~repository-interfaces/INotificationRepository';
import { Notification } from '~entities/Notification';
import { ISocketManager } from '~service-interfaces/ISocketManager';

export class CreateNotificationUseCase implements ICreateNotificationUseCase {
  constructor(
    private _notificationRepository: INotificationRepository,
    private _socketManager: ISocketManager
  ) { }

  async execute(data: {
    recipientId: string;
    recipientRole: 'user' | 'tutor';
    message: string;
    type: 'booking' | 'cancellation' | 'message' | 'system';
  }): Promise<Notification> {
    const notification = new Notification(
      data.recipientId,
      data.recipientRole,
      data.message,
      data.type,
      false,
    );
    const savedNotification = await this._notificationRepository.create(notification);

    const socketId = this._socketManager.getSocketId(data.recipientId);
    if (socketId) {
      this._socketManager.getIO().to(socketId).emit('new_notification', savedNotification);
    }

    return savedNotification;
  }
}
