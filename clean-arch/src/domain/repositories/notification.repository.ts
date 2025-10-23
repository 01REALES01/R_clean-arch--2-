import { Notification, NotificationStatus } from '../entities/notification.entity';

export interface NotificationFilters {
  userId?: string;
  status?: NotificationStatus;
  fromDate?: Date;
  toDate?: Date;
}

export interface NotificationRepository {
  create(notification: Notification): Promise<Notification>;
  findById(id: string): Promise<Notification | null>;
  findAll(filters?: NotificationFilters): Promise<Notification[]>;
  findByUserId(userId: string): Promise<Notification[]>;
  update(notification: Notification): Promise<Notification>;
  delete(id: string): Promise<void>;
}
