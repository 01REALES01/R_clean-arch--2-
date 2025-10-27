"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const delete_task_use_case_1 = require("./delete-task.use-case");
const task_entity_1 = require("../../../domain/entities/task.entity");
const common_1 = require("@nestjs/common");
describe('DeleteTaskUseCase', () => {
    let useCase;
    let mockTaskRepository;
    let mockEventPublisher;
    beforeEach(() => {
        mockTaskRepository = {
            create: jest.fn(),
            findById: jest.fn(),
            findByUserId: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };
        mockEventPublisher = {
            publish: jest.fn(),
        };
        useCase = new delete_task_use_case_1.DeleteTaskUseCase(mockTaskRepository, mockEventPublisher);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('execute', () => {
        it('should delete a task and publish TaskDeletedEvent', async () => {
            const userId = 'user-123';
            const taskId = 'task-123';
            const existingTask = task_entity_1.Task.create({
                id: taskId,
                userId,
                title: 'Task to Delete',
                description: 'Will be deleted',
                status: task_entity_1.TaskStatus.PENDING,
                priority: task_entity_1.TaskPriority.LOW,
                dueDate: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            mockTaskRepository.findById.mockResolvedValue(existingTask);
            mockTaskRepository.delete.mockResolvedValue(undefined);
            await useCase.execute(taskId, userId);
            expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
            expect(mockTaskRepository.delete).toHaveBeenCalledWith(taskId);
            expect(mockEventPublisher.publish).toHaveBeenCalledWith('task.deleted', expect.objectContaining({
                taskId: existingTask.id,
                userId: existingTask.userId,
                title: existingTask.title,
            }));
        });
        it('should throw NotFoundException if task does not exist', async () => {
            const userId = 'user-123';
            const taskId = 'non-existent-task';
            mockTaskRepository.findById.mockResolvedValue(null);
            await expect(useCase.execute(taskId, userId)).rejects.toThrow(common_1.NotFoundException);
            expect(mockTaskRepository.delete).not.toHaveBeenCalled();
            expect(mockEventPublisher.publish).not.toHaveBeenCalled();
        });
        it('should throw ForbiddenException if user does not own the task', async () => {
            const taskOwnerId = 'user-123';
            const differentUserId = 'user-456';
            const taskId = 'task-123';
            const existingTask = task_entity_1.Task.create({
                id: taskId,
                userId: taskOwnerId,
                title: 'Someone elses task',
                description: 'Not yours',
                status: task_entity_1.TaskStatus.PENDING,
                priority: task_entity_1.TaskPriority.LOW,
                dueDate: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            mockTaskRepository.findById.mockResolvedValue(existingTask);
            await expect(useCase.execute(taskId, differentUserId)).rejects.toThrow(common_1.ForbiddenException);
            expect(mockTaskRepository.delete).not.toHaveBeenCalled();
            expect(mockEventPublisher.publish).not.toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=delete-task.use-case.spec.js.map