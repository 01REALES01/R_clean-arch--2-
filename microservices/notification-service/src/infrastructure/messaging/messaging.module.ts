import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQService } from './rabbitmq.service';
import { TaskEventHandler } from './handlers/task-event.handler';
import { NOTIFICATION_REPOSITORY } from '../../application/tokens/repository.tokens';
import { PrismaNotificationRepository } from '../database/repositories/prisma-notification.repository';
import { PrismaService } from '../database/prisma.service';
import { EmailModule } from '../email/email.module';

@Global()
@Module({
  imports: [ConfigModule, EmailModule],
  providers: [
    RabbitMQService,
    PrismaService,
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: PrismaNotificationRepository,
    },
    TaskEventHandler, // Consumes events from task-service
  ],
  exports: [RabbitMQService],
})
export class MessagingModule {}
