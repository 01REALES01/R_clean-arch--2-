# TaskFlow - Clean Architecture Setup Guide

## 📋 Project Overview

TaskFlow is a backend microservices application for managing tasks, habits, and personal goals. Built with Clean Architecture principles using NestJS, PostgreSQL, Prisma, and RabbitMQ.

## 🏗️ Architecture Layers

### **Domain Layer** (`src/domain/`)
Core business logic with no external dependencies.
- **Entities**: User, Task, Notification
- **Repository Interfaces**: Define contracts for data access
- **Events**: Domain events for inter-service communication

### **Application Layer** (`src/application/`)
Application business logic and use cases.
- **Use Cases**: Business operations (register, login, create task, etc.)
- **DTOs**: Plain data transfer objects (no validation decorators)
- **Ports**: Interfaces for external services

### **Infrastructure Layer** (`src/infrastructure/`)
External concerns and implementations.
- **Database**: Prisma repositories implementing domain interfaces
- **Auth**: JWT strategies and guards
- **Messaging**: RabbitMQ service and event publishers

### **Presentation Layer** (`src/presentation/`)
API layer and user interaction.
- **Controllers**: REST API endpoints
- **DTOs**: Request/Response DTOs with validation decorators
- **Modules**: NestJS module configurations

## 📁 Project Structure

```
src/
├── domain/
│   ├── entities/
│   │   ├── user.entity.ts          # User domain model
│   │   ├── task.entity.ts          # Task domain model
│   │   └── notification.entity.ts  # Notification domain model
│   ├── repositories/
│   │   ├── user.repository.ts      # User repository interface
│   │   ├── task.repository.ts      # Task repository interface
│   │   └── notification.repository.ts
│   └── events/
│       ├── user.events.ts          # User domain events
│       └── task.events.ts          # Task domain events
│
├── application/
│   ├── dto/
│   │   ├── auth/
│   │   │   ├── register-user.dto.ts
│   │   │   └── login-user.dto.ts
│   │   └── task/
│   │       ├── create-task.dto.ts
│   │       └── update-task.dto.ts
│   ├── use-cases/
│   │   ├── auth/
│   │   │   ├── register-user.use-case.ts
│   │   │   ├── login-user.use-case.ts
│   │   │   └── get-user-profile.use-case.ts
│   │   └── task/
│   │       ├── create-task.use-case.ts
│   │       ├── update-task.use-case.ts
│   │       ├── delete-task.use-case.ts
│   │       ├── get-task.use-case.ts
│   │       └── list-tasks.use-case.ts
│   └── ports/
│       └── event-publisher.port.ts
│
├── infrastructure/
│   ├── database/
│   │   ├── repositories/
│   │   │   ├── prisma-user.repository.ts
│   │   │   ├── prisma-task.repository.ts
│   │   │   └── prisma-notification.repository.ts
│   │   └── prisma.service.ts
│   ├── auth/
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── local-auth.guard.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   └── messaging/
│       ├── rabbitmq.service.ts
│       ├── rabbitmq.config.ts
│       ├── event-publisher.adapter.ts
│       ├── messaging.module.ts
│       └── handlers/
│           └── task-event.handler.ts
│
├── presentation/
│   ├── controllers/
│   │   ├── auth/
│   │   │   └── auth.controller.ts
│   │   └── task/
│   │       └── task.controller.ts
│   ├── dto/
│   │   ├── login.dto.ts (with validators)
│   │   ├── register.dto.ts (with validators)
│   │   └── task/
│   │       ├── create-task.dto.ts (with validators)
│   │       └── update-task.dto.ts (with validators)
│   └── module/
│       └── task.module.ts
│
├── auth/
│   ├── auth.module.ts
│   └── auth.service.ts
│
├── app.module.ts
└── main.ts
```

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
# Core dependencies (already installed)
npm install

# Additional dependencies for TaskFlow
npm install @nestjs/swagger swagger-ui-express
npm install amqplib @nestjs/microservices
npm install --save-dev @types/amqplib
```

### 2. Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update the following variables:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/taskflow?schema=public"
JWT_SECRET="your-secure-jwt-secret-key"
RABBITMQ_URL="amqp://localhost:5672"
PORT=3000
```

### 3. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Create and run migrations
npx prisma migrate dev --name init_taskflow

# (Optional) Open Prisma Studio
npx prisma studio
```

### 4. Start RabbitMQ

Using Docker:
```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

Access RabbitMQ Management UI: http://localhost:15672
- Username: `guest`
- Password: `guest`

### 5. Run the Application

```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start
```

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Tasks (Protected - requires JWT)
- `POST /tasks` - Create task
- `GET /tasks` - List all tasks (with optional status filter)
- `GET /tasks/:id` - Get specific task
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

### API Documentation
Access Swagger UI: http://localhost:3000/api

## 🔄 Event-Driven Architecture

### Published Events

**Task Events:**
- `task.created` - Published when a task is created
- `task.updated` - Published when a task is updated

**User Events:**
- `user.registered` - Published when a user registers

### RabbitMQ Queues

- `tasks_queue` - Task-related events
- `notifications_queue` - Notification events
- `users_queue` - User-related events

## 🗃️ Database Schema

### User
- id (UUID)
- email (unique)
- password (hashed)
- role (USER | ADMIN)
- createdAt, updatedAt

### Task
- id (UUID)
- title
- description (optional)
- status (PENDING | IN_PROGRESS | COMPLETED | CANCELLED)
- priority (LOW | MEDIUM | HIGH | URGENT)
- dueDate (optional)
- userId (FK to User)
- createdAt, updatedAt

### Notification
- id (UUID)
- userId (FK to User)
- type (TASK_CREATED | TASK_UPDATED | TASK_DUE_SOON | etc.)
- title
- message
- status (PENDING | SENT | FAILED)
- metadata (JSON)
- createdAt, sentAt

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

## 🔐 Authentication Flow

1. User registers via `/auth/register`
2. User logs in via `/auth/login` → receives JWT token
3. User includes JWT in `Authorization: Bearer <token>` header
4. Protected routes validate JWT and extract user info

## 📦 Clean Architecture Benefits

1. **Independence**: Business logic doesn't depend on frameworks
2. **Testability**: Easy to test use cases in isolation
3. **Flexibility**: Easy to swap implementations (e.g., change database)
4. **Maintainability**: Clear separation of concerns
5. **Scalability**: Easy to add new features or microservices

## 🔜 Next Steps

1. **Implement Notification Service**
   - Create notification use cases
   - Add notification controller
   - Implement email/SMS sending

2. **Add Background Jobs**
   - Task due date reminders
   - Daily task summaries
   - Overdue task alerts

3. **Implement WebSockets**
   - Real-time task updates
   - Live notifications

4. **Add More Features**
   - Task categories/tags
   - Task priorities
   - Recurring tasks
   - Task sharing/collaboration

## 📝 Notes

- The lint errors you see are because `node_modules` need to be installed
- Run `npm install` to resolve all TypeScript errors
- Make sure PostgreSQL and RabbitMQ are running before starting the app
- The application follows strict clean architecture with DTOs in both application and presentation layers
