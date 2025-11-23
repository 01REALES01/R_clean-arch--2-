import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from './presentation/module/notification.module';
import { MessagingModule } from './infrastructure/messaging/messaging.module';
import { EmailModule } from './infrastructure/email/email.module';
import { HealthController } from './presentation/controllers/health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EmailModule, // For sending emails
    MessagingModule, // For consuming events and creating notifications
    NotificationModule,
    // AuthModule and TaskModule removed - handled by task-service
  ],
  controllers: [HealthController],
})
export class AppModule {}
