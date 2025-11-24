import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { TaskRepository } from '../../../domain/repositories/task.repository';
import { Task } from '../../../domain/entities/task.entity';
import { UpdateTaskDto } from '../../dto/task/update-task.dto';
import { EventPublisher, EVENT_PUBLISHER } from '../../ports/event-publisher.port';
import { TaskUpdatedEvent } from '../../../domain/events/task.events';
import { TASK_REPOSITORY } from '../../tokens/repository.tokens';
import { RedisService } from '../../../infrastructure/cache/redis.service';

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
    @Inject(EVENT_PUBLISHER)
    private readonly eventPublisher: EventPublisher,
    private readonly redisService: RedisService,
  ) { }

  async execute(taskId: string, dto: UpdateTaskDto, userId: string): Promise<Task> {
    // Find the task
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user owns the task
    if (task.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this task');
    }

    // Update task properties
    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.status !== undefined) task.status = dto.status;
    if (dto.priority !== undefined) task.priority = dto.priority;
    if (dto.dueDate !== undefined) task.dueDate = new Date(dto.dueDate);

    task.updatedAt = new Date();

    // Save updated task
    const updatedTask = await this.taskRepository.update(task);

    // Invalidate cache
    await this.redisService.delPattern(`tasks:${userId}:*`);

    // Publish event
    const event: TaskUpdatedEvent = {
      taskId: updatedTask.id,
      userId: updatedTask.userId,
      title: updatedTask.title,
      status: updatedTask.status,
      dueDate: updatedTask.dueDate,
      updatedAt: updatedTask.updatedAt,
    };

    await this.eventPublisher.publish('task.updated', event);

    return updatedTask;
  }
}
