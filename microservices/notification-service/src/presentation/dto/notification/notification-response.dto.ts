import { ApiProperty } from '@nestjs/swagger';
import { NotificationType, NotificationStatus } from '../../../domain/entities/notification.entity';

export class NotificationResponseDto {
  @ApiProperty({ example: 'uuid-1234' })
  id: string;

  @ApiProperty({ example: 'uuid-user' })
  userId: string;

  @ApiProperty({ enum: NotificationType, example: NotificationType.TASK_CREATED })
  type: NotificationType;

  @ApiProperty({ example: 'New Task Created' })
  title: string;

  @ApiProperty({ example: 'Your task "Complete setup" has been created successfully.' })
  message: string;

  @ApiProperty({ enum: NotificationStatus, example: NotificationStatus.PENDING })
  status: NotificationStatus;

  @ApiProperty({ example: { taskId: 'uuid-task', dueDate: '2025-10-30' } })
  metadata: Record<string, any>;

  @ApiProperty({ example: '2025-10-25T12:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: null, nullable: true })
  sentAt: Date | null;
}

