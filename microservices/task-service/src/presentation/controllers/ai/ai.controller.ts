import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { AiService } from '../../../infrastructure/ai/ai.service';
import { ChatDto } from '../../dto/chat.dto';

class GenerateTaskDto {
    @IsString()
    @IsNotEmpty()
    prompt: string;
}

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('generate')
    @ApiOperation({ summary: 'Generate task details from a prompt' })
    @ApiResponse({ status: 200, description: 'Task generated successfully' })
    async generate(@Body() body: GenerateTaskDto) {
        return this.aiService.generateTask(body.prompt);
    }

    @Post('chat')
    @ApiOperation({ summary: 'Chat with AI assistant about tasks and productivity' })
    @ApiResponse({ status: 200, description: 'Chat response received' })
    async chat(@Body() chatDto: ChatDto, @Request() req) {
        return this.aiService.chat(chatDto.message, req.user.id);
    }
}
