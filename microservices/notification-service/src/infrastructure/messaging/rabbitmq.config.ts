import { Transport } from '@nestjs/microservices';

export const rabbitMQConfig = {
  transport: Transport.RMQ,
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

// Event Patterns
export const EventPatterns = {
  // User Events
  USER_REGISTERED: 'user.registered',
  
  // Task Events
  TASK_CREATED: 'task.created',
  TASK_UPDATED: 'task.updated',
  TASK_DUE_SOON: 'task.due_soon',
  TASK_OVERDUE: 'task.overdue',
  
  // Notification Events
  SEND_NOTIFICATION: 'notification.send',
};
