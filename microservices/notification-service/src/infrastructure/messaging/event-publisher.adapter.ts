import { Injectable } from '@nestjs/common';
import { EventPublisher } from '../../application/ports/event-publisher.port';
import { RabbitMQService } from './rabbitmq.service';

@Injectable()
export class EventPublisherAdapter implements EventPublisher {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async publish(pattern: string, data: any): Promise<void> {
    const queue = this.getQueueFromPattern(pattern);
    await this.rabbitMQService.publish(queue, {
      pattern,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  private getQueueFromPattern(pattern: string): string {
    // Map patterns to queues
    if (pattern.startsWith('task.')) {
      return 'tasks_queue';
    }
    if (pattern.startsWith('notification.')) {
      return 'notifications_queue';
    }
    if (pattern.startsWith('user.')) {
      return 'users_queue';
    }
    return 'default_queue';
  }
}
