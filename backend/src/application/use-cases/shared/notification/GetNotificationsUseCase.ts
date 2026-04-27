import { Notification } from '~entities/Notification';
import { INotificationRepository } from '~repository-interfaces/INotificationRepository';
import { IGetNotificationsUseCase } from '~use-case-interfaces/shared/INotificationUseCase';

/**
 * Use case to retrieve notifications for a user or tutor.
 * Supports filtering by read/unread status and pagination.
 */
export class GetNotificationsUseCase implements IGetNotificationsUseCase {
  constructor(private _notificationRepository: INotificationRepository) { }

  /**
   * Fetches paginated notifications for the specified user.
   * @param userId The ID of the notification recipient.
   * @param filter Whether to fetch 'all' notifications or only 'unread' ones.
   * @param page Current page number.
   * @param limit Notifications per page.
   * @returns Array of notification entities.
   */
  async execute(
    userId: string,
    filter: 'all' | 'unread',
    page: number,
    limit: number,
  ): Promise<Notification[]> {
    const skip = (page - 1) * limit;
    const query: { recipientId: string; isRead?: boolean } = { recipientId: userId };

    if (filter === 'unread') {
      query.isRead = false;
    }

    // Retrieve notifications from the repository with pagination options
    const notifications = await this._notificationRepository.findAllByField(query, {
      skip,
      limit,
    });

    return notifications || [];
  }
}
