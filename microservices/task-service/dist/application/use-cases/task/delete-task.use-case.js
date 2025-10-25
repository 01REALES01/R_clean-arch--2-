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
exports.DeleteTaskUseCase = void 0;
const common_1 = require("@nestjs/common");
const repository_tokens_1 = require("../../tokens/repository.tokens");
let DeleteTaskUseCase = class DeleteTaskUseCase {
    constructor(taskRepository) {
        this.taskRepository = taskRepository;
    }
    async execute(taskId, userId) {
        const task = await this.taskRepository.findById(taskId);
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        if (task.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to delete this task');
        }
        await this.taskRepository.delete(taskId);
    }
};
exports.DeleteTaskUseCase = DeleteTaskUseCase;
exports.DeleteTaskUseCase = DeleteTaskUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(repository_tokens_1.TASK_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], DeleteTaskUseCase);
//# sourceMappingURL=delete-task.use-case.js.map