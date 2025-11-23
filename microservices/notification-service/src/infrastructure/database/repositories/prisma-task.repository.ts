import { Injectable } from '@nestjs/common';
import { Task, TaskStatus, TaskPriority } from '../../../domain/entities/task.entity';
import { TaskRepository, TaskFilters } from '../../../domain/repositories/task.repository';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaTaskRepository implements TaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaTask: any): Task {
    return new Task(
      prismaTask.id,
      prismaTask.title,
      prismaTask.description,
      prismaTask.status as TaskStatus,
      prismaTask.priority as TaskPriority,
      prismaTask.dueDate,
      prismaTask.userId,
      prismaTask.createdAt,
      prismaTask.updatedAt,
    );
  }

  async create(task: Task): Promise<Task> {
    const createdTask = await this.prisma.task.create({
      data: {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        userId: task.userId,
      },
    });
    return this.toDomain(createdTask);
  }

  async findById(id: string): Promise<Task | null> {
    const task = await this.prisma.task.findUnique({
      where: { id },
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
    });

    return tasks.map((task) => this.toDomain(task));
  }

  async findByUserId(userId: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
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
}
