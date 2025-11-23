import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TaskModule } from './presentation/module/task.module';
import { CategoryModule } from './presentation/module/category.module';
import { AiModule } from './presentation/module/ai.module';
import { MessagingModule } from './infrastructure/messaging/messaging.module';
import { HealthController } from './presentation/controllers/health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MessagingModule, // For publishing events
    AuthModule,
    TaskModule,
    CategoryModule,
    AiModule,
    // NotificationModule removed - handled by notification-service
  ],
  controllers: [HealthController],
})
export class AppModule { }
