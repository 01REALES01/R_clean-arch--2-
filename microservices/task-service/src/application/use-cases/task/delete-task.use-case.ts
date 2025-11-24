import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { TaskRepository } from '../../../domain/repositories/task.repository';
import { EventPublisher, EVENT_PUBLISHER } from '../../ports/event-publisher.port';
import { TaskDeletedEvent } from '../../../domain/events/task.events';
import { TASK_REPOSITORY } from '../../tokens/repository.tokens';
import { RedisService } from '../../../infrastructure/cache/redis.service';

@Injectable()
export class DeleteTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
    @Inject(EVENT_PUBLISHER)
    private readonly eventPublisher: EventPublisher,
    private readonly redisService: RedisService,
  ) { }

  async execute(taskId: string, userId: string): Promise<void> {
    // Find the task
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user owns the task
    if (task.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this task');
    }

    // Delete the task
    await this.taskRepository.delete(taskId);

    // Invalidate cache
    await this.redisService.delPattern(`tasks:${userId}:*`);

    // Publish event
    const event: TaskDeletedEvent = {
      taskId: task.id,
      userId: task.userId,
      title: task.title,
      deletedAt: new Date(),
    };

    await this.eventPublisher.publish('task.deleted', event);
  }
}
