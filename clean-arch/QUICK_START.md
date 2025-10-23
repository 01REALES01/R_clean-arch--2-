# 🚀 TaskFlow Quick Start Guide

## ✅ What's Been Created

### Complete Clean Architecture Structure

```
✅ Domain Layer - Business entities and repository interfaces
✅ Application Layer - Use cases and plain DTOs  
✅ Infrastructure Layer - Database, Auth, and Messaging implementations
✅ Presentation Layer - Controllers and validated DTOs
✅ RabbitMQ Integration - Event-driven architecture
✅ Prisma Schema - User, Task, and Notification models
```

## 📋 Required Actions

### 1. Install Missing Dependencies

```bash
cd clean-arch

# Install Swagger for API documentation
npm install @nestjs/swagger swagger-ui-express

# Install RabbitMQ dependencies
npm install amqplib @nestjs/microservices
npm install --save-dev @types/amqplib
```

### 2. Clean Up Old Template Files

**You mentioned you'll delete these manually:**

Delete these directories:
```
src/application/dto/         (old movie/director DTOs)
src/application/mappers/     (old mappers)
src/application/usecases/    (old movie/director use cases)
src/application/tokens.ts    (old token file)

src/presentation/controller/ (old movie/director controllers)

src/auth/auth.controller.ts  (duplicate - now in presentation/)
src/auth/dto/                (duplicate - now in presentation/)
src/auth/guards/             (duplicate - now in infrastructure/)
src/auth/strategies/         (duplicate - now in infrastructure/)
```

Keep these:
```
src/auth/auth.module.ts
src/auth/auth.service.ts
```

### 3. Setup Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your actual values
# DATABASE_URL="postgresql://username:password@localhost:5432/taskflow?schema=public"
# JWT_SECRET="your-secure-jwt-secret"
# RABBITMQ_URL="amqp://localhost:5672"
```

### 4. Start Infrastructure Services

**PostgreSQL** (if not running):
```bash
# Using Docker
docker run -d \
  --name postgres \
  -e POSTGRES_USER=taskflow \
  -e POSTGRES_PASSWORD=taskflow \
  -e POSTGRES_DB=taskflow \
  -p 5432:5432 \
  postgres:15
```

**RabbitMQ**:
```bash
docker run -d \
  --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management
```

### 5. Database Migration

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name init_taskflow

# (Optional) View database
npx prisma studio
```

### 6. Start Application

```bash
# Development mode with hot reload
npm run start:dev
```

## 🎯 API Testing

### 1. Register a User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "USER"
  }
}
```

### 3. Create a Task (with JWT)
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Complete TaskFlow setup",
    "description": "Finish implementing the microservices architecture",
    "priority": "HIGH",
    "dueDate": "2025-10-25T12:00:00Z"
  }'
```

### 4. Get All Tasks
```bash
curl -X GET http://localhost:3000/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Update Task Status
```bash
curl -X PATCH http://localhost:3000/tasks/{taskId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "IN_PROGRESS"
  }'
```

## 📚 Access Documentation

- **Swagger UI**: http://localhost:3000/api
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **Prisma Studio**: Run `npx prisma studio` → http://localhost:5555

## 🔍 Verify RabbitMQ Events

1. Open RabbitMQ Management UI: http://localhost:15672
2. Go to **Queues** tab
3. You should see:
   - `tasks_queue`
   - `notifications_queue`
   - `users_queue`
4. Create a task via API and check the queue for messages

## 🏗️ Architecture Overview

### DTO Flow (Clean Architecture)

```
API Request (with validators)
    ↓
Presentation DTO (validation decorators)
    ↓
Controller maps to Application DTO
    ↓
Application DTO (plain interface)
    ↓
Use Case
    ↓
Domain Entity
    ↓
Repository
    ↓
Database
```

### Event Flow

```
Use Case executes
    ↓
Publishes domain event via EventPublisher
    ↓
RabbitMQ receives event
    ↓
Event Handler consumes event
    ↓
Creates notification in database
```

## 🐛 Troubleshooting

### TypeScript Errors
```bash
# Regenerate Prisma Client
npx prisma generate

# Clean build
rm -rf dist node_modules
npm install
npm run build
```

### RabbitMQ Connection Errors
```bash
# Check if RabbitMQ is running
docker ps | grep rabbitmq

# Restart RabbitMQ
docker restart rabbitmq
```

### Database Connection Errors
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Test connection
npx prisma db pull
```

## 📊 Project Status

### ✅ Completed
- [x] Clean Architecture structure
- [x] Auth Service (register, login, JWT)
- [x] Task Service (CRUD operations)
- [x] RabbitMQ integration
- [x] Event-driven architecture
- [x] Prisma schema with migrations
- [x] DTOs in correct layers
- [x] Repository pattern
- [x] JWT authentication guards

### 🔜 Next Features
- [ ] Notification Service (complete implementation)
- [ ] Notification controller and endpoints
- [ ] Email/SMS sending
- [ ] Background jobs (task reminders)
- [ ] WebSocket for real-time updates
- [ ] Task categories and tags
- [ ] Recurring tasks
- [ ] Unit and integration tests

## 💡 Tips

1. **Always use the Swagger UI** for API testing (http://localhost:3000/api)
2. **Check RabbitMQ queues** to verify events are being published
3. **Use Prisma Studio** to inspect database records
4. **Follow clean architecture principles** when adding new features
5. **Keep DTOs separate** - Application DTOs (plain) vs Presentation DTOs (validated)

## 🎓 Understanding the Architecture

### Why Two DTOs?

**Application DTOs** (`src/application/dto/`):
- Plain interfaces
- Used by use cases
- No framework dependencies
- Business logic focused

**Presentation DTOs** (`src/presentation/dto/`):
- Class with decorators
- Validation rules
- Swagger documentation
- API contract focused

### Event-Driven Benefits

1. **Decoupling**: Services don't directly depend on each other
2. **Scalability**: Easy to add new event consumers
3. **Reliability**: Messages persist in queue if service is down
4. **Flexibility**: Change implementations without affecting producers

## 🚨 Important Notes

- **JWT_SECRET**: Change this in production!
- **Database credentials**: Use strong passwords
- **RabbitMQ**: Configure authentication in production
- **Prisma migrations**: Always backup before running in production
- **Error handling**: Add proper error handling in production

## 📞 Next Steps After Setup

1. Test all authentication endpoints
2. Test task CRUD operations
3. Verify RabbitMQ messages are being published
4. Check notifications are being created
5. Review the code structure
6. Start implementing additional features
7. Add unit tests
8. Add integration tests
9. Deploy to staging environment

Enjoy building TaskFlow! 🎉
