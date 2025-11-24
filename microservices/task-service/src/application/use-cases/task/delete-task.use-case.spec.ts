import { DeleteTaskUseCase } from './delete-task.use-case';
import { TaskRepository } from '../../../domain/repositories/task.repository';
import { EventPublisher } from '../../ports/event-publisher.port';
import { Task, TaskStatus, TaskPriority } from '../../../domain/entities/task.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

import { RedisService } from '../../../infrastructure/cache/redis.service';

describe('DeleteTaskUseCase', () => {
  let useCase: DeleteTaskUseCase;
  let mockTaskRepository: jest.Mocked<TaskRepository>;
  let mockEventPublisher: jest.Mocked<EventPublisher>;
  let mockRedisService: jest.Mocked<RedisService>;

  beforeEach(() => {
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

    useCase = new DeleteTaskUseCase(mockTaskRepository, mockEventPublisher, mockRedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should delete a task and publish TaskDeletedEvent', async () => {
      // Arrange
      const userId = 'user-123';
      const taskId = 'task-123';

      const existingTask = Task.create({
        id: taskId,
        userId,
        title: 'Task to Delete',
        description: 'Will be deleted',
        status: TaskStatus.PENDING,
        priority: TaskPriority.LOW,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockTaskRepository.findById.mockResolvedValue(existingTask);
      mockTaskRepository.delete.mockResolvedValue(undefined);

      // Act
      await useCase.execute(taskId, userId);

      // Assert
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.delete).toHaveBeenCalledWith(taskId);
      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'task.deleted',
        expect.objectContaining({
          taskId: existingTask.id,
          userId: existingTask.userId,
          title: existingTask.title,
        })
      );
    });

    it('should throw NotFoundException if task does not exist', async () => {
      // Arrange
      const userId = 'user-123';
      const taskId = 'non-existent-task';

      mockTaskRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(taskId, userId)).rejects.toThrow(
        NotFoundException
      );
      expect(mockTaskRepository.delete).not.toHaveBeenCalled();
      expect(mockEventPublisher.publish).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user does not own the task', async () => {
      // Arrange
      const taskOwnerId = 'user-123';
      const differentUserId = 'user-456';
      const taskId = 'task-123';

      const existingTask = Task.create({
        id: taskId,
        userId: taskOwnerId,
        title: 'Someone elses task',
        description: 'Not yours',
        status: TaskStatus.PENDING,
        priority: TaskPriority.LOW,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockTaskRepository.findById.mockResolvedValue(existingTask);

      // Act & Assert
      await expect(useCase.execute(taskId, differentUserId)).rejects.toThrow(
        ForbiddenException
      );
      expect(mockTaskRepository.delete).not.toHaveBeenCalled();
      expect(mockEventPublisher.publish).not.toHaveBeenCalled();
    });
  });
});

