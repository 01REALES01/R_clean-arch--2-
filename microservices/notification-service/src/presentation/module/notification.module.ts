import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationController } from '../controllers/notification/notification.controller';
import { GetNotificationsUseCase } from '../../application/use-cases/notification/get-notifications.use-case';
import { MarkNotificationReadUseCase } from '../../application/use-cases/notification/mark-notification-read.use-case';
import { GetUnreadCountUseCase } from '../../application/use-cases/notification/get-unread-count.use-case';
import { DeleteNotificationUseCase } from '../../application/use-cases/notification/delete-notification.use-case';
import { NotificationRepository } from '../../domain/repositories/notification.repository';
import { PrismaNotificationRepository } from '../../infrastructure/database/repositories/prisma-notification.repository';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { JwtStrategy } from '../../infrastructure/auth/strategies/jwt.strategy';
import { NOTIFICATION_REPOSITORY } from '../../application/tokens/repository.tokens';

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
  controllers: [NotificationController],
  providers: [
    // Use Cases
    GetNotificationsUseCase,
    MarkNotificationReadUseCase,
    GetUnreadCountUseCase,
    DeleteNotificationUseCase,
    // Repositories
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: PrismaNotificationRepository,
    },
    // Infrastructure
    PrismaService,
    JwtStrategy,
  ],
  exports: [
    GetNotificationsUseCase,
    MarkNotificationReadUseCase,
    GetUnreadCountUseCase,
    DeleteNotificationUseCase,
  ],
})
export class NotificationModule {}

