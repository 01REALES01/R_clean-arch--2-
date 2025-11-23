// Enums
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

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum NotificationType {
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_DELETED = 'TASK_DELETED',
  TASK_DUE_SOON = 'TASK_DUE_SOON',
  TASK_OVERDUE = 'TASK_OVERDUE',
  DAILY_SUMMARY = 'DAILY_SUMMARY',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  READ = 'READ',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

// Interfaces
export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  taskId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  userId: string;
  categoryId?: string | null;
  category?: Category;
  subtasks?: Subtask[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  metadata: Record<string, any>;
  createdAt: string;
  sentAt: string | null;
}

// DTOs
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  categoryId?: string;
  subtasks?: string[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  categoryId?: string;
  subtasks?: string[];
}

export interface CreateCategoryDto {
  name: string;
  color: string;
  icon: string;
}

// API Responses
export interface LoginResponse {
  message: string;
  access_token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface UnreadCountResponse {
  count: number;
}

export interface AdminStatistics {
  users: {
    total: number;
    byRole: Array<{ role: string; count: number }>;
  };
  tasks: {
    total: number;
    byStatus: {
      pending: number;
      inProgress: number;
      completed: number;
    };
    byPriority: Array<{ priority: string; count: number }>;
  };
  notifications: {
    total: number;
    byUser: Array<{ userId: string; userEmail: string; count: number }>;
  };
}

