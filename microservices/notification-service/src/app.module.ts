import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from './presentation/module/notification.module';
import { MessagingModule } from './infrastructure/messaging/messaging.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MessagingModule, // For consuming events and creating notifications
    NotificationModule,
    // AuthModule and TaskModule removed - handled by task-service
  ],
})
export class AppModule {}
