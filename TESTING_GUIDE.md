# 🧪 TaskFlow Testing Guide

## Prerequisites

Make sure your services are running:
- ✅ PostgreSQL (localhost:5432)
- ✅ RabbitMQ (localhost:5672)
- ✅ TaskFlow API (localhost:3000)

## 🌐 Testing via Swagger UI (Recommended)

**Open:** http://localhost:3000/api

### Step 1: Register a User

1. Go to **POST /auth/register**
2. Click "Try it out"
3. Use this payload:
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```
4. Click **Execute**
5. You should get a 201 response with user details

### Step 2: Login

1. Go to **POST /auth/login**
2. Click "Try it out"
3. Use the same credentials:
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```
4. Click **Execute**
5. **Copy the `access_token` from the response**

### Step 3: Authorize

1. Click the green **"Authorize"** button at the top right
2. Paste your token in the format: `Bearer YOUR_TOKEN_HERE`
3. Click **Authorize**
4. You're now authenticated! 🎉

### Step 4: Create Tasks

1. Go to **POST /tasks**
2. Click "Try it out"
3. Try this payload:
```json
   {
   "title": "Complete project documentation",
   "description": "Write comprehensive docs for the TaskFlow project",
   "priority": "HIGH",
   "dueDate": "2025-10-30T12:00:00Z"
   }
```
4. Click **Execute**
5. ✅ A notification will be automatically created via RabbitMQ!

Create a few more tasks:

```json
{
  "title": "Review code",
  "description": "Review pull requests from team",
  "priority": "MEDIUM",
  "status": "PENDING"
}
```

```json
{
  "title": "Deploy to staging",
  "description": "Deploy the latest version to staging environment",
  "priority": "URGENT",
  "dueDate": "2025-10-26T18:00:00Z"
}
```

### Step 5: Update a Task

1. Go to **PATCH /tasks/{id}**
2. Use a task ID from Step 4
3. Update the status:
```json
{
  "status": "IN_PROGRESS"
}
```
4. ✅ Another notification will be created!

### Step 6: Get Your Notifications

1. Go to **GET /notifications**
2. Click "Try it out"
3. Click **Execute**
4. You should see notifications for:
   - Task created events
   - Task updated events

### Step 7: Check Unread Count

1. Go to **GET /notifications/unread-count**
2. Click **Execute**
3. See how many unread notifications you have

### Step 8: Mark Notification as Read

1. Go to **PATCH /notifications/{id}/read**
2. Use a notification ID from Step 6
3. Click **Execute**
4. The notification is now marked as READ

### Step 9: Filter Notifications

1. Go to **GET /notifications**
2. Set the `status` query parameter to:
   - `PENDING` (unread)
   - `READ` (already read)
3. Click **Execute**

### Step 10: Delete Notification

1. Go to **DELETE /notifications/{id}**
2. Use a notification ID
3. Click **Execute**
4. Notification is deleted

---

## 🐰 Verify RabbitMQ Integration

### Check RabbitMQ Management UI

1. Open: http://localhost:15672
2. Login: `guest` / `guest`
3. Go to **Queues** tab
4. You should see:
   - `tasks_queue` ✅
   - `users_queue` ✅
   - `notifications_queue` ✅

### Monitor Event Flow

1. Create a task via Swagger
2. Immediately refresh RabbitMQ Queues page
3. You should see:
   - Message published to `tasks_queue`
   - Message consumed (Ready: 0)
   - Consumer active

### Check Console Logs

In your `npm run start:dev` terminal, you should see:
```
📬 Handling task.created event: { taskId: '...', title: '...', ... }
✅ Notification created for task.created
```

---

## 📊 Testing Scenarios

### Scenario 1: Task Lifecycle

1. ✅ **Create Task** → Notification created (TASK_CREATED)
2. ✅ **Update Task Status** → Notification created (TASK_UPDATED)
3. ✅ **Get Notifications** → See both notifications
4. ✅ **Mark as Read** → Notification status = READ
5. ✅ **Delete Task** → Task removed

### Scenario 2: Multiple Users

1. Register User A
2. Register User B
3. Login as User A → Create tasks
4. Login as User B → Create tasks
5. User A sees only their notifications
6. User B sees only their notifications

### Scenario 3: Notification Filtering

1. Create 5 tasks (generates 5 notifications)
2. Mark 2 notifications as read
3. GET /notifications?status=PENDING → See 3 unread
4. GET /notifications?status=READ → See 2 read
5. GET /notifications (no filter) → See all 5

---

## 🔧 Testing with cURL (Windows PowerShell)

### Register User
```powershell
$body = @{
    email = "test@example.com"
    password = "Password123!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/auth/register" -Method Post -Body $body -ContentType "application/json"
```

### Login
```powershell
$loginBody = @{
    email = "test@example.com"
    password = "Password123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $response.access_token
Write-Host "Token: $token"
```

### Create Task
```powershell
$taskBody = @{
    title = "Test Task"
    description = "Testing with PowerShell"
    priority = "HIGH"
    dueDate = (Get-Date).AddDays(7).ToString("o")
} | ConvertTo-Json

$headers = @{
    Authorization = "Bearer $token"
}

$task = Invoke-RestMethod -Uri "http://localhost:3000/tasks" -Method Post -Body $taskBody -ContentType "application/json" -Headers $headers
Write-Host "Task created: $($task.id)"
```

### Get Notifications
```powershell
$notifications = Invoke-RestMethod -Uri "http://localhost:3000/notifications" -Method Get -Headers $headers
$notifications | ConvertTo-Json -Depth 10
```

---

## 🎯 API Endpoints Summary

### Authentication (Public)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token

### Tasks (Protected)
- `POST /tasks` - Create task
- `GET /tasks` - List all tasks (optional: ?status=PENDING)
- `GET /tasks/:id` - Get specific task
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

### Notifications (Protected)
- `GET /notifications` - List all notifications (optional: ?status=PENDING)
- `GET /notifications/unread-count` - Get unread count
- `PATCH /notifications/:id/read` - Mark as read
- `DELETE /notifications/:id` - Delete notification

---

## ✅ Expected Results

### After Creating a Task:

**Task Response:**
```json
{
  "id": "uuid-123",
  "title": "Complete project documentation",
  "description": "Write comprehensive docs",
  "status": "PENDING",
  "priority": "HIGH",
  "dueDate": "2025-10-30T12:00:00.000Z",
  "userId": "uuid-user",
  "createdAt": "2025-10-25T16:30:00.000Z",
  "updatedAt": "2025-10-25T16:30:00.000Z"
}
```

**Notification Created (Check GET /notifications):**
```json
{
  "id": "uuid-456",
  "userId": "uuid-user",
  "type": "TASK_CREATED",
  "title": "New Task Created",
  "message": "Your task \"Complete project documentation\" has been created successfully.",
  "status": "PENDING",
  "metadata": {
    "taskId": "uuid-123",
    "dueDate": "2025-10-30T12:00:00.000Z"
  },
  "createdAt": "2025-10-25T16:30:01.000Z",
  "sentAt": null
}
```

---

## 🐛 Troubleshooting

### No Notifications Created?

1. **Check RabbitMQ is running:**
   ```powershell
   docker ps | Select-String rabbitmq
   ```

2. **Check RabbitMQ connection in logs:**
   - Should see: "Connected to RabbitMQ"
   - If error: Restart RabbitMQ
   ```powershell
   docker restart rabbitmq
   ```

3. **Check event handlers:**
   - Should see: "📬 Handling task.created event"
   - If not: Check MessagingModule is imported

### JWT Token Not Working?

1. Make sure you're using the format: `Bearer YOUR_TOKEN`
2. Check token hasn't expired (1 hour validity)
3. Re-login to get a fresh token

### Database Errors?

1. **Check PostgreSQL is running:**
   ```powershell
   docker ps | Select-String postgres
   ```

2. **Regenerate Prisma Client:**
   ```powershell
   npx prisma generate
   ```

3. **Check migrations:**
   ```powershell
   npx prisma migrate status
   ```

---

## 📈 Next Steps

After testing the current features:

1. ✅ **Implement WebSocket** for real-time notifications
2. ✅ **Add Email Service** for sending email notifications
3. ✅ **Background Jobs** for task reminders
4. ✅ **Unit Tests** with Jest
5. ✅ **Integration Tests** for API endpoints
6. ✅ **E2E Tests** for complete workflows

---

## 🎉 Success Checklist

- [ ] Registered a user successfully
- [ ] Logged in and received JWT token
- [ ] Created multiple tasks
- [ ] Updated task status
- [ ] Saw notifications appear automatically
- [ ] Checked unread count
- [ ] Marked notifications as read
- [ ] Filtered notifications by status
- [ ] Deleted a notification
- [ ] Verified RabbitMQ queues
- [ ] Saw event logs in console

If you've checked all boxes, **congratulations!** 🎊 Your microservices are working perfectly!

