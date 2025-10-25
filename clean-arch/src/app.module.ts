import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TaskModule } from './presentation/module/task.module';
import { NotificationModule } from './presentation/module/notification.module';
import { MessagingModule } from './infrastructure/messaging/messaging.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MessagingModule,
    AuthModule,
    TaskModule,
    NotificationModule,
  ],
})
export class AppModule {}
