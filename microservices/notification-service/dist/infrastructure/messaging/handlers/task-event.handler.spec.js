"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_event_handler_1 = require("./task-event.handler");
const notification_entity_1 = require("../../../domain/entities/notification.entity");
describe('TaskEventHandler', () => {
    let handler;
    let mockRabbitMQService;
    let mockNotificationRepository;
    beforeEach(() => {
        mockRabbitMQService = {
            consume: jest.fn(),
            publish: jest.fn(),
        };
        mockNotificationRepository = {
            create: jest.fn(),
            findByUserId: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };
        handler = new task_event_handler_1.TaskEventHandler(mockRabbitMQService, mockNotificationRepository);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('handleTaskCreated', () => {
        it('should create notification when task.created event is received', async () => {
            const event = {
                taskId: 'task-123',
                userId: 'user-123',
                title: 'New Task',
                dueDate: new Date('2025-12-31'),
                createdAt: new Date(),
            };
            await handler['handleTaskCreated'](event);
            expect(mockNotificationRepository.create).toHaveBeenCalledTimes(1);
            expect(mockNotificationRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                userId: event.userId,
                type: notification_entity_1.NotificationType.TASK_CREATED,
                title: 'New Task Created',
                message: expect.stringContaining(event.title),
                status: notification_entity_1.NotificationStatus.PENDING,
            }));
        });
    });
    describe('handleTaskUpdated', () => {
        it('should create notification when task.updated event is received', async () => {
            const event = {
                taskId: 'task-123',
                userId: 'user-123',
                title: 'Updated Task',
                status: 'IN_PROGRESS',
                dueDate: new Date('2025-12-31'),
                updatedAt: new Date(),
            };
            await handler['handleTaskUpdated'](event);
            expect(mockNotificationRepository.create).toHaveBeenCalledTimes(1);
            expect(mockNotificationRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                userId: event.userId,
                type: notification_entity_1.NotificationType.TASK_UPDATED,
                title: 'Task Updated',
                message: expect.stringContaining(event.title),
                status: notification_entity_1.NotificationStatus.PENDING,
            }));
        });
    });
    describe('handleTaskDeleted', () => {
        it('should create notification when task.deleted event is received', async () => {
            const event = {
                taskId: 'task-123',
                userId: 'user-123',
                title: 'Deleted Task',
                deletedAt: new Date(),
            };
            await handler['handleTaskDeleted'](event);
            expect(mockNotificationRepository.create).toHaveBeenCalledTimes(1);
            expect(mockNotificationRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                userId: event.userId,
                type: notification_entity_1.NotificationType.TASK_DELETED,
                title: 'Task Deleted',
                message: expect.stringContaining(event.title),
                status: notification_entity_1.NotificationStatus.PENDING,
            }));
        });
    });
});
//# sourceMappingURL=task-event.handler.spec.js.map