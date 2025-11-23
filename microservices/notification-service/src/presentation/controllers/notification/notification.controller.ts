import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { GetNotificationsUseCase } from '../../../application/use-cases/notification/get-notifications.use-case';
import { MarkNotificationReadUseCase } from '../../../application/use-cases/notification/mark-notification-read.use-case';
import { GetUnreadCountUseCase } from '../../../application/use-cases/notification/get-unread-count.use-case';
import { DeleteNotificationUseCase } from '../../../application/use-cases/notification/delete-notification.use-case';
import { NotificationStatus } from '../../../domain/entities/notification.entity';
import { NotificationResponseDto } from '../../dto/notification/notification-response.dto';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
    private readonly markNotificationReadUseCase: MarkNotificationReadUseCase,
    private readonly getUnreadCountUseCase: GetUnreadCountUseCase,
    private readonly deleteNotificationUseCase: DeleteNotificationUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications for the authenticated user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Notifications retrieved successfully',
    type: [NotificationResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'status', enum: NotificationStatus, required: false })
  async findAll(
    @Request() req: any,
    @Query('status') status?: NotificationStatus,
  ) {
    return this.getNotificationsUseCase.execute(req.user.id, status);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get count of unread notifications' })
  @ApiResponse({ 
    status: 200, 
    description: 'Unread count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', example: 5 }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUnreadCount(@Request() req: any) {
    const count = await this.getUnreadCountUseCase.execute(req.user.id);
    return { count };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ 
    status: 200, 
    description: 'Notification marked as read',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.markNotificationReadUseCase.execute(id, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.deleteNotificationUseCase.execute(id, req.user.id);
    return { message: 'Notification deleted successfully' };
  }
}

