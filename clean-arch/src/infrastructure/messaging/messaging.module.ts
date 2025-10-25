import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQService } from './rabbitmq.service';
import { EventPublisherAdapter } from './event-publisher.adapter';
import { TaskEventHandler } from './handlers/task-event.handler';
import { EVENT_PUBLISHER } from '../../application/ports/event-publisher.port';
import { NOTIFICATION_REPOSITORY } from '../../application/tokens/repository.tokens';
import { PrismaNotificationRepository } from '../database/repositories/prisma-notification.repository';
import { PrismaService } from '../database/prisma.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    RabbitMQService,
    PrismaService,
    {
      provide: EVENT_PUBLISHER,
      useClass: EventPublisherAdapter,
    },
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: PrismaNotificationRepository,
    },
    TaskEventHandler,
  ],
  exports: [RabbitMQService, EVENT_PUBLISHER],
})
export class MessagingModule {}
