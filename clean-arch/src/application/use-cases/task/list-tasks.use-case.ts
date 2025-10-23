import { Injectable } from '@nestjs/common';
import { TaskRepository, TaskFilters } from '../../../domain/repositories/task.repository';
import { Task, TaskStatus } from '../../../domain/entities/task.entity';

@Injectable()
export class ListTasksUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(userId: string, status?: TaskStatus): Promise<Task[]> {
    const filters: TaskFilters = {
      userId,
      ...(status && { status }),
    };

    const tasks = await this.taskRepository.findAll(filters);
    return tasks;
  }
}
