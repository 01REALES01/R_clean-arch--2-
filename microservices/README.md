# TaskFlow Microservices

Two independent services that communicate via RabbitMQ events.

---

## Services

**Task Service (Port 3000)**
- Authentication (register, login)
- Task management (CRUD)
- Publishes events to RabbitMQ

**Notification Service (Port 3001)**
- Notification management
- Consumes events from RabbitMQ
- Auto-creates notifications

---

## Quick Start

### 1. Start Infrastructure (PostgreSQL + RabbitMQ)
```bash
cd ../clean-arch
docker-compose up -d
```

### 2. Start Task Service (Terminal 1)
```bash
cd task-service
npm run start:dev
```

### 3. Start Notification Service (Terminal 2)
```bash
cd notification-service
npm run start:dev
```

### 4. Access APIs
- Task Service: http://localhost:3000/api
- Notification Service: http://localhost:3001/api
- RabbitMQ UI: http://localhost:15672 (guest/guest)

---

## How It Works

```
Create Task → Saved to DB → Event to RabbitMQ → Notification Service → Creates Notification
```

---

## Testing

See `TESTING_GUIDE.md` for complete API testing flows.

---

## About clean-arch Folder

- Keep it as backup
- Use its `docker-compose.yml` for PostgreSQL + RabbitMQ
- Don't run the app from there anymore
- Work in `microservices/` from now on
