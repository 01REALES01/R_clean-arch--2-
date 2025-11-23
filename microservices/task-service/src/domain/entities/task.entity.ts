import { Subtask } from './subtask.entity';
import { Category } from './category.entity';
import { randomUUID } from 'crypto';

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class Task {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string | null,
    public status: TaskStatus,
    public priority: TaskPriority,
    public dueDate: Date | null,
    public userId: string,
    public categoryId: string | null,
    public subtasks: Subtask[],
    public category: Category | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) { }

  static create(props: {
    id?: string;
    title: string;
    description?: string | null;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: Date | null;
    userId: string;
    categoryId?: string | null;
    subtasks?: string[];
    createdAt?: Date;
    updatedAt?: Date;
  }): Task {
    const now = new Date();
    const taskId = props.id || randomUUID();

    const subtaskEntities = props.subtasks?.map(title => Subtask.create({
      title,
      taskId,
      createdAt: now,
      updatedAt: now
    })) || [];

    return new Task(
      taskId,
      props.title,
      props.description || null,
      props.status || TaskStatus.PENDING,
      props.priority || TaskPriority.MEDIUM,
      props.dueDate || null,
      props.userId,
      props.categoryId || null,
      subtaskEntities,
      null, // category
      props.createdAt || now,
      props.updatedAt || now,
    );
  }

  markAsCompleted(): void {
    this.status = TaskStatus.COMPLETED;
    this.updatedAt = new Date();
  }

  markAsInProgress(): void {
    this.status = TaskStatus.IN_PROGRESS;
    this.updatedAt = new Date();
  }

  cancel(): void {
    this.status = TaskStatus.CANCELLED;
    this.updatedAt = new Date();
  }
}
