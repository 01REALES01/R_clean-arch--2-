import { Injectable, Inject } from '@nestjs/common';
import { NotificationRepository } from '../../../domain/repositories/notification.repository';
import { NotificationStatus } from '../../../domain/entities/notification.entity';
import { NOTIFICATION_REPOSITORY } from '../../tokens/repository.tokens';

@Injectable()
export class GetUnreadCountUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(userId: string): Promise<number> {
    const unreadNotifications = await this.notificationRepository.findAll({
      userId,
      status: NotificationStatus.PENDING,
    });

    return unreadNotifications.length;
  }
}

