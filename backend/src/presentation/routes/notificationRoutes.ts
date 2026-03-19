import { Router, Request, Response } from 'express';
import { NotificationController } from '~controllers/shared/NotificationController';
import { GetNotificationsUseCase } from '~use-cases/shared/notification/GetNotificationsUseCase';
import { MarkNotificationReadUseCase } from '~use-cases/shared/notification/MarkNotificationReadUseCase';
import { MarkAllNotificationsReadUseCase } from '~use-cases/shared/notification/MarkAllNotificationsReadUseCase';
import { GetNotificationCountUseCase } from '~use-cases/shared/notification/GetNotificationCountUseCase';
import { NotificationRepository } from '~concrete-repositories/NotificationRepository';
import { AuthMiddlewareBundler } from '~middlewares/AuthMiddlewareBundler';

export const getNotificationRouter = (auth: AuthMiddlewareBundler) => {
  const notificationRouter = Router();
  const notificationRepository = new NotificationRepository();
  const getNotificationsUseCase = new GetNotificationsUseCase(notificationRepository);
  const markNotificationReadUseCase = new MarkNotificationReadUseCase(notificationRepository);
  const markAllNotificationsReadUseCase = new MarkAllNotificationsReadUseCase(notificationRepository);
  const getNotificationCountUseCase = new GetNotificationCountUseCase(notificationRepository);

  const controller = new NotificationController(
    getNotificationsUseCase,
    markNotificationReadUseCase,
    markAllNotificationsReadUseCase,
    getNotificationCountUseCase,
  );

  notificationRouter.get('/', auth.verify(), (req: Request, res: Response) => controller.getNotifications(req, res));
  notificationRouter.get('/unread-count', auth.verify(), (req: Request, res: Response) => controller.getUnreadCount(req, res));
  notificationRouter.patch('/:id/read', auth.verify(), (req: Request, res: Response) => controller.markAsRead(req, res));
  notificationRouter.patch('/read-all', auth.verify(), (req: Request, res: Response) => controller.markAllAsRead(req, res));

  return notificationRouter;
};
