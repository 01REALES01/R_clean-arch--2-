"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const create_task_use_case_1 = require("./create-task.use-case");
const task_entity_1 = require("../../../domain/entities/task.entity");
describe('CreateTaskUseCase', () => {
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
        useCase = new create_task_use_case_1.CreateTaskUseCase(mockTaskRepository, mockEventPublisher);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('execute', () => {
        it('should create a task and publish TaskCreatedEvent', async () => {
            const userId = 'user-123';
            const taskData = {
                title: 'Test Task',
                description: 'Test Description',
                dueDate: '2025-12-31',
                priority: task_entity_1.TaskPriority.HIGH,
            };
            const createdTask = task_entity_1.Task.create({
                id: 'task-123',
                userId,
                title: taskData.title,
                description: taskData.description,
                status: task_entity_1.TaskStatus.TODO,
                priority: taskData.priority,
                dueDate: new Date(taskData.dueDate),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            mockTaskRepository.create.mockResolvedValue(createdTask);
            const result = await useCase.execute(taskData, userId);
            expect(mockTaskRepository.create).toHaveBeenCalledTimes(1);
            expect(mockTaskRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                userId,
                title: taskData.title,
                description: taskData.description,
                status: task_entity_1.TaskStatus.TODO,
                priority: taskData.priority,
            }));
            expect(mockEventPublisher.publish).toHaveBeenCalledTimes(1);
            expect(mockEventPublisher.publish).toHaveBeenCalledWith('task.created', expect.objectContaining({
                taskId: createdTask.id,
                userId: createdTask.userId,
                title: createdTask.title,
            }));
            expect(result).toEqual(createdTask);
        });
        it('should handle missing optional fields', async () => {
            const userId = 'user-456';
            const taskData = {
                title: 'Simple Task',
                description: 'Simple Description',
            };
            const createdTask = task_entity_1.Task.create({
                id: 'task-456',
                userId,
                title: taskData.title,
                description: taskData.description,
                status: task_entity_1.TaskStatus.TODO,
                priority: task_entity_1.TaskPriority.MEDIUM,
                dueDate: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            mockTaskRepository.create.mockResolvedValue(createdTask);
            const result = await useCase.execute(taskData, userId);
            expect(result.dueDate).toBeNull();
            expect(result.priority).toBe(task_entity_1.TaskPriority.MEDIUM);
            expect(mockEventPublisher.publish).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=create-task.use-case.spec.js.map