import { Injectable, Inject } from '@nestjs/common';
import { TaskRepository } from '../../../domain/repositories/task.repository';
import { TASK_REPOSITORY } from '../../tokens/repository.tokens';

@Injectable()
export class ToggleSubtaskUseCase {
    constructor(@Inject(TASK_REPOSITORY) private readonly taskRepository: TaskRepository) { }

    async execute(taskId: string, subtaskId: string): Promise<void> {
        await this.taskRepository.toggleSubtask(taskId, subtaskId);
    }
}
