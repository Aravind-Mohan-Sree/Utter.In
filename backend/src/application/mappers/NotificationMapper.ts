import { Notification } from '~entities/Notification';

export class NotificationMapper {
  static toResponseDTO(notification: Notification) {
    return {
      id: notification.id,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    };
  }
}
