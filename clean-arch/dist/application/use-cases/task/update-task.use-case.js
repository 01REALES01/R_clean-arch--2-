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
exports.UpdateTaskUseCase = void 0;
const common_1 = require("@nestjs/common");
const event_publisher_port_1 = require("../../ports/event-publisher.port");
const repository_tokens_1 = require("../../tokens/repository.tokens");
let UpdateTaskUseCase = class UpdateTaskUseCase {
    constructor(taskRepository, eventPublisher) {
        this.taskRepository = taskRepository;
        this.eventPublisher = eventPublisher;
    }
    async execute(taskId, dto, userId) {
        const task = await this.taskRepository.findById(taskId);
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        if (task.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to update this task');
        }
        if (dto.title !== undefined)
            task.title = dto.title;
        if (dto.description !== undefined)
            task.description = dto.description;
        if (dto.status !== undefined)
            task.status = dto.status;
        if (dto.priority !== undefined)
            task.priority = dto.priority;
        if (dto.dueDate !== undefined)
            task.dueDate = new Date(dto.dueDate);
        task.updatedAt = new Date();
        const updatedTask = await this.taskRepository.update(task);
        const event = {
            taskId: updatedTask.id,
            userId: updatedTask.userId,
            title: updatedTask.title,
            status: updatedTask.status,
            dueDate: updatedTask.dueDate,
            updatedAt: updatedTask.updatedAt,
        };
        await this.eventPublisher.publish('task.updated', event);
        return updatedTask;
    }
};
exports.UpdateTaskUseCase = UpdateTaskUseCase;
exports.UpdateTaskUseCase = UpdateTaskUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(repository_tokens_1.TASK_REPOSITORY)),
    __param(1, (0, common_1.Inject)(event_publisher_port_1.EVENT_PUBLISHER)),
    __metadata("design:paramtypes", [Object, Object])
], UpdateTaskUseCase);
//# sourceMappingURL=update-task.use-case.js.map