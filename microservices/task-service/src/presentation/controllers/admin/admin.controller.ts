import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../infrastructure/auth/guards/roles.guard';
import { Roles } from '../../../infrastructure/auth/decorators/roles.decorator';
import { UserRole } from '../../../domain/entities/user.entity';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { ListTasksUseCase } from '../../../application/use-cases/task/list-tasks.use-case';
import { DeleteTaskUseCase } from '../../../application/use-cases/task/delete-task.use-case';
import { TaskStatus, TaskPriority } from '../../../domain/entities/task.entity';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly listTasksUseCase: ListTasksUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
  ) {}

  @Get('users')
  @ApiOperation({ summary: '[ADMIN ONLY] Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Don't return password
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      total: users.length,
      users,
    };
  }

  @Get('users/:userId/tasks')
  @ApiOperation({ summary: '[ADMIN ONLY] Get all tasks for a specific user' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getUserTasks(
    @Param('userId') userId: string,
    @Query('status') status?: TaskStatus,
  ) {
    const tasks = await this.listTasksUseCase.execute(userId, status);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, role: true },
    });

    return {
      user,
      tasks,
    };
  }

  @Get('tasks/all')
  @ApiOperation({ summary: '[ADMIN ONLY] Get all tasks from all users' })
  @ApiResponse({ status: 200, description: 'All tasks retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAllTasks(
    @Query('status') status?: TaskStatus,
    @Query('priority') priority?: TaskPriority,
  ) {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }

    const tasks = await this.prisma.task.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      total: tasks.length,
      tasks,
    };
  }

  @Get('statistics')
  @ApiOperation({ summary: '[ADMIN ONLY] Get system statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getStatistics() {
    const [
      totalUsers,
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      totalNotifications,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.task.count(),
      this.prisma.task.count({ where: { status: 'PENDING' } }),
      this.prisma.task.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.task.count({ where: { status: 'COMPLETED' } }),
      this.prisma.notification.count(),
    ]);

    const usersByRole = await this.prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });

    const tasksByPriority = await this.prisma.task.groupBy({
      by: ['priority'],
      _count: true,
    });

    // Get notifications grouped by user
    const notificationsByUser = await this.prisma.notification.groupBy({
      by: ['userId'],
      _count: true,
    });

    // Get user emails for the notifications
    const notificationsByUserWithEmail = await Promise.all(
      notificationsByUser.map(async (item) => {
        const user = await this.prisma.user.findUnique({
          where: { id: item.userId },
          select: { email: true },
        });
        return {
          userId: item.userId,
          userEmail: user?.email || 'Unknown',
          count: item._count,
        };
      }),
    );

    return {
      users: {
        total: totalUsers,
        byRole: usersByRole.map((r) => ({ role: r.role, count: r._count })),
      },
      tasks: {
        total: totalTasks,
        byStatus: {
          pending: pendingTasks,
          inProgress: inProgressTasks,
          completed: completedTasks,
        },
        byPriority: tasksByPriority.map((p) => ({ priority: p.priority, count: p._count })),
      },
      notifications: {
        total: totalNotifications,
        byUser: notificationsByUserWithEmail,
      },
    };
  }

  @Delete('tasks/:taskId')
  @ApiOperation({ summary: '[ADMIN ONLY] Delete any task (from any user)' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async deleteAnyTask(@Param('taskId') taskId: string) {
    // Get task to find the owner
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return { message: 'Task not found' };
    }

    // Admin can delete any task
    await this.deleteTaskUseCase.execute(taskId, task.userId);

    return {
      message: 'Task deleted successfully by admin',
      taskId,
      originalOwner: task.userId,
    };
  }

  @Delete('users/:userId')
  @ApiOperation({ summary: '[ADMIN ONLY] Delete a user and all their tasks' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('userId') userId: string) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { message: 'User not found' };
    }

    // Prevent admins from deleting themselves
    if (user.role === UserRole.ADMIN) {
      return {
        message: 'Cannot delete admin users through this endpoint',
        hint: 'Use database access to manage admin users',
      };
    }

    // Delete user's notifications first
    await this.prisma.notification.deleteMany({
      where: { userId },
    });

    // Delete user's tasks
    const deletedTasks = await this.prisma.task.deleteMany({
      where: { userId },
    });

    // Delete the user
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return {
      message: 'User and all their data deleted successfully',
      userId,
      deletedTasks: deletedTasks.count,
    };
  }
}

