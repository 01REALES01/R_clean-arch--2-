# 🚀 TaskFlow - Clean Architecture Microservices

A production-ready backend application built with **Clean Architecture**, **NestJS**, **PostgreSQL**, **Prisma**, and **RabbitMQ**.

---

## ✨ Features

- ✅ **Clean Architecture** - 4 layers with clear separation of concerns
- ✅ **Event-Driven** - RabbitMQ for async messaging
- ✅ **Authentication** - JWT with bcrypt password hashing
- ✅ **Task Management** - Full CRUD operations
- ✅ **Notifications** - Auto-generated via events
- ✅ **API Documentation** - Interactive Swagger UI
- ✅ **Type Safety** - Full TypeScript support
- ✅ **Database** - PostgreSQL with Prisma ORM

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│   Presentation Layer (Controllers)  │
│   REST API + Validated DTOs         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Application Layer (Use Cases)     │
│   Business Logic + Plain DTOs       │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Domain Layer (Core Business)      │
│   Entities + Repository Interfaces  │
└─────────────────────────────────────┘
              ↑
┌─────────────────────────────────────┐
│   Infrastructure (Implementations)  │
│   Prisma + JWT + RabbitMQ + Guards  │
└─────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

Create a `.env` file:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5436/taskflow?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"
RABBITMQ_URL="amqp://guest:guest@localhost:5672"
PORT=3000
NODE_ENV="development"
```

### 3. Start Infrastructure (Docker)

```bash
# PostgreSQL and RabbitMQ are already running via Docker
docker ps
```

### 4. Database Migration

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Start Server

```bash
npm run start:dev
```

### 6. Test API

Open **Swagger UI**: http://localhost:3000/api

---

## 📡 API Endpoints

### Authentication (Public)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT

### Tasks (Protected)
- `POST /tasks` - Create task
- `GET /tasks` - List all tasks
- `GET /tasks/:id` - Get specific task
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

### Notifications (Protected)
- `GET /notifications` - List all notifications
- `GET /notifications/unread-count` - Get unread count
- `PATCH /notifications/:id/read` - Mark as read
- `DELETE /notifications/:id` - Delete notification

---

## 🗂️ Project Structure

```
src/
├── domain/              # Core business logic
│   ├── entities/        # Domain models
│   ├── repositories/    # Repository interfaces
│   └── events/          # Domain events
│
├── application/         # Application business logic
│   ├── use-cases/       # Business operations
│   └── dto/             # Plain data transfer objects
│
├── infrastructure/      # External implementations
│   ├── database/        # Prisma repositories
│   ├── auth/            # JWT strategies & guards
│   └── messaging/       # RabbitMQ services
│
└── presentation/        # API layer
    ├── controllers/     # REST endpoints
    ├── dto/             # Validated DTOs
    └── module/          # Feature modules
```

---

## 📚 Documentation

All documentation is organized in the `docs/` folder.

**👉 [View Full Documentation Index](docs/INDEX.md)**

Quick links:
- **[Quick Test](docs/QUICK_TEST.md)** - 2-minute testing guide ⚡
- **[Architecture Overview](docs/ARCHITECTURE_OVERVIEW.md)** - How it all works 🏗️
- **[Testing Guide](docs/TESTING_GUIDE.md)** - Comprehensive testing 🧪
- **[Project Structure](docs/PROJECT_STRUCTURE.md)** - File organization 📁

---

## 🧪 Testing

### Via Swagger UI (Recommended)

1. Open http://localhost:3000/api
2. Register a user
3. Login and copy the JWT token
4. Click "Authorize" and paste token
5. Test all endpoints interactively

### Via PowerShell Script

```powershell
.\test-api.ps1
```

### Via REST Client

Open `test-api.http` in VS Code with REST Client extension.

---

## 🔄 Event-Driven Flow

```
User creates task
    ↓
Task saved to PostgreSQL
    ↓
Event published to RabbitMQ
    ↓
TaskEventHandler consumes event
    ↓
Notification created automatically
    ↓
User fetches notifications
```

---

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Messaging**: RabbitMQ
- **Authentication**: JWT + bcrypt
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator

---

## 📦 Available Scripts

```bash
npm run start         # Start production build
npm run start:dev     # Start with hot reload
npm run build         # Build for production
npm run test          # Run tests
npx prisma studio     # Open database GUI
```

---

## 🔍 Monitoring

- **API**: http://localhost:3000/api
- **RabbitMQ**: http://localhost:15672 (guest/guest)
- **Database**: `npx prisma studio`

---

## 🎯 Next Features

- [ ] WebSocket for real-time notifications
- [ ] Email notification service
- [ ] Background jobs (task reminders)
- [ ] Unit and integration tests
- [ ] Docker Compose setup
- [ ] CI/CD pipeline

---

## 📝 License

MIT

---

## 🤝 Contributing

Contributions are welcome! This project demonstrates Clean Architecture principles and event-driven design.

---

**Built with ❤️ using Clean Architecture and NestJS**
