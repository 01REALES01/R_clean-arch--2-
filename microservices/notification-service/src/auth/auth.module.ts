import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from '../presentation/controllers/auth/auth.controller';
import { JwtStrategy } from '../infrastructure/auth/strategies/jwt.strategy';
import { UserRepository } from '../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../application/tokens/repository.tokens';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { PrismaUserRepository } from '../infrastructure/database/repositories/prisma-user.repository';

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
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    PrismaService,
  ],
  exports: [AuthService],
})
export class AuthModule {}