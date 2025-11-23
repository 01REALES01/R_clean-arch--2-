import { TaskStatus, TaskPriority } from '../../../domain/entities/task.entity';

// Application layer DTO (no validation decorators)
export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  categoryId?: string;
}
