import { IGetNotificationCountUseCase } from '~use-case-interfaces/shared/INotificationUseCase';
import { INotificationRepository } from '~repository-interfaces/INotificationRepository';

export class GetNotificationCountUseCase implements IGetNotificationCountUseCase {
  constructor(private _notificationRepository: INotificationRepository) { }

  async execute(userId: string): Promise<number> {
    return this._notificationRepository.countRecords({ recipientId: userId, isRead: false });
  }
}
