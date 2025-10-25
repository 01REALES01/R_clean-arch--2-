import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQService } from './rabbitmq.service';
import { EventPublisherAdapter } from './event-publisher.adapter';
import { EVENT_PUBLISHER } from '../../application/ports/event-publisher.port';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    RabbitMQService,
    {
      provide: EVENT_PUBLISHER,
      useClass: EventPublisherAdapter,
    },
    // TaskEventHandler removed - notification-service will handle events
  ],
  exports: [RabbitMQService, EVENT_PUBLISHER],
})
export class MessagingModule {}
