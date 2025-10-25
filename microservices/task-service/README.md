# 🚀 Task Service

Handles Authentication and Task Management. Publishes events to RabbitMQ.

## Port: 3000

## Endpoints

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT
- `POST /tasks` - Create task (publishes event)
- `GET /tasks` - List all tasks
- `GET /tasks/:id` - Get specific task
- `PATCH /tasks/:id` - Update task (publishes event)
- `DELETE /tasks/:id` - Delete task

## Setup

1. Create `.env` file:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5436/taskflow?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"
RABBITMQ_URL="amqp://guest:guest@localhost:5672"
PORT=3000
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

4. Access Swagger: http://localhost:3000/api

## Events Published

- `task.created` - When a task is created
- `task.updated` - When a task is updated
