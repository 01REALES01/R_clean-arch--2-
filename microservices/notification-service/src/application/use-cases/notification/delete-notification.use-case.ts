import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { NotificationRepository } from '../../../domain/repositories/notification.repository';
import { NOTIFICATION_REPOSITORY } from '../../tokens/repository.tokens';

@Injectable()
export class DeleteNotificationUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findById(notificationId);

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    // Verify the notification belongs to the user
    if (notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepository.delete(notificationId);
  }
}

