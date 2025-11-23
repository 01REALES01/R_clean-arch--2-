// Domain Events for Tasks
export interface TaskCreatedEvent {
  taskId: string;
  userId: string;
  title: string;
  dueDate: Date | null;
  createdAt: Date;
}

export interface TaskUpdatedEvent {
  taskId: string;
  userId: string;
  title: string;
  status: string;
  dueDate: Date | null;
  updatedAt: Date;
}

export interface TaskDueSoonEvent {
  taskId: string;
  userId: string;
  title: string;
  dueDate: Date;
}

export interface TaskOverdueEvent {
  taskId: string;
  userId: string;
  title: string;
  dueDate: Date;
}

export interface TaskDeletedEvent {
  taskId: string;
  userId: string;
  title: string;
  deletedAt: Date;
}