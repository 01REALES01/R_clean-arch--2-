import { Injectable, Inject, Logger } from '@nestjs/common';
import { TaskRepository, TaskFilters } from '../../../domain/repositories/task.repository';
import { TASK_REPOSITORY } from '../../tokens/repository.tokens';
import { Task, TaskStatus } from '../../../domain/entities/task.entity';
import { RedisService } from '../../../infrastructure/cache/redis.service';

@Injectable()
export class ListTasksUseCase {
  private readonly logger = new Logger(ListTasksUseCase.name);

  constructor(
    @Inject(TASK_REPOSITORY) private readonly taskRepository: TaskRepository,
    private readonly redisService: RedisService,
  ) { }

  async execute(userId: string, status?: TaskStatus, categoryId?: string): Promise<Task[]> {
    const cacheKey = `tasks:${userId}:${status || 'all'}:${categoryId || 'all'}`;

    try {
      const cachedTasks = await this.redisService.get(cacheKey);
      if (cachedTasks) {
        this.logger.debug(`Cache hit for key: ${cacheKey}`);
        return JSON.parse(cachedTasks);
      }
    } catch (error) {
      this.logger.error(`Redis error: ${error.message}`);
    }

    const tasks = await this.taskRepository.findAll({ userId, status, categoryId });

    try {
      await this.redisService.set(cacheKey, JSON.stringify(tasks), 300); // Cache for 5 minutes
    } catch (error) {
      this.logger.error(`Redis set error: ${error.message}`);
    }

    return tasks;
  }
}
