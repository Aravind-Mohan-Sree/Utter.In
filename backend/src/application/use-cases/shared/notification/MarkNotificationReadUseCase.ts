import { INotificationRepository } from '~repository-interfaces/INotificationRepository';
import { IMarkNotificationReadUseCase } from '~use-case-interfaces/shared/INotificationUseCase';

export class MarkNotificationReadUseCase implements IMarkNotificationReadUseCase {
  constructor(private _notificationRepository: INotificationRepository) { }

  async execute(notificationId: string): Promise<boolean> {
    const updated = await this._notificationRepository.updateOneById(notificationId, {
      isRead: true,
    });
    return !!updated;
  }
}
