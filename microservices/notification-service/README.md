# 🔔 Notification Service

Handles Notifications. Consumes events from RabbitMQ and creates notifications automatically.

## Port: 3001

## Endpoints

- `GET /notifications` - List all notifications
- `GET /notifications/unread-count` - Get unread count
- `PATCH /notifications/:id/read` - Mark as read
- `DELETE /notifications/:id` - Delete notification

## Setup

1. Create `.env` file:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5436/taskflow?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"
RABBITMQ_URL="amqp://guest:guest@localhost:5672"
PORT=3001
NODE_ENV="development"
```

2. Install dependencies:
```bash
npm install
```

3. Start service:
```bash
npm run start:dev
```

4. Access Swagger: http://localhost:3001/api

## Events Consumed

- `task.created` - Creates notification when task is created
- `task.updated` - Creates notification when task is updated

## How It Works

1. Task Service publishes event → RabbitMQ
2. This service consumes event
3. Automatically creates notification in database
4. User can GET notifications via API
