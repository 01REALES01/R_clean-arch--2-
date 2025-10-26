import { TaskEventHandler } from './task-event.handler';
import { RabbitMQService } from '../rabbitmq.service';
import { NotificationRepository } from '../../../domain/repositories/notification.repository';
import { NotificationType, NotificationStatus } from '../../../domain/entities/notification.entity';

describe('TaskEventHandler', () => {
  let handler: TaskEventHandler;
  let mockRabbitMQService: jest.Mocked<RabbitMQService>;
  let mockNotificationRepository: jest.Mocked<NotificationRepository>;
  let mockEmailService: any;
  let mockPrismaService: any;

  beforeEach(() => {
    mockRabbitMQService = {
      consume: jest.fn(),
      publish: jest.fn(),
    } as any;

    mockNotificationRepository = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockEmailService = {
      sendTaskNotification: jest.fn().mockResolvedValue(true),
    };

    mockPrismaService = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ email: 'test@example.com' }),
      },
    };

    handler = new TaskEventHandler(
      mockRabbitMQService,
      mockNotificationRepository,
      mockEmailService,
      mockPrismaService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleTaskCreated', () => {
    it('should create notification when task.created event is received', async () => {
      // Arrange
      const event = {
        taskId: 'task-123',
        userId: 'user-123',
        title: 'New Task',
        dueDate: new Date('2025-12-31'),
        createdAt: new Date(),
      };

      // Act
      await handler['handleTaskCreated'](event);

      // Assert
      expect(mockNotificationRepository.create).toHaveBeenCalledTimes(1);
      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: event.userId,
          type: NotificationType.TASK_CREATED,
          title: 'New Task Created',
          message: expect.stringContaining(event.title),
          status: NotificationStatus.PENDING,
        })
      );
    });
  });

  describe('handleTaskUpdated', () => {
    it('should create notification when task.updated event is received', async () => {
      // Arrange
      const event = {
        taskId: 'task-123',
        userId: 'user-123',
        title: 'Updated Task',
        status: 'IN_PROGRESS',
        dueDate: new Date('2025-12-31'),
        updatedAt: new Date(),
      };

      // Act
      await handler['handleTaskUpdated'](event);

      // Assert
      expect(mockNotificationRepository.create).toHaveBeenCalledTimes(1);
      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: event.userId,
          type: NotificationType.TASK_UPDATED,
          title: 'Task Updated',
          message: expect.stringContaining(event.title),
          status: NotificationStatus.PENDING,
        })
      );
    });
  });

  describe('handleTaskDeleted', () => {
    it('should create notification when task.deleted event is received', async () => {
      // Arrange
      const event = {
        taskId: 'task-123',
        userId: 'user-123',
        title: 'Deleted Task',
        deletedAt: new Date(),
      };

      // Act
      await handler['handleTaskDeleted'](event);

      // Assert
      expect(mockNotificationRepository.create).toHaveBeenCalledTimes(1);
      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: event.userId,
          type: NotificationType.TASK_DELETED,
          title: 'Task Deleted',
          message: expect.stringContaining(event.title),
          status: NotificationStatus.PENDING,
        })
      );
    });
  });
});

