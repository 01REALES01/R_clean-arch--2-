# 🏗️ TaskFlow Architecture Overview

## 📐 Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  Controllers (REST API) + Validated DTOs                    │
│  • AuthController                                           │
│  • TaskController                                           │
│  • NotificationController                                   │
└─────────────────────────────────────────────────────────────┘
                           ↓ uses ↓
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  Use Cases + Plain DTOs + Ports                             │
│  • RegisterUserUseCase                                      │
│  • CreateTaskUseCase                                        │
│  • GetNotificationsUseCase                                  │
│  • EventPublisherPort (interface)                           │
└─────────────────────────────────────────────────────────────┘
                           ↓ uses ↓
┌─────────────────────────────────────────────────────────────┐
│                      Domain Layer                            │
│  Entities + Repository Interfaces + Events                  │
│  • User, Task, Notification (entities)                      │
│  • UserRepository, TaskRepository (interfaces)              │
│  • TaskCreatedEvent, TaskUpdatedEvent                       │
└─────────────────────────────────────────────────────────────┘
                           ↑ implements ↑
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                        │
│  Database + Auth + Messaging (implementations)              │
│  • PrismaUserRepository                                     │
│  • JwtStrategy, JwtAuthGuard                                │
│  • RabbitMQService, EventPublisherAdapter                   │
│  • TaskEventHandler                                         │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Event-Driven Flow

### Task Creation Flow

```
1. User Request (HTTP POST /tasks)
         ↓
2. TaskController receives request
         ↓
3. Validates with CreateTaskDto (class-validator)
         ↓
4. Maps to Application DTO (plain interface)
         ↓
5. CreateTaskUseCase.execute()
         ↓
6. Creates Task Entity (domain logic)
         ↓
7. Saves via TaskRepository → Prisma → PostgreSQL
         ↓
8. Publishes TaskCreatedEvent → RabbitMQ
         ↓
9. Returns Task to Controller
         ↓
10. Returns JSON response to User

Meanwhile, asynchronously:

RabbitMQ → TaskEventHandler.handleTaskCreated()
         ↓
Creates Notification Entity
         ↓
Saves via NotificationRepository → PostgreSQL
         ↓
User can GET /notifications to see it
```

## 📦 Module Structure

### App Module (Root)
```typescript
AppModule
├── ConfigModule (global)
├── MessagingModule (global - RabbitMQ)
├── AuthModule (JWT + Passport)
├── TaskModule (Task CRUD)
└── NotificationModule (Notification CRUD)
```

### Task Module Dependencies
```typescript
TaskModule
├── Controllers: TaskController
├── Use Cases:
│   ├── CreateTaskUseCase
│   ├── UpdateTaskUseCase
│   ├── GetTaskUseCase
│   ├── ListTasksUseCase
│   └── DeleteTaskUseCase
├── Repositories:
│   └── TASK_REPOSITORY → PrismaTaskRepository
├── Auth: JwtStrategy, JwtAuthGuard
└── Infrastructure: PrismaService
```

### Notification Module Dependencies
```typescript
NotificationModule
├── Controllers: NotificationController
├── Use Cases:
│   ├── GetNotificationsUseCase
│   ├── MarkNotificationReadUseCase
│   ├── GetUnreadCountUseCase
│   └── DeleteNotificationUseCase
├── Repositories:
│   └── NOTIFICATION_REPOSITORY → PrismaNotificationRepository
├── Auth: JwtStrategy, JwtAuthGuard
└── Infrastructure: PrismaService
```

### Messaging Module (Global)
```typescript
MessagingModule (global)
├── RabbitMQService (connection management)
├── EventPublisherAdapter (implements EventPublisherPort)
├── TaskEventHandler (consumes task events)
└── RabbitMQ Config
```

## 🗂️ File Organization

```
src/
├── domain/                      # Core Business Logic (No dependencies)
│   ├── entities/
│   │   ├── user.entity.ts       # User domain model
│   │   ├── task.entity.ts       # Task domain model + business rules
│   │   └── notification.entity.ts
│   ├── repositories/            # Repository interfaces (contracts)
│   │   ├── user.repository.ts
│   │   ├── task.repository.ts
│   │   └── notification.repository.ts
│   └── events/                  # Domain events
│       ├── user.events.ts
│       └── task.events.ts
│
├── application/                 # Application Business Logic
│   ├── dto/                     # Plain interfaces (no decorators)
│   │   ├── auth/
│   │   │   ├── register-user.dto.ts
│   │   │   └── login-user.dto.ts
│   │   └── task/
│   │       ├── create-task.dto.ts
│   │       └── update-task.dto.ts
│   ├── use-cases/               # Business operations
│   │   ├── auth/
│   │   │   ├── register-user.use-case.ts
│   │   │   ├── login-user.use-case.ts
│   │   │   └── get-user-profile.use-case.ts
│   │   ├── task/
│   │   │   ├── create-task.use-case.ts
│   │   │   ├── update-task.use-case.ts
│   │   │   ├── get-task.use-case.ts
│   │   │   ├── list-tasks.use-case.ts
│   │   │   └── delete-task.use-case.ts
│   │   └── notification/
│   │       ├── get-notifications.use-case.ts
│   │       ├── mark-notification-read.use-case.ts
│   │       ├── get-unread-count.use-case.ts
│   │       └── delete-notification.use-case.ts
│   ├── ports/                   # Interfaces for external services
│   │   └── event-publisher.port.ts
│   └── tokens/
│       └── repository.tokens.ts # DI tokens
│
├── infrastructure/              # External Concerns
│   ├── database/
│   │   ├── repositories/        # Prisma implementations
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
│       ├── rabbitmq.service.ts         # RabbitMQ connection
│       ├── rabbitmq.config.ts
│       ├── event-publisher.adapter.ts  # Implements EventPublisherPort
│       ├── messaging.module.ts
│       └── handlers/
│           └── task-event.handler.ts   # Consumes events
│
├── presentation/                # API Layer
│   ├── controllers/             # REST endpoints
│   │   ├── auth/
│   │   │   └── auth.controller.ts
│   │   ├── task/
│   │   │   └── task.controller.ts
│   │   └── notification/
│   │       └── notification.controller.ts
│   ├── dto/                     # Validated DTOs (class-validator)
│   │   ├── login.dto.ts
│   │   ├── register.dto.ts
│   │   ├── task/
│   │   │   ├── create-task.dto.ts
│   │   │   └── update-task.dto.ts
│   │   └── notification/
│   │       └── notification-response.dto.ts
│   └── module/                  # Feature modules
│       ├── task.module.ts
│       └── notification.module.ts
│
├── auth/                        # Legacy auth module (refactor later)
│   ├── auth.module.ts
│   └── auth.service.ts
│
├── app.module.ts                # Root module
└── main.ts                      # Application entry point
```

## 🔐 Authentication Flow

```
1. User sends credentials (POST /auth/login)
         ↓
2. AuthController → LocalAuthGuard
         ↓
3. LocalAuthGuard → LocalStrategy
         ↓
4. LocalStrategy validates username/password
         ↓
5. AuthService.validateUser() → checks DB
         ↓
6. If valid → AuthService.login()
         ↓
7. Generates JWT token (userId + email)
         ↓
8. Returns { access_token, user }
         ↓
9. Client stores token
         ↓
10. Client sends token in header:
    Authorization: Bearer <token>
         ↓
11. Protected routes → JwtAuthGuard
         ↓
12. JwtAuthGuard → JwtStrategy
         ↓
13. JwtStrategy validates token
         ↓
14. Extracts user info → req.user
         ↓
15. Controller can access req.user.id
```

## 🔄 Dependency Injection

### Repository Injection Pattern

```typescript
// 1. Define interface in domain layer
export interface TaskRepository {
  create(task: Task): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  // ...
}

// 2. Create DI token
export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY');

// 3. Implement in infrastructure layer
@Injectable()
export class PrismaTaskRepository implements TaskRepository {
  constructor(private prisma: PrismaService) {}
  // implementation...
}

// 4. Register in module
providers: [
  {
    provide: TASK_REPOSITORY,
    useClass: PrismaTaskRepository,
  }
]

// 5. Inject in use case
export class CreateTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) {}
}
```

### Why This Pattern?

✅ **Testability**: Easy to mock repositories in tests  
✅ **Flexibility**: Can swap Prisma for MongoDB without changing use cases  
✅ **Clean Architecture**: Use cases depend on interfaces, not implementations  
✅ **Type Safety**: Full TypeScript support  

## 📊 Database Schema

```sql
User (id, email, password, role, createdAt, updatedAt)
  ├── 1:N → Task
  └── 1:N → Notification

Task (id, title, description, status, priority, dueDate, userId, createdAt, updatedAt)
  └── N:1 → User

Notification (id, userId, type, title, message, status, metadata, createdAt, sentAt)
  └── N:1 → User

Enums:
  - UserRole: USER, ADMIN
  - TaskStatus: PENDING, IN_PROGRESS, COMPLETED, CANCELLED
  - TaskPriority: LOW, MEDIUM, HIGH, URGENT
  - NotificationType: TASK_CREATED, TASK_UPDATED, TASK_DUE_SOON, TASK_OVERDUE, DAILY_SUMMARY
  - NotificationStatus: PENDING, READ, SENT, FAILED
```

## 🎯 Key Design Decisions

### 1. Two Types of DTOs

**Application DTOs** (`src/application/dto/`)
- Plain TypeScript interfaces
- No decorators or framework dependencies
- Used by use cases (business logic)
- Example: `CreateTaskDto` (interface)

**Presentation DTOs** (`src/presentation/dto/`)
- Classes with validation decorators
- Framework-specific (class-validator, Swagger)
- Used by controllers (API layer)
- Example: `CreateTaskDto` (class)

**Why?** Keeps business logic independent of frameworks

### 2. Repository Pattern

- Domain defines interfaces
- Infrastructure provides implementations
- Use cases depend on interfaces
- Easy to swap databases

### 3. Event-Driven Architecture

- Use cases publish events after operations
- Event handlers consume events asynchronously
- Decouples services
- Enables scalability

### 4. Dependency Injection

- Tokens for repository injection
- Constructor injection everywhere
- NestJS handles DI container

## 📈 Scalability Considerations

### Current Setup (Monolith)
```
API Server
├── Business Logic (Use Cases)
├── Database Access (Repositories)
└── Event Publisher (RabbitMQ)

Event Consumer (same app)
└── Event Handlers
```

### Future Microservices Setup
```
Task Service (separate app)
├── Task Use Cases
├── Task Repository
└── Publishes: task.* events

Notification Service (separate app)
├── Listens: task.*, user.* events
├── Notification Use Cases
└── Sends emails/push notifications

API Gateway
└── Routes requests to services
```

**Migration Path:**
1. Current: All in one NestJS app ✅
2. Step 1: Extract services into separate modules
3. Step 2: Deploy services independently
4. Step 3: Use RabbitMQ for inter-service communication
5. Result: Scalable microservices architecture

## 🎓 Learning Resources

To understand this architecture better:

1. **Clean Architecture** by Robert C. Martin
2. **Domain-Driven Design** by Eric Evans
3. **NestJS Documentation**: https://docs.nestjs.com
4. **Prisma Docs**: https://www.prisma.io/docs
5. **RabbitMQ Tutorials**: https://www.rabbitmq.com/tutorials

## 🔍 Code Walkthrough Example

### Creating a Task (End-to-End)

**1. User makes request:**
```http
POST /tasks
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "title": "Write docs",
  "priority": "HIGH"
}
```

**2. Hits TaskController:**
```typescript
@Post()
async create(@Body() dto: CreateTaskDto, @Request() req) {
  // dto is validated by class-validator
  const appDto = { ...dto, dueDate: new Date(dto.dueDate) };
  return this.createTaskUseCase.execute(appDto, req.user.id);
}
```

**3. Executes CreateTaskUseCase:**
```typescript
async execute(dto: CreateTaskDto, userId: string) {
  const task = Task.create({ ...dto, userId });
  const savedTask = await this.taskRepository.create(task);
  
  // Publish event
  await this.eventPublisher.publish(
    'tasks_queue',
    'task.created',
    new TaskCreatedEvent(savedTask)
  );
  
  return savedTask;
}
```

**4. Saves to database via PrismaTaskRepository:**
```typescript
async create(task: Task): Promise<Task> {
  const created = await this.prisma.task.create({
    data: { title: task.title, ... }
  });
  return this.toDomain(created);
}
```

**5. Publishes event to RabbitMQ:**
```typescript
await this.rabbitMQService.publish('tasks_queue', {
  pattern: 'task.created',
  data: { taskId, title, userId, ... }
});
```

**6. TaskEventHandler consumes event:**
```typescript
private async handleTaskCreated(event: TaskCreatedEvent) {
  const notification = Notification.create({
    userId: event.userId,
    type: NotificationType.TASK_CREATED,
    title: 'New Task Created',
    message: `Your task "${event.title}" has been created.`
  });
  
  await this.notificationRepository.create(notification);
}
```

**7. Notification saved to database**

**8. User can fetch notifications:**
```http
GET /notifications
Authorization: Bearer eyJhbGc...

Response:
[{
  "id": "...",
  "type": "TASK_CREATED",
  "title": "New Task Created",
  "message": "Your task \"Write docs\" has been created."
}]
```

---

## 🎉 Summary

This architecture provides:

✅ **Separation of Concerns**: Each layer has clear responsibility  
✅ **Testability**: Easy to unit test use cases  
✅ **Maintainability**: Changes in one layer don't affect others  
✅ **Scalability**: Can extract into microservices later  
✅ **Flexibility**: Easy to swap implementations  
✅ **Type Safety**: Full TypeScript support  
✅ **Modern Stack**: NestJS + Prisma + RabbitMQ  

Perfect for learning and production use! 🚀

