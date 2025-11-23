import { Injectable, Inject } from '@nestjs/common';
import { TaskRepository, TaskFilters } from '../../../domain/repositories/task.repository';
import { TASK_REPOSITORY } from '../../tokens/repository.tokens';
import { Task, TaskStatus } from '../../../domain/entities/task.entity';


@Injectable()
export class ListTasksUseCase {
  constructor(@Inject(TASK_REPOSITORY) private readonly taskRepository: TaskRepository) { }

  async execute(userId: string, status?: TaskStatus, categoryId?: string): Promise<Task[]> {
    return this.taskRepository.findAll({ userId, status, categoryId });
  }
}
