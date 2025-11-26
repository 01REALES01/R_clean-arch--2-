import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from '../controllers/ai/ai.controller';
import { AiService } from '../../infrastructure/ai/ai.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Module({
    imports: [ConfigModule],
    controllers: [AiController],
    providers: [AiService, PrismaService],
})
export class AiModule { }
