import { Injectable, Inject } from '@nestjs/common';
import { TaskRepository, TaskFilters } from '../../../domain/repositories/task.repository';
import { TASK_REPOSITORY } from '../../tokens/repository.tokens';
import { Task, TaskStatus } from '../../../domain/entities/task.entity';

@Injectable()
export class ListTasksUseCase {
  constructor(@Inject(TASK_REPOSITORY) private readonly taskRepository: TaskRepository) {}

  async execute(userId: string, status?: TaskStatus): Promise<Task[]> {
    const filters: TaskFilters = {
      userId,
      ...(status && { status }),
    };

    const tasks = await this.taskRepository.findAll(filters);
    return tasks;
  }
}
