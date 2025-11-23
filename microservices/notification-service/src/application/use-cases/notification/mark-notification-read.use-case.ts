import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { NotificationRepository } from '../../../domain/repositories/notification.repository';
import { Notification, NotificationStatus } from '../../../domain/entities/notification.entity';
import { NOTIFICATION_REPOSITORY } from '../../tokens/repository.tokens';

@Injectable()
export class MarkNotificationReadUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findById(notificationId);

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    // Verify the notification belongs to the user
    if (notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    // Mark as read
    notification.markAsRead();

    return this.notificationRepository.update(notification);
  }
}

