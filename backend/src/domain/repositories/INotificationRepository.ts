import { Notification } from '../entities/Notification';
import { IBaseRepository } from './IBaseRepository';
import { INotification } from '~models/NotificationModel';

export interface INotificationRepository extends IBaseRepository<Notification, INotification> { }
