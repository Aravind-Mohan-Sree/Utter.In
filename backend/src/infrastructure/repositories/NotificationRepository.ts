import { Document, Types } from 'mongoose';
import { Notification } from '~entities/Notification';
import { INotification, NotificationModel } from '~models/NotificationModel';
import { INotificationRepository } from '~repository-interfaces/INotificationRepository';
import { BaseRepository } from './BaseRepository';

export class NotificationRepository
  extends BaseRepository<Notification, INotification>
  implements INotificationRepository {
  constructor() {
    super(NotificationModel);
  }

  protected toSchema(entity: Notification | Partial<Notification>): Partial<INotification> {
    return {
      recipientId: entity.recipientId ? new Types.ObjectId(entity.recipientId) : undefined,
      recipientRole: entity.recipientRole,
      message: entity.message,
      type: entity.type,
      isRead: entity.isRead,
    };
  }

  protected toEntity(doc: (INotification & Document) | null): Notification | null {
    if (!doc) return null;

    return new Notification(
      doc.recipientId.toString(),
      doc.recipientRole,
      doc.message,
      doc.type,
      doc.isRead,
      doc.createdAt,
      doc.updatedAt,
      doc._id.toString(),
    );
  }
}
