import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { AiService } from '../../../infrastructure/ai/ai.service';

class GenerateTaskDto {
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
}
