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
exports.CreateTaskUseCase = void 0;
const common_1 = require("@nestjs/common");
const task_entity_1 = require("../../../domain/entities/task.entity");
const event_publisher_port_1 = require("../../ports/event-publisher.port");
const repository_tokens_1 = require("../../tokens/repository.tokens");
let CreateTaskUseCase = class CreateTaskUseCase {
    constructor(taskRepository, eventPublisher) {
        this.taskRepository = taskRepository;
        this.eventPublisher = eventPublisher;
    }
    async execute(dto, userId) {
        const task = task_entity_1.Task.create({
            title: dto.title,
            description: dto.description || null,
            priority: dto.priority || task_entity_1.TaskPriority.MEDIUM,
            dueDate: dto.dueDate || null,
            userId,
        });
        const createdTask = await this.taskRepository.create(task);
        const event = {
            taskId: createdTask.id,
            userId: createdTask.userId,
            title: createdTask.title,
            dueDate: createdTask.dueDate,
            createdAt: createdTask.createdAt,
        };
        await this.eventPublisher.publish('task.created', event);
        return createdTask;
    }
};
exports.CreateTaskUseCase = CreateTaskUseCase;
exports.CreateTaskUseCase = CreateTaskUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(repository_tokens_1.TASK_REPOSITORY)),
    __param(1, (0, common_1.Inject)(event_publisher_port_1.EVENT_PUBLISHER)),
    __metadata("design:paramtypes", [Object, Object])
], CreateTaskUseCase);
//# sourceMappingURL=create-task.use-case.js.map