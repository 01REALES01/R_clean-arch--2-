import { Injectable, Inject } from '@nestjs/common';
import { NotificationRepository } from '../../../domain/repositories/notification.repository';
import { Notification, NotificationStatus } from '../../../domain/entities/notification.entity';
import { NOTIFICATION_REPOSITORY } from '../../tokens/repository.tokens';

@Injectable()
export class GetNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(
    userId: string,
    status?: NotificationStatus,
  ): Promise<Notification[]> {
    if (status) {
      return this.notificationRepository.findAll({ userId, status });
    }
    return this.notificationRepository.findByUserId(userId);
  }
}

