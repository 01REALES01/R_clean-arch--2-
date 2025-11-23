import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from '../controllers/ai/ai.controller';
import { AiService } from '../../infrastructure/ai/ai.service';

@Module({
    imports: [ConfigModule],
    controllers: [AiController],
    providers: [AiService],
})
export class AiModule { }
