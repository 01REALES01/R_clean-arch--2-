import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { CreateTaskDto } from '../../dto/task/create-task.dto';
import { UpdateTaskDto } from '../../dto/task/update-task.dto';
import { CreateTaskUseCase } from '../../../application/use-cases/task/create-task.use-case';
import { UpdateTaskUseCase } from '../../../application/use-cases/task/update-task.use-case';
import { DeleteTaskUseCase } from '../../../application/use-cases/task/delete-task.use-case';
import { GetTaskUseCase } from '../../../application/use-cases/task/get-task.use-case';
import { ListTasksUseCase } from '../../../application/use-cases/task/list-tasks.use-case';
import { ToggleSubtaskUseCase } from '../../../application/use-cases/task/toggle-subtask.use-case';
import { TaskStatus } from '../../../domain/entities/task.entity';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,

    private readonly getTaskUseCase: GetTaskUseCase,
    private readonly listTasksUseCase: ListTasksUseCase,
    private readonly toggleSubtaskUseCase: ToggleSubtaskUseCase,
  ) { }

  @Patch(':id/subtasks/:subtaskId/toggle')
  @ApiOperation({ summary: 'Toggle subtask completion status' })
  @ApiResponse({ status: 200, description: 'Subtask toggled successfully' })
  @ApiResponse({ status: 404, description: 'Task or subtask not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async toggleSubtask(
    @Param('id') id: string,
    @Param('subtaskId') subtaskId: string,
    @Request() req: any,
  ) {
    await this.toggleSubtaskUseCase.execute(id, subtaskId);
    return { message: 'Subtask toggled successfully' };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req: any) {
    const applicationDto = {
      ...createTaskDto,
      dueDate: createTaskDto.dueDate && createTaskDto.dueDate.trim() !== ''
        ? new Date(createTaskDto.dueDate)
        : undefined,
    };
    return this.createTaskUseCase.execute(applicationDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all tasks for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Request() req: any, @Query('status') status?: TaskStatus, @Query('categoryId') categoryId?: string) {
    return this.listTasksUseCase.execute(req.user.id, status, categoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific task by ID' })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.getTaskUseCase.execute(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: any,
  ) {
    const applicationDto = {
      ...updateTaskDto,
      dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : undefined,
    };
    return this.updateTaskUseCase.execute(id, applicationDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.deleteTaskUseCase.execute(id, req.user.id);
    return { message: 'Task deleted successfully' };
  }
}
