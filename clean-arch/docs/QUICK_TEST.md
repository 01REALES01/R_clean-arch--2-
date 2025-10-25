# ⚡ Quick Test - 2 Minute Verification

## 🚀 Test Your Microservices in 2 Minutes

### Step 1: Open Swagger UI
**URL:** http://localhost:3000/api

### Step 2: Register & Login (30 seconds)

1. **POST /auth/register**
   ```json
   {
     "email": "test@example.com",
     "password": "Password123!"
   }
   ```

2. **POST /auth/login** (same credentials)
   - Copy the `access_token`

3. **Click "Authorize"** button (top right)
   - Paste token → Authorize

### Step 3: Create a Task (30 seconds)

**POST /tasks**
```json
{
  "title": "Test the microservices",
  "description": "Verify everything works",
  "priority": "HIGH"
}
```

✅ Task created!  
✅ Event sent to RabbitMQ!  
✅ Notification auto-generated!  

### Step 4: Check Notifications (30 seconds)

**GET /notifications**

You should see:
```json
[{
  "type": "TASK_CREATED",
  "title": "New Task Created",
  "message": "Your task \"Test the microservices\" has been created successfully.",
  "status": "PENDING"
}]
```

### Step 5: Update Task (30 seconds)

**PATCH /tasks/{id}**
```json
{
  "status": "IN_PROGRESS"
}
```

✅ Task updated!  
✅ Another notification created!  

**GET /notifications** again → You should see 2 notifications now!

### Step 6: Verify RabbitMQ (30 seconds)

1. Open: http://localhost:15672 (guest/guest)
2. Click **Queues** tab
3. See: `tasks_queue`, `users_queue`, `notifications_queue`
4. Messages should be consumed (Ready: 0)

---

## ✅ Success Checklist

- [ ] Registered user ✅
- [ ] Got JWT token ✅
- [ ] Created task ✅
- [ ] Notification auto-created ✅
- [ ] Updated task ✅
- [ ] Second notification created ✅
- [ ] RabbitMQ queues working ✅

**All checked?** 🎉 **YOUR MICROSERVICES ARE WORKING PERFECTLY!**

---

## 🔥 Quick Commands

```bash
# View database
npx prisma studio

# Check RabbitMQ
http://localhost:15672

# Restart if needed
npm run start:dev
```

---

## 📊 Your API Endpoints

```
Authentication:
POST   /auth/register
POST   /auth/login

Tasks (needs JWT):
POST   /tasks
GET    /tasks
GET    /tasks/:id
PATCH  /tasks/:id
DELETE /tasks/:id

Notifications (needs JWT):
GET    /notifications
GET    /notifications/unread-count
PATCH  /notifications/:id/read
DELETE /notifications/:id
```

---

## 🎯 What Just Happened?

```
You created a task
    ↓
Task saved to PostgreSQL
    ↓
Event published to RabbitMQ
    ↓
Event handler consumed it
    ↓
Notification created automatically
    ↓
You retrieved notifications via API
```

**That's event-driven microservices in action!** 🚀

---

## 📚 Read More

- **TESTING_GUIDE.md** - Detailed testing scenarios
- **ARCHITECTURE_OVERVIEW.md** - How it all works
- **IMPLEMENTATION_SUMMARY.md** - What we built

**Happy Testing!** 🎉

