import { CreateTaskUseCase } from './create-task.use-case';
import { TaskRepository } from '../../../domain/repositories/task.repository';
import { EventPublisher } from '../../ports/event-publisher.port';
import { Task, TaskStatus, TaskPriority } from '../../../domain/entities/task.entity';

import { RedisService } from '../../../infrastructure/cache/redis.service';

describe('CreateTaskUseCase', () => {
  let useCase: CreateTaskUseCase;
  let mockTaskRepository: jest.Mocked<TaskRepository>;
  let mockEventPublisher: jest.Mocked<EventPublisher>;
  let mockRedisService: jest.Mocked<RedisService>;

  beforeEach(() => {
    // Create mocks
    mockTaskRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockEventPublisher = {
      publish: jest.fn(),
    } as any;

    mockRedisService = {
      delPattern: jest.fn(),
    } as any;

    // Create use case with mocks
    useCase = new CreateTaskUseCase(mockTaskRepository, mockEventPublisher, mockRedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should create a task and publish TaskCreatedEvent', async () => {
      // Arrange
      const userId = 'user-123';
      const taskData: any = {
        title: 'Test Task',
        description: 'Test Description',
        dueDate: '2025-12-31',
        priority: TaskPriority.HIGH,
      };

      const createdTask = Task.create({
        id: 'task-123',
        userId,
        title: taskData.title,
        description: taskData.description,
        status: TaskStatus.PENDING,
        priority: taskData.priority,
        dueDate: new Date(taskData.dueDate),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockTaskRepository.create.mockResolvedValue(createdTask);

      // Act
      const result = await useCase.execute(taskData, userId);

      // Assert
      expect(mockTaskRepository.create).toHaveBeenCalledTimes(1);
      expect(mockTaskRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
        })
      );

      expect(mockEventPublisher.publish).toHaveBeenCalledTimes(1);
      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'task.created',
        expect.objectContaining({
          taskId: createdTask.id,
          userId: createdTask.userId,
          title: createdTask.title,
        })
      );

      expect(result).toEqual(createdTask);
    });

    it('should handle missing optional fields', async () => {
      // Arrange
      const userId = 'user-456';
      const taskData = {
        title: 'Simple Task',
        description: 'Simple Description',
      };

      const createdTask = Task.create({
        id: 'task-456',
        userId,
        title: taskData.title,
        description: taskData.description,
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockTaskRepository.create.mockResolvedValue(createdTask);

      // Act
      const result = await useCase.execute(taskData, userId);

      // Assert
      expect(result.dueDate).toBeNull();
      expect(result.priority).toBe(TaskPriority.MEDIUM);
      expect(mockEventPublisher.publish).toHaveBeenCalled();
    });
  });
});

