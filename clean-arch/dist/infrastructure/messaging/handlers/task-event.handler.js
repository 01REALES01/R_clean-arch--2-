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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskEventHandler = void 0;
const common_1 = require("@nestjs/common");
const rabbitmq_service_1 = require("../rabbitmq.service");
const notification_entity_1 = require("../../../domain/entities/notification.entity");
let TaskEventHandler = class TaskEventHandler {
    constructor(rabbitMQService, notificationRepository) {
        this.rabbitMQService = rabbitMQService;
        this.notificationRepository = notificationRepository;
    }
    async onModuleInit() {
        await this.consumeTaskEvents();
    }
    async consumeTaskEvents() {
        await this.rabbitMQService.consume('tasks_queue', async (message) => {
            const { pattern, data } = message;
            switch (pattern) {
                case 'task.created':
                    await this.handleTaskCreated(data);
                    break;
                case 'task.updated':
                    await this.handleTaskUpdated(data);
                    break;
                default:
                    console.log(`Unknown pattern: ${pattern}`);
            }
        });
    }
    async handleTaskCreated(event) {
        console.log('📬 Handling task.created event:', event);
        const notification = notification_entity_1.Notification.create({
            userId: event.userId,
            type: notification_entity_1.NotificationType.TASK_CREATED,
            title: 'New Task Created',
            message: `Your task "${event.title}" has been created successfully.`,
            status: notification_entity_1.NotificationStatus.PENDING,
            metadata: {
                taskId: event.taskId,
                dueDate: event.dueDate,
            },
        });
        await this.notificationRepository.create(notification);
        console.log('✅ Notification created for task.created');
    }
    async handleTaskUpdated(event) {
        console.log('📬 Handling task.updated event:', event);
        const notification = notification_entity_1.Notification.create({
            userId: event.userId,
            type: notification_entity_1.NotificationType.TASK_UPDATED,
            title: 'Task Updated',
            message: `Your task "${event.title}" has been updated. Status: ${event.status}`,
            status: notification_entity_1.NotificationStatus.PENDING,
            metadata: {
                taskId: event.taskId,
                status: event.status,
                dueDate: event.dueDate,
            },
        });
        await this.notificationRepository.create(notification);
        console.log('✅ Notification created for task.updated');
    }
};
exports.TaskEventHandler = TaskEventHandler;
exports.TaskEventHandler = TaskEventHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rabbitmq_service_1.RabbitMQService, Object])
], TaskEventHandler);
//# sourceMappingURL=task-event.handler.js.map