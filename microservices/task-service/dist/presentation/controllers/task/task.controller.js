"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../infrastructure/auth/guards/jwt-auth.guard");
const create_task_dto_1 = require("../../dto/task/create-task.dto");
const update_task_dto_1 = require("../../dto/task/update-task.dto");
const create_task_use_case_1 = require("../../../application/use-cases/task/create-task.use-case");
const update_task_use_case_1 = require("../../../application/use-cases/task/update-task.use-case");
const delete_task_use_case_1 = require("../../../application/use-cases/task/delete-task.use-case");
const get_task_use_case_1 = require("../../../application/use-cases/task/get-task.use-case");
const list_tasks_use_case_1 = require("../../../application/use-cases/task/list-tasks.use-case");
const task_entity_1 = require("../../../domain/entities/task.entity");
let TaskController = class TaskController {
    constructor(createTaskUseCase, updateTaskUseCase, deleteTaskUseCase, getTaskUseCase, listTasksUseCase) {
        this.createTaskUseCase = createTaskUseCase;
        this.updateTaskUseCase = updateTaskUseCase;
        this.deleteTaskUseCase = deleteTaskUseCase;
        this.getTaskUseCase = getTaskUseCase;
        this.listTasksUseCase = listTasksUseCase;
    }
    async create(createTaskDto, req) {
        const applicationDto = {
            ...createTaskDto,
            dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
        };
        return this.createTaskUseCase.execute(applicationDto, req.user.id);
    }
    async findAll(req, status) {
        return this.listTasksUseCase.execute(req.user.id, status);
    }
    async findOne(id, req) {
        return this.getTaskUseCase.execute(id, req.user.id);
    }
    async update(id, updateTaskDto, req) {
        const applicationDto = {
            ...updateTaskDto,
            dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : undefined,
        };
        return this.updateTaskUseCase.execute(id, applicationDto, req.user.id);
    }
    async remove(id, req) {
        await this.deleteTaskUseCase.execute(id, req.user.id);
        return { message: 'Task deleted successfully' };
    }
};
exports.TaskController = TaskController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new task' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Task created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_task_dto_1.CreateTaskDto, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all tasks for the authenticated user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tasks retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific task by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Task retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Task not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a task' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Task updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Task not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_task_dto_1.UpdateTaskDto, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a task' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Task deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Task not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "remove", null);
exports.TaskController = TaskController = __decorate([
    (0, swagger_1.ApiTags)('tasks'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('tasks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [create_task_use_case_1.CreateTaskUseCase,
        update_task_use_case_1.UpdateTaskUseCase,
        delete_task_use_case_1.DeleteTaskUseCase,
        get_task_use_case_1.GetTaskUseCase,
        list_tasks_use_case_1.ListTasksUseCase])
], TaskController);
//# sourceMappingURL=task.controller.js.map