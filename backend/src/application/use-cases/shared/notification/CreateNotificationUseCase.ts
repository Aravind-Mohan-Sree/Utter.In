import { ICreateNotificationUseCase } from '~use-case-interfaces/shared/INotificationUseCase';
import { INotificationRepository } from '~repository-interfaces/INotificationRepository';
import { Notification } from '~entities/Notification';
import { ISocketManager } from '~service-interfaces/ISocketManager';

/**
 * Use case to create and dispatch notifications.
 * Persists the notification and emits a real-time event via Socket.IO if the user is online.
 */
export class CreateNotificationUseCase implements ICreateNotificationUseCase {
  constructor(
    private _notificationRepository: INotificationRepository,
    private _socketManager: ISocketManager,
  ) { }

  /**
   * Creates a notification and sends it via sockets if available.
   * @param data Object containing recipient, message, and type.
   * @returns The created notification entity.
   */
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
      false, // default to unread
    );
    
    // Save to database
    const savedNotification = await this._notificationRepository.create(notification);

    // Attempt real-time delivery if recipient is online
    const socketId = this._socketManager.getSocketId(data.recipientId);
    if (socketId) {
      this._socketManager.getIO().to(socketId).emit('new_notification', savedNotification);
    }

    return savedNotification;
  }
}
