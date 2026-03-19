import { INotificationRepository } from '~repository-interfaces/INotificationRepository';
import { IMarkAllNotificationsReadUseCase } from '~use-case-interfaces/shared/INotificationUseCase';

export class MarkAllNotificationsReadUseCase
  implements IMarkAllNotificationsReadUseCase {
  constructor(private _notificationRepository: INotificationRepository) { }

  async execute(userId: string): Promise<boolean> {
    const result = await this._notificationRepository.updateAllByField(
      { recipientId: userId, isRead: false },
      { isRead: true },
    );
    return !!result;
  }
}
