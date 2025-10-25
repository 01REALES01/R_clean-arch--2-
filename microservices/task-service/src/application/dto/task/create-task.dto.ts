import { TaskPriority } from '../../../domain/entities/task.entity';

// Application layer DTO (no validation decorators)
export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: Date;
}
