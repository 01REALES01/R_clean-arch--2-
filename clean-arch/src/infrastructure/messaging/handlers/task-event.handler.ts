import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq.service';
import { TaskCreatedEvent, TaskUpdatedEvent } from '../../../domain/events/task.events';
import { NotificationRepository } from '../../../domain/repositories/notification.repository';
import { Notification, NotificationType, NotificationStatus } from '../../../domain/entities/notification.entity';

@Injectable()
export class TaskEventHandler implements OnModuleInit {
  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly notificationRepository: NotificationRepository,
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
      title: 'New Task Created',
      message: `Your task "${event.title}" has been created successfully.`,
      status: NotificationStatus.PENDING,
      metadata: {
        taskId: event.taskId,
        dueDate: event.dueDate,
      },
    });

    await this.notificationRepository.create(notification);
    console.log('✅ Notification created for task.created');
  }

  private async handleTaskUpdated(event: TaskUpdatedEvent): Promise<void> {
    console.log('📬 Handling task.updated event:', event);

    // Create notification for task update
    const notification = Notification.create({
      userId: event.userId,
      type: NotificationType.TASK_UPDATED,
      title: 'Task Updated',
      message: `Your task "${event.title}" has been updated. Status: ${event.status}`,
      status: NotificationStatus.PENDING,
      metadata: {
        taskId: event.taskId,
        status: event.status,
        dueDate: event.dueDate,
      },
    });

    await this.notificationRepository.create(notification);
    console.log('✅ Notification created for task.updated');
  }
}
