import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TaskController } from '../controllers/task/task.controller';
import { AdminController } from '../controllers/admin/admin.controller';
import { CreateTaskUseCase } from '../../application/use-cases/task/create-task.use-case';
import { UpdateTaskUseCase } from '../../application/use-cases/task/update-task.use-case';
import { DeleteTaskUseCase } from '../../application/use-cases/task/delete-task.use-case';
import { GetTaskUseCase } from '../../application/use-cases/task/get-task.use-case';
import { ListTasksUseCase } from '../../application/use-cases/task/list-tasks.use-case';
import { ToggleSubtaskUseCase } from '../../application/use-cases/task/toggle-subtask.use-case';
import { TaskRepository } from '../../domain/repositories/task.repository';
import { PrismaTaskRepository } from '../../infrastructure/database/repositories/prisma-task.repository';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { JwtStrategy } from '../../infrastructure/auth/strategies/jwt.strategy';
import { TASK_REPOSITORY } from '../../application/tokens/repository.tokens';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [TaskController, AdminController],
  providers: [
    // Use Cases (EVENT_PUBLISHER injected from global MessagingModule)
    CreateTaskUseCase,
    UpdateTaskUseCase,
    DeleteTaskUseCase,
    GetTaskUseCase,
    ListTasksUseCase,
    ToggleSubtaskUseCase,
    // Repositories
    {
      provide: TASK_REPOSITORY,
      useClass: PrismaTaskRepository,
    },
    // Infrastructure
    PrismaService,
    JwtStrategy,
  ],
  exports: [
    CreateTaskUseCase,
    UpdateTaskUseCase,
    DeleteTaskUseCase,
    GetTaskUseCase,
    ListTasksUseCase,
    ToggleSubtaskUseCase,
  ],
})
export class TaskModule { }
