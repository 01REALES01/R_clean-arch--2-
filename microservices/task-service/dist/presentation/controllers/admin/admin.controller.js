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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../infrastructure/auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../../infrastructure/auth/guards/roles.guard");
const roles_decorator_1 = require("../../../infrastructure/auth/decorators/roles.decorator");
const user_entity_1 = require("../../../domain/entities/user.entity");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const list_tasks_use_case_1 = require("../../../application/use-cases/task/list-tasks.use-case");
const delete_task_use_case_1 = require("../../../application/use-cases/task/delete-task.use-case");
const task_entity_1 = require("../../../domain/entities/task.entity");
let AdminController = class AdminController {
    constructor(prisma, listTasksUseCase, deleteTaskUseCase) {
        this.prisma = prisma;
        this.listTasksUseCase = listTasksUseCase;
        this.deleteTaskUseCase = deleteTaskUseCase;
    }
    async getAllUsers() {
        const users = await this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
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
    async getUserTasks(userId, status) {
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
    async getAllTasks(status) {
        const where = {};
        if (status) {
            where.status = status;
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
    async getStatistics() {
        const [totalUsers, totalTasks, pendingTasks, inProgressTasks, completedTasks, totalNotifications,] = await Promise.all([
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
            },
        };
    }
    async deleteAnyTask(taskId) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
        });
        if (!task) {
            return { message: 'Task not found' };
        }
        await this.deleteTaskUseCase.execute(taskId, task.userId);
        return {
            message: 'Task deleted successfully by admin',
            taskId,
            originalOwner: task.userId,
        };
    }
    async deleteUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return { message: 'User not found' };
        }
        if (user.role === user_entity_1.UserRole.ADMIN) {
            return {
                message: 'Cannot delete admin users through this endpoint',
                hint: 'Use database access to manage admin users',
            };
        }
        await this.prisma.notification.deleteMany({
            where: { userId },
        });
        const deletedTasks = await this.prisma.task.deleteMany({
            where: { userId },
        });
        await this.prisma.user.delete({
            where: { id: userId },
        });
        return {
            message: 'User and all their data deleted successfully',
            userId,
            deletedTasks: deletedTasks.count,
        };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: '[ADMIN ONLY] Get all users' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Users retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)('users/:userId/tasks'),
    (0, swagger_1.ApiOperation)({ summary: '[ADMIN ONLY] Get all tasks for a specific user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tasks retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserTasks", null);
__decorate([
    (0, common_1.Get)('tasks/all'),
    (0, swagger_1.ApiOperation)({ summary: '[ADMIN ONLY] Get all tasks from all users' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All tasks retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllTasks", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, swagger_1.ApiOperation)({ summary: '[ADMIN ONLY] Get system statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistics retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Delete)('tasks/:taskId'),
    (0, swagger_1.ApiOperation)({ summary: '[ADMIN ONLY] Delete any task (from any user)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Task deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Task not found' }),
    __param(0, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteAnyTask", null);
__decorate([
    (0, common_1.Delete)('users/:userId'),
    (0, swagger_1.ApiOperation)({ summary: '[ADMIN ONLY] Delete a user and all their tasks' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteUser", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        list_tasks_use_case_1.ListTasksUseCase,
        delete_task_use_case_1.DeleteTaskUseCase])
], AdminController);
//# sourceMappingURL=admin.controller.js.map