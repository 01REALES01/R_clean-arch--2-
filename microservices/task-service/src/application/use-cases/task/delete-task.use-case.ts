import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { TaskRepository } from '../../../domain/repositories/task.repository';
import { TASK_REPOSITORY } from '../../tokens/repository.tokens';

@Injectable()
export class DeleteTaskUseCase {
  constructor(@Inject(TASK_REPOSITORY) private readonly taskRepository: TaskRepository) {}

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
  }
}
