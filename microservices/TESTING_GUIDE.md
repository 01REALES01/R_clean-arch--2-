# 🧪 Microservices Testing Guide

## 🎯 Testing 2 Independent Microservices

You now have **2 separate microservices** communicating via RabbitMQ!

---

## 🚀 Start Both Services

### Terminal 1 - Task Service
```bash
cd microservices/task-service
npm install
npm run start:dev
```

**Expected output:**
```
🚀 Task Service running on: http://localhost:3000
📚 Swagger UI: http://localhost:3000/api
✅ RabbitMQ connected successfully
```

---

### Terminal 2 - Notification Service
```bash
cd microservices/notification-service
npm install
npm run start:dev
```

**Expected output:**
```
🔔 Notification Service running on: http://localhost:3001
📚 Swagger UI: http://localhost:3001/api
✅ RabbitMQ connected successfully
👂 Listening to queue: tasks_queue
```

---

## ✅ Step-by-Step Testing

### **Step 1: Register & Login** (Task Service)

Open **http://localhost:3000/api**

**POST /auth/register:**
```json
{
  "email": "microtest@example.com",
  "password": "Password123!"
}
```

**POST /auth/login:**
```json
{
  "email": "microtest@example.com",
  "password": "Password123!"
}
```

**Copy the `access_token`!**

---

### **Step 2: Authorize Task Service**

1. Click green **"Authorize"** button
2. Paste your token
3. Click **Authorize** → **Close**

---

### **Step 3: Create a Task** (Task Service)

**POST /tasks:**
```json
{
  "title": "Test microservices communication",
  "description": "This should trigger notification service",
  "priority": "HIGH",
  "dueDate": "2025-10-30T12:00:00Z"
}
```

✅ Task created!
✅ Event published to RabbitMQ!

**Check Terminal 2 (Notification Service)** - You should see:
```
📥 Message received from queue: tasks_queue
📬 Handling task.created event
✅ Notification created for task.created
```

---

### **Step 4: Check Notifications** (Notification Service)

Open **http://localhost:3001/api**

**Important:** Authorize here too with the **same JWT token**!

1. Click **"Authorize"**
2. Paste the same token from Step 1
3. Click **Authorize** → **Close**

**GET /notifications:**

You should see:
```json
[
  {
    "id": "...",
    "type": "TASK_CREATED",
    "title": "New Task Created",
    "message": "Your task \"Test microservices communication\" has been created successfully.",
    "status": "PENDING"
  }
]
```

🎉 **SUCCESS! Your microservices are communicating!**

---

### **Step 5: Update Task** (Task Service)

Go back to **http://localhost:3000/api**

**PATCH /tasks/{id}:**
```json
{
  "status": "IN_PROGRESS"
}
```

---

### **Step 6: Check Notifications Again** (Notification Service)

Go to **http://localhost:3001/api**

**GET /notifications:**

You should now see **TWO notifications**!
- Task Created
- Task Updated

---

## 🎊 What Just Happened?

```
1. You created a task in Task Service (Port 3000)
         ↓
2. Task Service published event to RabbitMQ
         ↓
3. RabbitMQ delivered event to Notification Service
         ↓
4. Notification Service consumed event (Port 3001)
         ↓
5. Notification automatically created in database
         ↓
6. You fetched it from Notification Service API
```

**This is true microservices architecture with event-driven communication!**

---

## 🔍 Verify Everything

### ✅ Check RabbitMQ
Open http://localhost:15672 (guest/guest)
- Go to **Queues** tab
- You should see `tasks_queue` with messages processed

### ✅ Check Both Services
- Task Service: http://localhost:3000/api
- Notification Service: http://localhost:3001/api

### ✅ Check Terminals
- **Terminal 1**: Task Service logs showing event publishing
- **Terminal 2**: Notification Service logs showing event consumption

---

## 🎯 Key Features Demonstrated

1. **Service Independence** ✅
   - Each service runs separately
   - Can be deployed independently
   - Can be scaled independently

2. **Event-Driven Communication** ✅
   - No direct HTTP calls between services
   - Loose coupling via RabbitMQ
   - Asynchronous processing

3. **Clean Architecture** ✅
   - Both services maintain clean architecture
   - Shared domain models
   - Independent business logic

4. **Shared Authentication** ✅
   - JWT works across both services
   - Single user database

5. **Shared Database** ✅
   - Both connect to same PostgreSQL
   - Simpler for this demo
   - Can easily split later

---

## 🚨 Troubleshooting

### Service won't start?
- Check if port is already in use
- Make sure RabbitMQ and PostgreSQL are running
- Check `.env` file exists with correct values

### No notifications appearing?
- Check Terminal 2 - are events being consumed?
- Check RabbitMQ management UI - are messages in queue?
- Make sure both services are authorized with same JWT

### Can't connect to database?
- Both services use same DATABASE_URL
- Make sure PostgreSQL is running on port 5436

---

## 📊 Architecture Comparison

### Before (Monolith)
```
One Application
├── Auth
├── Tasks
└── Notifications
```

### After (Microservices)
```
Task Service (3000)          Notification Service (3001)
├── Auth                     ├── Notifications
└── Tasks                    └── Event Handlers
     ↓                            ↑
     └──> RabbitMQ ──────────────┘
```

---

## 🎉 Success Criteria

You have successful microservices if:
- ✅ Both services start on different ports
- ✅ Task creation triggers notification
- ✅ Same JWT works on both services
- ✅ RabbitMQ shows message flow
- ✅ Each service has its own Swagger UI

---

**Congratulations! You now have working microservices!** 🚀


