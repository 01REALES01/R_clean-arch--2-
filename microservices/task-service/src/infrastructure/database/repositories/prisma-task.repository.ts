import { Injectable } from '@nestjs/common';
import { Task, TaskStatus, TaskPriority } from '../../../domain/entities/task.entity';
import { Subtask } from '../../../domain/entities/subtask.entity';
import { Category } from '../../../domain/entities/category.entity';
import { TaskRepository, TaskFilters } from '../../../domain/repositories/task.repository';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaTaskRepository implements TaskRepository {
  constructor(private readonly prisma: PrismaService) { }

  private toDomain(prismaTask: any): Task {
    return new Task(
      prismaTask.id,
      prismaTask.title,
      prismaTask.description,
      prismaTask.status as TaskStatus,
      prismaTask.priority as TaskPriority,
      prismaTask.dueDate,
      prismaTask.userId,
      prismaTask.categoryId,
      prismaTask.subtasks?.map(
        (s: any) =>
          new Subtask(
            s.id,
            s.title,
            s.completed,
            s.taskId,
            s.createdAt,
            s.updatedAt,
          ),
      ) || [],
      prismaTask.category ? new Category(
        prismaTask.category.id,
        prismaTask.category.name,
        prismaTask.category.color,
        prismaTask.category.icon,
        prismaTask.category.userId,
        prismaTask.category.createdAt,
        prismaTask.category.updatedAt
      ) : null,
      prismaTask.createdAt,
      prismaTask.updatedAt,
    );
  }

  async create(task: Task): Promise<Task> {
    const data: any = {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      userId: task.userId,
      categoryId: task.categoryId,
    };

    // Only include subtasks if there are any
    if (task.subtasks && task.subtasks.length > 0) {
      data.subtasks = {
        create: task.subtasks.map((subtask) => ({
          title: subtask.title,
          completed: subtask.completed,
        })),
      };
    }

    const createdTask = await this.prisma.task.create({
      data,
      include: { subtasks: true, category: true },
    });
    return this.toDomain(createdTask);
  }

  async findById(id: string): Promise<Task | null> {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { subtasks: true, category: true },
    });
    return task ? this.toDomain(task) : null;
  }

  async findAll(filters?: TaskFilters): Promise<Task[]> {
    const where: any = {};

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.fromDate || filters?.toDate) {
      where.dueDate = {};
      if (filters.fromDate) {
        where.dueDate.gte = filters.fromDate;
      }
      if (filters.toDate) {
        where.dueDate.lte = filters.toDate;
      }
    }

    const tasks = await this.prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { subtasks: true, category: true },
    });

    return tasks.map((task) => this.toDomain(task));
  }

  async findByUserId(userId: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { subtasks: true, category: true },
    });
    return tasks.map((task) => this.toDomain(task));
  }

  async update(task: Task): Promise<Task> {
    const updatedTask = await this.prisma.task.update({
      where: { id: task.id },
      data: {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        categoryId: task.categoryId,
        updatedAt: task.updatedAt,
      },
    });
    return this.toDomain(updatedTask);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({
      where: { id },
    });
  }

  async toggleSubtask(taskId: string, subtaskId: string): Promise<void> {
    const subtask = await this.prisma.subtask.findUnique({
      where: { id: subtaskId },
    });

    if (subtask && subtask.taskId === taskId) {
      await this.prisma.subtask.update({
        where: { id: subtaskId },
        data: { completed: !subtask.completed },
      });
    }
  }
}
