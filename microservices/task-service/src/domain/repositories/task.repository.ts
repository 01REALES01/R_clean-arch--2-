import { Task, TaskStatus } from '../entities/task.entity';

export interface TaskFilters {
  userId?: string;
  status?: TaskStatus;
  categoryId?: string;
  fromDate?: Date;
  toDate?: Date;
}

export interface TaskRepository {
  create(task: Task): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  findAll(filters?: TaskFilters): Promise<Task[]>;
  findByUserId(userId: string): Promise<Task[]>;
  update(task: Task): Promise<Task>;
  delete(id: string): Promise<void>;
  toggleSubtask(taskId: string, subtaskId: string): Promise<void>;
}
