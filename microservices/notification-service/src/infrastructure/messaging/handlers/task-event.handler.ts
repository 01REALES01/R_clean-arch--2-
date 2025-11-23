import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq.service';
import { TaskCreatedEvent, TaskUpdatedEvent, TaskDeletedEvent } from '../../../domain/events/task.events';
import { NotificationRepository } from '../../../domain/repositories/notification.repository';
import { Notification, NotificationType, NotificationStatus } from '../../../domain/entities/notification.entity';
import { NOTIFICATION_REPOSITORY } from '../../../application/tokens/repository.tokens';
import { EmailService } from '../../email/email.service';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TaskEventHandler implements OnModuleInit {
  constructor(
    private readonly rabbitMQService: RabbitMQService,
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    // Start consuming task events
    await this.consumeTaskEvents();
  }

  private async consumeTaskEvents(): Promise<void> {
    // Listen to tasks queue
    await this.rabbitMQService.consume('tasks_queue', async (message) => {
      const { pattern, data } = message;

      switch (pattern) {
        case 'task.created':
          await this.handleTaskCreated(data);
          break;
        case 'task.updated':
          await this.handleTaskUpdated(data);
          break;
        case 'task.deleted':
          await this.handleTaskDeleted(data);
          break;
        default:
          console.log(`Unknown pattern: ${pattern}`);
      }
    });
  }

  private async handleTaskCreated(event: TaskCreatedEvent): Promise<void> {
    console.log('📬 Handling task.created event:', event);

    // Create notification for task creation
    const notification = Notification.create({
      userId: event.userId,
      type: NotificationType.TASK_CREATED,
      title: `Task Created: ${event.title}`,
      message: `Your task has been created successfully.`,
      status: NotificationStatus.PENDING,
      metadata: {
        taskId: event.taskId,
        dueDate: event.dueDate,
      },
    });

    await this.notificationRepository.create(notification);
    console.log('✅ Notification created for task.created');

    // Send email notification
    await this.sendEmailForNotification(event.userId, notification);
  }

  private async handleTaskUpdated(event: TaskUpdatedEvent): Promise<void> {
    console.log('📬 Handling task.updated event:', event);

    // Create notification for task update
    const notification = Notification.create({
      userId: event.userId,
      type: NotificationType.TASK_UPDATED,
      title: `Task Updated: ${event.title}`,
      message: `Your task has been updated. New status: ${event.status}`,
      status: NotificationStatus.PENDING,
      metadata: {
        taskId: event.taskId,
        status: event.status,
        dueDate: event.dueDate,
      },
    });

    await this.notificationRepository.create(notification);
    console.log('✅ Notification created for task.updated');

    // Send email notification
    await this.sendEmailForNotification(event.userId, notification);
  }

  private async handleTaskDeleted(event: TaskDeletedEvent): Promise<void> {
    console.log('📬 Handling task.deleted event:', event);

    // Create notification for task deletion
    const notification = Notification.create({
      userId: event.userId,
      type: NotificationType.TASK_DELETED,
      title: `Task Deleted: ${event.title}`,
      message: `Your task has been deleted.`,
      status: NotificationStatus.PENDING,
      metadata: {
        taskId: event.taskId,
        deletedAt: event.deletedAt,
      },
    });

    await this.notificationRepository.create(notification);
    console.log('✅ Notification created for task.deleted');

    // Send email notification
    await this.sendEmailForNotification(event.userId, notification);
  }

  private async sendEmailForNotification(userId: string, notification: Notification): Promise<void> {
    try {
      // Get user email from database
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (!user) {
        console.log('⚠️  User not found, skipping email');
        return;
      }

      // Send email
      await this.emailService.sendTaskNotification({
        userEmail: user.email,
        title: notification.title,
        message: notification.message,
        taskDetails: notification.metadata,
      });
    } catch (error) {
      console.error('❌ Failed to send email notification:', error.message);
      // Don't throw - we don't want to fail the notification creation if email fails
    }
  }
}
