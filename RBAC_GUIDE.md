# 🔐 **Role-Based Access Control (RBAC) Guide**

Your TaskFlow project now has professional role-based authorization with ADMIN and USER roles!

---

## 📋 **Table of Contents**

1. [Overview](#overview)
2. [User Roles](#user-roles)
3. [How to Test](#how-to-test)
4. [Admin Endpoints](#admin-endpoints)
5. [User Endpoints](#user-endpoints)
6. [Security Features](#security-features)

---

## 🎯 **Overview**

### **What is RBAC?**

Role-Based Access Control restricts system access based on user roles. Different users have different permissions.

### **Your Implementation:**

- ✅ **2 Roles:** USER and ADMIN
- ✅ **RolesGuard:** Checks user roles before allowing access
- ✅ **@Roles() Decorator:** Marks endpoints that require specific roles
- ✅ **JWT Authentication:** All protected routes require valid tokens

---

## 👥 **User Roles**

### **USER Role (Default)**

**Can:**
- ✅ Register an account
- ✅ Login
- ✅ Create their own tasks
- ✅ View their own tasks
- ✅ Update their own tasks
- ✅ Delete their own tasks
- ✅ View their own notifications
- ✅ Mark notifications as read

**Cannot:**
- ❌ View other users' tasks
- ❌ Delete other users' tasks
- ❌ View system statistics
- ❌ Manage users
- ❌ Access admin endpoints

---

### **ADMIN Role**

**Everything USER can do, PLUS:**
- ✅ View all users
- ✅ View all tasks from all users
- ✅ View specific user's tasks
- ✅ Delete any task (from any user)
- ✅ Delete users (except other admins)
- ✅ View system statistics
- ✅ Access admin-only endpoints under `/admin`

---

## 🧪 **How to Test RBAC**

### **Step 1: Create a Regular User**

**Using Swagger (http://localhost:3000/api):**

1. Go to `POST /auth/register`
2. Register a user:
```json
{
  "email": "user@example.com",
  "password": "User1234!"
}
```

3. Response will show `role: "USER"`

---

### **Step 2: Create an Admin User**

**Using Swagger:**

1. Go to `POST /auth/register-admin`
2. Register an admin:
```json
{
  "email": "admin@example.com",
  "password": "Admin1234!"
}
```

3. Response will show `role: "ADMIN"`

> **⚠️ Important:** In production, remove the `/auth/register-admin` endpoint!

---

### **Step 3: Login as Regular User**

1. Go to `POST /auth/login`
2. Login with user credentials:
```json
{
  "email": "user@example.com",
  "password": "User1234!"
}
```

3. Copy the `access_token`
4. Click **"Authorize"** button at the top of Swagger
5. Paste: `Bearer YOUR_TOKEN_HERE`

**Now test USER permissions:**
- ✅ Create tasks (works)
- ✅ View your tasks (works)
- ❌ Access `/admin/users` (403 Forbidden)
- ❌ Access `/admin/statistics` (403 Forbidden)

---

### **Step 4: Login as Admin**

1. **Logout** (remove the Bearer token)
2. Go to `POST /auth/login`
3. Login with admin credentials:
```json
{
  "email": "admin@example.com",
  "password": "Admin1234!"
}
```

4. Copy the new `access_token`
5. Click **"Authorize"** and paste: `Bearer YOUR_ADMIN_TOKEN`

**Now test ADMIN permissions:**
- ✅ Create tasks (works)
- ✅ Access `/admin/users` (works!)
- ✅ Access `/admin/statistics` (works!)
- ✅ View all tasks from all users (works!)

---

## 🔒 **Admin Endpoints**

All admin endpoints are under `/admin` and require `ADMIN` role.

### **GET /admin/users**

**Description:** Get list of all registered users

**Response:**
```json
{
  "total": 5,
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "role": "USER",
      "createdAt": "2025-10-26T...",
      "updatedAt": "2025-10-26T..."
    }
  ]
}
```

---

### **GET /admin/users/:userId/tasks**

**Description:** Get all tasks for a specific user

**Example:** `GET /admin/users/abc-123/tasks?status=TODO`

**Response:**
```json
{
  "user": {
    "email": "user@example.com",
    "role": "USER"
  },
  "tasks": [
    {
      "id": "task-uuid",
      "title": "User's Task",
      "status": "TODO",
      "priority": "HIGH"
    }
  ]
}
```

---

### **GET /admin/tasks/all**

**Description:** Get ALL tasks from ALL users

**Query Parameters:**
- `status` (optional): Filter by task status (TODO, IN_PROGRESS, DONE)

**Response:**
```json
{
  "total": 42,
  "tasks": [
    {
      "id": "uuid",
      "title": "Task 1",
      "status": "TODO",
      "user": {
        "id": "user-uuid",
        "email": "user@example.com",
        "role": "USER"
      }
    }
  ]
}
```

---

### **GET /admin/statistics**

**Description:** Get system-wide statistics (impressive for demos!)

**Response:**
```json
{
  "users": {
    "total": 15,
    "byRole": [
      { "role": "USER", "count": 13 },
      { "role": "ADMIN", "count": 2 }
    ]
  },
  "tasks": {
    "total": 142,
    "byStatus": {
      "todo": 45,
      "inProgress": 67,
      "done": 30
    },
    "byPriority": [
      { "priority": "HIGH", "count": 50 },
      { "priority": "MEDIUM", "count": 60 },
      { "priority": "LOW", "count": 32 }
    ]
  },
  "notifications": {
    "total": 284
  }
}
```

---

### **DELETE /admin/tasks/:taskId**

**Description:** Delete ANY task (even if it belongs to another user)

**Example:** `DELETE /admin/tasks/abc-123`

**Response:**
```json
{
  "message": "Task deleted successfully by admin",
  "taskId": "abc-123",
  "originalOwner": "user-uuid"
}
```

---

### **DELETE /admin/users/:userId**

**Description:** Delete a user and ALL their data (tasks, notifications)

**Example:** `DELETE /admin/users/user-uuid`

**Protection:** Cannot delete ADMIN users

**Response:**
```json
{
  "message": "User and all their data deleted successfully",
  "userId": "user-uuid",
  "deletedTasks": 15
}
```

---

## 👤 **User Endpoints**

Regular users can access these endpoints (no special role required).

### **Task Endpoints**

All under `/tasks` - users can only access **their own** tasks:

- `POST /tasks` - Create task
- `GET /tasks` - List your tasks
- `GET /tasks/:id` - Get specific task (only yours)
- `PATCH /tasks/:id` - Update task (only yours)
- `DELETE /tasks/:id` - Delete task (only yours)

### **Notification Endpoints**

Under `/notifications` - users see **only their own** notifications:

- `GET /notifications` - Your notifications
- `PATCH /notifications/:id/read` - Mark as read
- `GET /notifications/unread-count` - Your unread count
- `DELETE /notifications/:id` - Delete your notification

---

## 🛡️ **Security Features**

### **1. JWT Authentication**

All protected routes require a valid JWT token:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **2. Role Verification**

Admin endpoints check the user's role from the JWT payload:

```typescript
// In RolesGuard
const { user } = request;
return requiredRoles.some((role) => user.role === role);
```

### **3. Resource Ownership**

Regular users can only access their own resources:
- Tasks filtered by `userId`
- Notifications filtered by `userId`

### **4. Admin Protection**

Admins cannot delete other admins:

```typescript
if (user.role === UserRole.ADMIN) {
  return {
    message: 'Cannot delete admin users through this endpoint'
  };
}
```

---

## 🎓 **For Your University Demo**

### **Demo Flow:**

1. **Show regular user capabilities:**
   - Register as USER
   - Create some tasks
   - Show you can't access `/admin/users` (403 error)

2. **Show admin capabilities:**
   - Register as ADMIN
   - Access `/admin/statistics` (show impressive stats)
   - View all users via `/admin/users`
   - View all tasks via `/admin/tasks/all`

3. **Explain security:**
   - Show JWT tokens in Swagger
   - Explain RolesGuard checks
   - Show 403 Forbidden errors for unauthorized access

---

## 📊 **Architecture Highlights**

### **Clean Architecture Compliance:**

```
Presentation Layer:
  - AdminController (admin endpoints)
  - TaskController (user endpoints)
  - @Roles() decorator usage

Infrastructure Layer:
  - RolesGuard (authorization logic)
  - JwtAuthGuard (authentication)

Domain Layer:
  - UserRole enum (USER, ADMIN)
  - Business rules enforcement
```

---

## 🚀 **Testing Commands**

### **PowerShell Script:**

```powershell
# Register Admin
$adminRegister = @{
    email = "admin@test.com"
    password = "Admin1234!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/auth/register-admin" `
    -Method Post -ContentType "application/json" -Body $adminRegister

# Login as Admin
$adminLogin = @{
    email = "admin@test.com"
    password = "Admin1234!"
} | ConvertTo-Json

$adminAuth = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" `
    -Method Post -ContentType "application/json" -Body $adminLogin

$adminToken = $adminAuth.access_token

# Get Statistics (Admin only)
$headers = @{ "Authorization" = "Bearer $adminToken" }

$stats = Invoke-RestMethod -Uri "http://localhost:3000/admin/statistics" `
    -Method Get -Headers $headers

Write-Host "System Statistics:" -ForegroundColor Green
$stats | ConvertTo-Json -Depth 5
```

---

## ⚠️ **Production Considerations**

### **Before Deploying:**

1. **Remove `/auth/register-admin` endpoint**
   - Or add additional security (API keys, IP whitelist)

2. **Use environment variables for sensitive data**
   - JWT secrets
   - Database credentials

3. **Add rate limiting**
   - Prevent brute force attacks
   - Limit login attempts

4. **Add audit logging**
   - Log all admin actions
   - Track who deleted what

5. **Implement password requirements**
   - Minimum length
   - Complexity rules
   - Already partly implemented in DTO validation

---

## 🎉 **Summary**

You now have:
- ✅ Full RBAC implementation
- ✅ Admin and User roles
- ✅ 6 powerful admin endpoints
- ✅ Secure authorization with guards
- ✅ Clean Architecture compliance
- ✅ Professional-grade security

**This is impressive for a university project!** 🌟


