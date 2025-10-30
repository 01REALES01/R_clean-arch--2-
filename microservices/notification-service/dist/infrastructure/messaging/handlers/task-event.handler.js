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
exports.TaskEventHandler = void 0;
const common_1 = require("@nestjs/common");
const rabbitmq_service_1 = require("../rabbitmq.service");
const notification_entity_1 = require("../../../domain/entities/notification.entity");
const repository_tokens_1 = require("../../../application/tokens/repository.tokens");
const email_service_1 = require("../../email/email.service");
const prisma_service_1 = require("../../database/prisma.service");
let TaskEventHandler = class TaskEventHandler {
    constructor(rabbitMQService, notificationRepository, emailService, prisma) {
        this.rabbitMQService = rabbitMQService;
        this.notificationRepository = notificationRepository;
        this.emailService = emailService;
        this.prisma = prisma;
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
                case 'task.deleted':
                    await this.handleTaskDeleted(data);
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
            title: `Task Created: ${event.title}`,
            message: `Your task has been created successfully.`,
            status: notification_entity_1.NotificationStatus.PENDING,
            metadata: {
                taskId: event.taskId,
                dueDate: event.dueDate,
            },
        });
        await this.notificationRepository.create(notification);
        console.log('✅ Notification created for task.created');
        await this.sendEmailForNotification(event.userId, notification);
    }
    async handleTaskUpdated(event) {
        console.log('📬 Handling task.updated event:', event);
        const notification = notification_entity_1.Notification.create({
            userId: event.userId,
            type: notification_entity_1.NotificationType.TASK_UPDATED,
            title: `Task Updated: ${event.title}`,
            message: `Your task has been updated. New status: ${event.status}`,
            status: notification_entity_1.NotificationStatus.PENDING,
            metadata: {
                taskId: event.taskId,
                status: event.status,
                dueDate: event.dueDate,
            },
        });
        await this.notificationRepository.create(notification);
        console.log('✅ Notification created for task.updated');
        await this.sendEmailForNotification(event.userId, notification);
    }
    async handleTaskDeleted(event) {
        console.log('📬 Handling task.deleted event:', event);
        const notification = notification_entity_1.Notification.create({
            userId: event.userId,
            type: notification_entity_1.NotificationType.TASK_DELETED,
            title: `Task Deleted: ${event.title}`,
            message: `Your task has been deleted.`,
            status: notification_entity_1.NotificationStatus.PENDING,
            metadata: {
                taskId: event.taskId,
                deletedAt: event.deletedAt,
            },
        });
        await this.notificationRepository.create(notification);
        console.log('✅ Notification created for task.deleted');
        await this.sendEmailForNotification(event.userId, notification);
    }
    async sendEmailForNotification(userId, notification) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { email: true },
            });
            if (!user) {
                console.log('⚠️  User not found, skipping email');
                return;
            }
            await this.emailService.sendTaskNotification({
                userEmail: user.email,
                title: notification.title,
                message: notification.message,
                taskDetails: notification.metadata,
            });
        }
        catch (error) {
            console.error('❌ Failed to send email notification:', error.message);
        }
    }
};
exports.TaskEventHandler = TaskEventHandler;
exports.TaskEventHandler = TaskEventHandler = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(repository_tokens_1.NOTIFICATION_REPOSITORY)),
    __metadata("design:paramtypes", [rabbitmq_service_1.RabbitMQService, Object, email_service_1.EmailService,
        prisma_service_1.PrismaService])
], TaskEventHandler);
//# sourceMappingURL=task-event.handler.js.map