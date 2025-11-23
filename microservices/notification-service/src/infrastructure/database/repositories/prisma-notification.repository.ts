import { Injectable } from '@nestjs/common';
import { Notification, NotificationType, NotificationStatus } from '../../../domain/entities/notification.entity';
import { NotificationRepository, NotificationFilters } from '../../../domain/repositories/notification.repository';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaNotification: any): Notification {
    return new Notification(
      prismaNotification.id,
      prismaNotification.userId,
      prismaNotification.type as NotificationType,
      prismaNotification.title,
      prismaNotification.message,
      prismaNotification.status as NotificationStatus,
      typeof prismaNotification.metadata === 'string' 
        ? JSON.parse(prismaNotification.metadata) 
        : prismaNotification.metadata,
      prismaNotification.createdAt,
      prismaNotification.sentAt,
    );
  }

  async create(notification: Notification): Promise<Notification> {
    const createdNotification = await this.prisma.notification.create({
      data: {
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        status: notification.status,
        metadata: notification.metadata,
        sentAt: notification.sentAt,
      },
    });
    return this.toDomain(createdNotification);
  }

  async findById(id: string): Promise<Notification | null> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    return notification ? this.toDomain(notification) : null;
  }

  async findAll(filters?: NotificationFilters): Promise<Notification[]> {
    const where: any = {};

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.fromDate || filters?.toDate) {
      where.createdAt = {};
      if (filters.fromDate) {
        where.createdAt.gte = filters.fromDate;
      }
      if (filters.toDate) {
        where.createdAt.lte = filters.toDate;
      }
    }

    const notifications = await this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map((notification) => this.toDomain(notification));
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return notifications.map((notification) => this.toDomain(notification));
  }

  async update(notification: Notification): Promise<Notification> {
    const updatedNotification = await this.prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: notification.status,
        sentAt: notification.sentAt,
      },
    });
    return this.toDomain(updatedNotification);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.notification.delete({
      where: { id },
    });
  }
}
