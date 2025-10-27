# 🐳 **Docker Deployment Guide**

Your entire TaskFlow microservices project now runs in Docker containers!

---

## 📋 **Table of Contents**

1. [Quick Start](#quick-start)
2. [What's Running in Docker](#whats-running-in-docker)
3. [Commands](#commands)
4. [Testing the Application](#testing-the-application)
5. [Configuration](#configuration)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 **Quick Start**

### **Prerequisites:**
- Docker Desktop installed and running
- Git (to clone/share the project)

### **Start Everything:**

```bash
# Navigate to microservices folder
cd microservices

# Start all services (first time will build images)
docker-compose up -d

# View logs (optional)
docker-compose logs -f
```

**That's it!** Your entire application is running.

---

## 🎯 **What's Running in Docker**

| Service | Container Name | Port | Description |
|---------|---------------|------|-------------|
| **PostgreSQL** | `taskflow_db` | 5436 | Shared database |
| **RabbitMQ** | `taskflow_rabbitmq` | 5672, 15672 | Message broker |
| **Task Service** | `taskflow_task_service` | 3000 | Auth + Tasks API |
| **Notification Service** | `taskflow_notification_service` | 3001 | Notifications API |

### **URLs:**
- **Task Service Swagger:** http://localhost:3000/api
- **Notification Service Swagger:** http://localhost:3001/api
- **RabbitMQ Management:** http://localhost:15672 (guest/guest)

---

## ⚡ **Commands**

### **Starting & Stopping:**

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (DELETES ALL DATA)
docker-compose down -v
```

### **Rebuilding After Code Changes:**

```bash
# Rebuild and restart all services
docker-compose up -d --build

# Rebuild only one service
docker-compose up -d --build task-service
docker-compose up -d --build notification-service
```

### **Viewing Logs:**

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f task-service
docker-compose logs -f notification-service

# Last 50 lines
docker-compose logs --tail=50 task-service
```

### **Checking Status:**

```bash
# List running containers
docker-compose ps

# Check health
docker-compose ps
# Look for "healthy" status
```

### **Database Operations:**

```bash
# Access PostgreSQL
docker exec -it taskflow_db psql -U postgres -d taskflow

# Run migrations (automatic on startup, but if needed)
docker-compose exec task-service npx prisma migrate deploy
```

---

## 🧪 **Testing the Application**

### **Method 1: Swagger UI (Easiest)**

1. Open http://localhost:3000/api
2. Register a user
3. Login (copy the token)
4. Click "Authorize" button at the top
5. Paste token: `Bearer YOUR_TOKEN_HERE`
6. Test all endpoints

### **Method 2: PowerShell/cURL**

```powershell
# Register
$registerBody = @{
    email = "test@example.com"
    password = "Test1234!"
} | ConvertTo-Json

$register = Invoke-RestMethod -Uri "http://localhost:3000/auth/register" `
    -Method Post `
    -ContentType "application/json" `
    -Body $registerBody

# Login
$loginBody = @{
    email = "test@example.com"
    password = "Test1234!"
} | ConvertTo-Json

$login = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $loginBody

$token = $login.access_token

# Create Task
$taskBody = @{
    title = "Docker Test Task"
    description = "Testing from Docker"
    status = "TODO"
    priority = "HIGH"
    dueDate = "2025-10-30T12:00:00Z"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
}

$task = Invoke-RestMethod -Uri "http://localhost:3000/tasks" `
    -Method Post `
    -ContentType "application/json" `
    -Headers $headers `
    -Body $taskBody

# Get Notifications
$notifications = Invoke-RestMethod -Uri "http://localhost:3001/notifications" `
    -Method Get `
    -Headers $headers

Write-Host "Notifications:" -ForegroundColor Green
$notifications | ConvertTo-Json
```

### **Method 3: Health Checks**

```bash
# Check Task Service
curl http://localhost:3000/health

# Check Notification Service
curl http://localhost:3001/health
```

---

## ⚙️ **Configuration**

### **Changing Environment Variables:**

Edit `docker-compose.yml` directly:

```yaml
notification-service:
  environment:
    SMTP_HOST: smtp.gmail.com
    SMTP_PORT: 587
    SMTP_SECURE: true
    SMTP_USER: your-email@gmail.com
    SMTP_PASS: your-app-password
```

Then restart:

```bash
docker-compose up -d --build notification-service
```

### **Changing Database Password:**

1. Edit `docker-compose.yml`:
   - Update `POSTGRES_PASSWORD` in `db` service
   - Update `DATABASE_URL` in both `task-service` and `notification-service`

2. Rebuild everything:

```bash
docker-compose down -v  # Warning: deletes data!
docker-compose up -d --build
```

---

## 🔧 **Troubleshooting**

### **Problem: Services won't start**

```bash
# Check logs
docker-compose logs -f

# Check if ports are in use
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Kill processes using ports
taskkill /PID <PID> /F

# Restart Docker Desktop
```

### **Problem: Database connection errors**

```bash
# Wait for database to be healthy
docker-compose ps

# If not healthy, restart
docker-compose restart db

# Check database logs
docker-compose logs db
```

### **Problem: Build fails**

```bash
# Clean everything and rebuild
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

### **Problem: Code changes not reflected**

```bash
# Must rebuild after code changes
docker-compose up -d --build

# Or for specific service
docker-compose up -d --build task-service
```

### **Problem: RabbitMQ connection errors**

```bash
# Check RabbitMQ is healthy
docker-compose ps

# Restart RabbitMQ
docker-compose restart rabbitmq

# Check RabbitMQ management UI
# http://localhost:15672 (guest/guest)
```

### **Problem: Email not working**

1. Update SMTP credentials in `docker-compose.yml`
2. Restart notification service:

```bash
docker-compose up -d --build notification-service
```

---

## 📦 **Sharing Your Project**

### **Give someone your project:**

```bash
# They only need to run:
cd microservices
docker-compose up -d

# Wait a minute for everything to start
# Then access: http://localhost:3000/api
```

### **No need to:**
- Install Node.js
- Install PostgreSQL
- Install RabbitMQ
- Run npm install
- Run migrations manually
- Create .env files

**Everything is automatic!** 🎉

---

## 🎓 **For Your University Presentation**

### **Impressive Points:**

1. ✅ **One-Command Deployment:** `docker-compose up -d`
2. ✅ **Microservices Architecture:** 2 independent services
3. ✅ **Event-Driven:** RabbitMQ messaging
4. ✅ **Shared Database:** Single PostgreSQL instance
5. ✅ **Health Checks:** Built-in monitoring
6. ✅ **Auto-Migrations:** Database updates automatically
7. ✅ **Production-Ready:** Can deploy to any cloud platform
8. ✅ **Clean Architecture:** Domain, Application, Infrastructure layers

### **Demo Flow:**

1. `docker-compose up -d` ← Start everything
2. Open http://localhost:3000/api ← Show Swagger
3. Register → Login → Create Task ← Live demo
4. Show http://localhost:3001/api ← Notifications appear
5. Show http://localhost:15672 ← RabbitMQ messages
6. `docker-compose ps` ← All services healthy
7. `docker-compose logs -f` ← Real-time logs

---

## 🚀 **Next Steps**

Want to deploy to the cloud?

- **AWS:** Amazon ECS/Fargate
- **Azure:** Azure Container Instances
- **Google Cloud:** Cloud Run
- **DigitalOcean:** App Platform
- **Heroku:** Container Registry

Your Docker setup is ready for any platform! 🎉

---

## 📞 **Need Help?**

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Restart everything
docker-compose restart

# Clean slate
docker-compose down -v
docker-compose up -d --build
```


