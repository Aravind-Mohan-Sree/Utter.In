import { Notification } from '~entities/Notification';
import { INotificationRepository } from '~repository-interfaces/INotificationRepository';
import { IGetNotificationsUseCase } from '~use-case-interfaces/shared/INotificationUseCase';

export class GetNotificationsUseCase implements IGetNotificationsUseCase {
  constructor(private _notificationRepository: INotificationRepository) { }

  async execute(
    userId: string,
    filter: 'all' | 'unread',
    page: number,
    limit: number,
  ): Promise<Notification[]> {
    const skip = (page - 1) * limit;
    const query: any = { recipientId: userId };

    if (filter === 'unread') {
      query.isRead = false;
    }

    const notifications = await this._notificationRepository.findAllByField(query, {
      skip,
      limit,
    });

    return notifications || [];
  }
}
