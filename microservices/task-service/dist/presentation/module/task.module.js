"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const task_controller_1 = require("../controllers/task/task.controller");
const admin_controller_1 = require("../controllers/admin/admin.controller");
const create_task_use_case_1 = require("../../application/use-cases/task/create-task.use-case");
const update_task_use_case_1 = require("../../application/use-cases/task/update-task.use-case");
const delete_task_use_case_1 = require("../../application/use-cases/task/delete-task.use-case");
const get_task_use_case_1 = require("../../application/use-cases/task/get-task.use-case");
const list_tasks_use_case_1 = require("../../application/use-cases/task/list-tasks.use-case");
const prisma_task_repository_1 = require("../../infrastructure/database/repositories/prisma-task.repository");
const prisma_service_1 = require("../../infrastructure/database/prisma.service");
const jwt_strategy_1 = require("../../infrastructure/auth/strategies/jwt.strategy");
const repository_tokens_1 = require("../../application/tokens/repository.tokens");
let TaskModule = class TaskModule {
};
exports.TaskModule = TaskModule;
exports.TaskModule = TaskModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: { expiresIn: '1h' },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [task_controller_1.TaskController, admin_controller_1.AdminController],
        providers: [
            create_task_use_case_1.CreateTaskUseCase,
            update_task_use_case_1.UpdateTaskUseCase,
            delete_task_use_case_1.DeleteTaskUseCase,
            get_task_use_case_1.GetTaskUseCase,
            list_tasks_use_case_1.ListTasksUseCase,
            {
                provide: repository_tokens_1.TASK_REPOSITORY,
                useClass: prisma_task_repository_1.PrismaTaskRepository,
            },
            prisma_service_1.PrismaService,
            jwt_strategy_1.JwtStrategy,
        ],
        exports: [
            create_task_use_case_1.CreateTaskUseCase,
            update_task_use_case_1.UpdateTaskUseCase,
            delete_task_use_case_1.DeleteTaskUseCase,
            get_task_use_case_1.GetTaskUseCase,
            list_tasks_use_case_1.ListTasksUseCase,
        ],
    })
], TaskModule);
//# sourceMappingURL=task.module.js.map