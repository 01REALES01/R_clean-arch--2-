import { Injectable, Inject } from '@nestjs/common';
import { TaskRepository } from '../../../domain/repositories/task.repository';
import { Task, TaskPriority } from '../../../domain/entities/task.entity';
import { CreateTaskDto } from '../../dto/task/create-task.dto';
import { EventPublisher, EVENT_PUBLISHER } from '../../ports/event-publisher.port';
import { TaskCreatedEvent } from '../../../domain/events/task.events';
import { TASK_REPOSITORY } from '../../tokens/repository.tokens';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
    @Inject(EVENT_PUBLISHER)
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(dto: CreateTaskDto, userId: string): Promise<Task> {
    // Create task entity
    const task = Task.create({
      title: dto.title,
      description: dto.description || null,
      priority: dto.priority || TaskPriority.MEDIUM,
      dueDate: dto.dueDate || null,
      userId,
    });

    // Save to repository
    const createdTask = await this.taskRepository.create(task);

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
