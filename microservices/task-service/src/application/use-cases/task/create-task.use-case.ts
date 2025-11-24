import { Injectable, Inject } from '@nestjs/common';
import { TaskRepository } from '../../../domain/repositories/task.repository';
import { Task, TaskPriority } from '../../../domain/entities/task.entity';
import { CreateTaskDto } from '../../dto/task/create-task.dto';
import { EventPublisher, EVENT_PUBLISHER } from '../../ports/event-publisher.port';
import { TaskCreatedEvent } from '../../../domain/events/task.events';
import { TASK_REPOSITORY } from '../../tokens/repository.tokens';
import { RedisService } from '../../../infrastructure/cache/redis.service';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
    @Inject(EVENT_PUBLISHER)
    private readonly eventPublisher: EventPublisher,
    private readonly redisService: RedisService,
  ) { }

  async execute(dto: CreateTaskDto, userId: string): Promise<Task> {
    console.log('CreateTaskUseCase received DTO:', JSON.stringify(dto, null, 2));

    // Sanitize inputs
    const categoryId = dto.categoryId && dto.categoryId.trim() !== '' ? dto.categoryId : null;
    const subtasks = dto.subtasks && dto.subtasks.length > 0 ? dto.subtasks : undefined;

    // Create task entity
    const task = Task.create({
      title: dto.title,
      description: dto.description || null,
      status: dto.status,
      priority: dto.priority || TaskPriority.MEDIUM,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      userId,
      categoryId,
      subtasks,
    });

    // Save to repository
    const createdTask = await this.taskRepository.create(task);

    // Invalidate cache
    await this.redisService.delPattern(`tasks:${userId}:*`);

    // Publish event
    const event: TaskCreatedEvent = {
      taskId: createdTask.id,
      userId: createdTask.userId,
      title: createdTask.title,
      dueDate: createdTask.dueDate,
      createdAt: createdTask.createdAt,
    };

    await this.eventPublisher.publish('task.created', event);

    return createdTask;
  }
}
