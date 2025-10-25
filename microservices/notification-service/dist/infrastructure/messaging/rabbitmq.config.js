"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventPatterns = exports.rabbitMQConfig = void 0;
const microservices_1 = require("@nestjs/microservices");
exports.rabbitMQConfig = {
    transport: microservices_1.Transport.RMQ,
    options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
        queue: process.env.RABBITMQ_QUEUE || 'taskflow_queue',
        queueOptions: {
            durable: true,
        },
        noAck: false,
        prefetchCount: 1,
    },
};
exports.EventPatterns = {
    USER_REGISTERED: 'user.registered',
    TASK_CREATED: 'task.created',
    TASK_UPDATED: 'task.updated',
    TASK_DUE_SOON: 'task.due_soon',
    TASK_OVERDUE: 'task.overdue',
    SEND_NOTIFICATION: 'notification.send',
};
//# sourceMappingURL=rabbitmq.config.js.map