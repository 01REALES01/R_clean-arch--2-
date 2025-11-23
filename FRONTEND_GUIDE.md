# 🎨 Guía Completa para el Frontend - TaskFlow

> Documentación completa de la API y arquitectura para desarrollar el frontend

---

## 📋 Tabla de Contenidos

- [Arquitectura General](#-arquitectura-general)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Autenticación](#-autenticación)
- [Estructura de Datos](#-estructura-de-datos)
- [Flujos de Usuario](#-flujos-de-usuario)
- [Consideraciones Técnicas](#-consideraciones-técnicas)

---

## 🏗️ Arquitectura General

### Microservicios

Tu proyecto tiene **2 microservicios independientes**:

1. **Task Service** (Puerto 3000)
   - Autenticación (JWT)
   - Gestión de tareas (CRUD)
   - Panel de administración
   - Publica eventos a RabbitMQ

2. **Notification Service** (Puerto 3001)
   - Gestión de notificaciones
   - Consume eventos de RabbitMQ
   - Envío de emails (opcional)

### URLs Base

```
Task Service:        http://localhost:3000
Notification Service: http://localhost:3001
Swagger Task:        http://localhost:3000/api
Swagger Notification: http://localhost:3001/api
```

### CORS

Ambos servicios tienen CORS habilitado, así que puedes hacer peticiones desde cualquier origen.

---

## 🔐 Autenticación

### Sistema de Autenticación

- **Tipo:** JWT (JSON Web Tokens)
- **Formato:** Bearer Token
- **Duración:** 1 día (configurable)
- **Compartido:** El mismo token funciona en ambos servicios

### Flujo de Autenticación

1. Usuario se registra o hace login en **Task Service**
2. Recibe un `access_token` JWT
3. Usa ese token en todas las peticiones protegidas
4. El token es válido en ambos servicios

---

## 📡 Endpoints de la API

### 🔹 Task Service (http://localhost:3000)

#### **Autenticación** (`/auth`)

##### 1. Registrar Usuario
```http
POST /auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "Password123!"
}
```

**Respuesta (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "usuario@example.com",
    "role": "USER"
  }
}
```

##### 2. Registrar Admin (Solo para testing)
```http
POST /auth/register-admin
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Password123!"
}
```

##### 3. Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "Password123!"
}
```

**Respuesta (200):**
```json
{
  "message": "Login successful",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "usuario@example.com",
    "role": "USER"
  }
}
```

**⚠️ IMPORTANTE:** Guarda el `access_token` para usarlo en todas las peticiones protegidas.

---

#### **Tareas** (`/tasks`) - Requiere Autenticación

##### 1. Crear Tarea
```http
POST /tasks
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Mi primera tarea",
  "description": "Descripción opcional",
  "priority": "HIGH",
  "dueDate": "2025-12-31T23:59:59Z"
}
```

**Campos:**
- `title` (requerido): Título de la tarea
- `description` (opcional): Descripción
- `priority` (opcional): `LOW`, `MEDIUM`, `HIGH`, `URGENT` (default: `MEDIUM`)
- `dueDate` (opcional): Fecha límite en formato ISO 8601

**Respuesta (201):**
```json
{
  "id": "uuid",
  "title": "Mi primera tarea",
  "description": "Descripción opcional",
  "status": "PENDING",
  "priority": "HIGH",
  "dueDate": "2025-12-31T23:59:59.000Z",
  "userId": "uuid",
  "createdAt": "2025-10-25T12:00:00.000Z",
  "updatedAt": "2025-10-25T12:00:00.000Z"
}
```

##### 2. Listar Tareas
```http
GET /tasks
Authorization: Bearer <access_token>

# Con filtro opcional por estado
GET /tasks?status=PENDING
```

**Query Params:**
- `status` (opcional): `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

**Respuesta (200):**
```json
[
  {
    "id": "uuid",
    "title": "Mi primera tarea",
    "description": "Descripción",
    "status": "PENDING",
    "priority": "HIGH",
    "dueDate": "2025-12-31T23:59:59.000Z",
    "userId": "uuid",
    "createdAt": "2025-10-25T12:00:00.000Z",
    "updatedAt": "2025-10-25T12:00:00.000Z"
  }
]
```

##### 3. Obtener Tarea por ID
```http
GET /tasks/:id
Authorization: Bearer <access_token>
```

**Respuesta (200):** Mismo formato que crear tarea

##### 4. Actualizar Tarea
```http
PATCH /tasks/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Título actualizado",
  "status": "IN_PROGRESS",
  "priority": "LOW",
  "description": "Nueva descripción",
  "dueDate": "2025-11-30T23:59:59Z"
}
```

**Campos (todos opcionales):**
- `title`: Nuevo título
- `description`: Nueva descripción
- `status`: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
- `priority`: `LOW`, `MEDIUM`, `HIGH`, `URGENT`
- `dueDate`: Nueva fecha límite

**Respuesta (200):** Tarea actualizada

##### 5. Eliminar Tarea
```http
DELETE /tasks/:id
Authorization: Bearer <access_token>
```

**Respuesta (200):**
```json
{
  "message": "Task deleted successfully"
}
```

---

#### **Administración** (`/admin`) - Requiere Rol ADMIN

⚠️ **Solo usuarios con rol `ADMIN` pueden acceder**

##### 1. Listar Todos los Usuarios
```http
GET /admin/users
Authorization: Bearer <admin_access_token>
```

**Respuesta (200):**
```json
{
  "total": 10,
  "users": [
    {
      "id": "uuid",
      "email": "usuario@example.com",
      "role": "USER",
      "createdAt": "2025-10-25T12:00:00.000Z",
      "updatedAt": "2025-10-25T12:00:00.000Z"
    }
  ]
}
```

##### 2. Obtener Tareas de un Usuario
```http
GET /admin/users/:userId/tasks?status=PENDING
Authorization: Bearer <admin_access_token>
```

**Query Params:**
- `status` (opcional): Filtrar por estado

##### 3. Listar Todas las Tareas
```http
GET /admin/tasks/all?status=PENDING
Authorization: Bearer <admin_access_token>
```

**Respuesta (200):**
```json
{
  "total": 50,
  "tasks": [
    {
      "id": "uuid",
      "title": "Tarea",
      "status": "PENDING",
      "priority": "HIGH",
      "user": {
        "id": "uuid",
        "email": "usuario@example.com",
        "role": "USER"
      }
    }
  ]
}
```

##### 4. Estadísticas del Sistema
```http
GET /admin/statistics
Authorization: Bearer <admin_access_token>
```

**Respuesta (200):**
```json
{
  "users": {
    "total": 10,
    "byRole": [
      { "role": "USER", "count": 9 },
      { "role": "ADMIN", "count": 1 }
    ]
  },
  "tasks": {
    "total": 50,
    "byStatus": {
      "pending": 20,
      "inProgress": 15,
      "completed": 15
    },
    "byPriority": [
      { "priority": "LOW", "count": 10 },
      { "priority": "MEDIUM", "count": 20 },
      { "priority": "HIGH", "count": 15 },
      { "priority": "URGENT", "count": 5 }
    ]
  },
  "notifications": {
    "total": 100
  }
}
```

##### 5. Eliminar Tarea (Admin)
```http
DELETE /admin/tasks/:taskId
Authorization: Bearer <admin_access_token>
```

##### 6. Eliminar Usuario
```http
DELETE /admin/users/:userId
Authorization: Bearer <admin_access_token>
```

**Respuesta (200):**
```json
{
  "message": "User and all their data deleted successfully",
  "userId": "uuid",
  "deletedTasks": 5
}
```

---

#### **Health Check**
```http
GET /health
```

**Respuesta (200):**
```json
{
  "status": "ok"
}
```

---

### 🔹 Notification Service (http://localhost:3001)

#### **Notificaciones** (`/notifications`) - Requiere Autenticación

##### 1. Listar Notificaciones
```http
GET /notifications
Authorization: Bearer <access_token>

# Con filtro opcional por estado
GET /notifications?status=PENDING
```

**Query Params:**
- `status` (opcional): `PENDING`, `READ`, `SENT`, `FAILED`

**Respuesta (200):**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "type": "TASK_CREATED",
    "title": "Nueva Tarea Creada",
    "message": "Tu tarea 'Mi primera tarea' ha sido creada.",
    "status": "PENDING",
    "metadata": {
      "taskId": "uuid",
      "dueDate": "2025-12-31T23:59:59Z"
    },
    "createdAt": "2025-10-25T12:00:00.000Z",
    "sentAt": null
  }
]
```

##### 2. Contar Notificaciones No Leídas
```http
GET /notifications/unread-count
Authorization: Bearer <access_token>
```

**Respuesta (200):**
```json
{
  "count": 5
}
```

##### 3. Marcar Notificación como Leída
```http
PATCH /notifications/:id/read
Authorization: Bearer <access_token>
```

**Respuesta (200):** Notificación actualizada con `status: "READ"`

##### 4. Eliminar Notificación
```http
DELETE /notifications/:id
Authorization: Bearer <access_token>
```

**Respuesta (200):**
```json
{
  "message": "Notification deleted successfully"
}
```

---

## 📊 Estructura de Datos

### Enums

#### TaskStatus
```typescript
enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}
```

#### TaskPriority
```typescript
enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}
```

#### UserRole
```typescript
enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}
```

#### NotificationType
```typescript
enum NotificationType {
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_DELETED = 'TASK_DELETED',
  TASK_DUE_SOON = 'TASK_DUE_SOON',
  TASK_OVERDUE = 'TASK_OVERDUE',
  DAILY_SUMMARY = 'DAILY_SUMMARY'
}
```

#### NotificationStatus
```typescript
enum NotificationStatus {
  PENDING = 'PENDING',
  READ = 'READ',
  SENT = 'SENT',
  FAILED = 'FAILED'
}
```

### Interfaces TypeScript

```typescript
// Task
interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// User (en respuestas)
interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

// Notification
interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  metadata: Record<string, any>;
  createdAt: Date;
  sentAt: Date | null;
}

// Login Response
interface LoginResponse {
  message: string;
  access_token: string;
  user: User;
}

// Register Response
interface RegisterResponse {
  message: string;
  user: User;
}
```

---

## 🔄 Flujos de Usuario

### 1. Flujo de Registro y Login

```
1. Usuario visita la app
2. Se registra: POST /auth/register
3. Recibe confirmación
4. Hace login: POST /auth/login
5. Recibe access_token
6. Guarda token en localStorage/sessionStorage
7. Usa token en todas las peticiones
```

### 2. Flujo de Gestión de Tareas

```
1. Usuario autenticado
2. Ve lista de tareas: GET /tasks
3. Crea nueva tarea: POST /tasks
   → Automáticamente se crea notificación (vía RabbitMQ)
4. Actualiza tarea: PATCH /tasks/:id
   → Se crea notificación de actualización
5. Elimina tarea: DELETE /tasks/:id
   → Se crea notificación de eliminación
```

### 3. Flujo de Notificaciones

```
1. Usuario crea/actualiza/elimina tarea
2. Task Service publica evento a RabbitMQ
3. Notification Service consume evento
4. Se crea notificación automáticamente
5. Usuario consulta notificaciones: GET /notifications
6. Ve contador de no leídas: GET /notifications/unread-count
7. Marca como leída: PATCH /notifications/:id/read
```

### 4. Flujo de Administración (Admin)

```
1. Admin hace login
2. Accede a panel de administración
3. Ve estadísticas: GET /admin/statistics
4. Lista usuarios: GET /admin/users
5. Ve tareas de usuario: GET /admin/users/:userId/tasks
6. Puede eliminar usuarios o tareas
```

---

## 🛠️ Consideraciones Técnicas

### Manejo de Tokens

```typescript
// Guardar token después de login
localStorage.setItem('access_token', response.access_token);

// Usar token en peticiones
const token = localStorage.getItem('access_token');
fetch('http://localhost:3000/tasks', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Manejo de Errores

**401 Unauthorized:**
- Token inválido o expirado
- Redirigir a login

**403 Forbidden:**
- Usuario no tiene permisos (ej: intenta acceder a /admin sin ser ADMIN)
- Mostrar mensaje de error

**404 Not Found:**
- Recurso no existe
- Mostrar mensaje apropiado

**400 Bad Request:**
- Datos inválidos
- Mostrar errores de validación

### Polling de Notificaciones

Para mantener las notificaciones actualizadas, puedes:

1. **Polling periódico:**
```typescript
setInterval(async () => {
  const count = await fetchUnreadCount();
  updateBadge(count);
}, 30000); // Cada 30 segundos
```

2. **WebSockets (futuro):**
- Actualmente no implementado
- Podrías agregarlo para actualizaciones en tiempo real

### URLs de los Servicios

```typescript
const API_CONFIG = {
  TASK_SERVICE: 'http://localhost:3000',
  NOTIFICATION_SERVICE: 'http://localhost:3001',
};

// En producción, cambiar a URLs reales
```

### Validaciones del Frontend

Aunque el backend valida, es buena práctica validar en el frontend:

- **Email:** Formato válido
- **Password:** Mínimo 6 caracteres
- **Title:** No vacío
- **Due Date:** Fecha futura (opcional)

### Estados de Carga

Maneja estados de carga para:
- Login/Registro
- Carga de tareas
- Creación/Actualización de tareas
- Carga de notificaciones

---

## 🎨 Sugerencias de UI/UX

### Páginas Sugeridas

1. **Login/Registro**
   - Formulario de login
   - Formulario de registro
   - Manejo de errores

2. **Dashboard**
   - Lista de tareas
   - Filtros por estado/prioridad
   - Contador de notificaciones no leídas
   - Botón para crear tarea

3. **Gestión de Tareas**
   - Lista de tareas (kanban, lista, etc.)
   - Formulario crear/editar tarea
   - Detalle de tarea
   - Filtros y búsqueda

4. **Notificaciones**
   - Lista de notificaciones
   - Badge con contador
   - Marcar como leída
   - Eliminar notificación

5. **Panel de Admin** (solo para ADMIN)
   - Estadísticas
   - Lista de usuarios
   - Gestión de tareas global

### Componentes Útiles

- **TaskCard:** Tarjeta de tarea
- **TaskForm:** Formulario crear/editar
- **NotificationBadge:** Badge con contador
- **NotificationList:** Lista de notificaciones
- **StatusFilter:** Filtro por estado
- **PriorityBadge:** Badge de prioridad

---

## 🚀 Ejemplo de Integración

### Ejemplo con Fetch API

```typescript
// Configuración
const API_BASE = 'http://localhost:3000';
const NOTIFICATION_BASE = 'http://localhost:3001';

// Helper para peticiones autenticadas
async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token');
  
  return fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

// Login
async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) throw new Error('Login failed');
  
  const data = await response.json();
  localStorage.setItem('access_token', data.access_token);
  return data.user;
}

// Obtener tareas
async function getTasks(status?: string) {
  const url = status 
    ? `${API_BASE}/tasks?status=${status}`
    : `${API_BASE}/tasks`;
    
  const response = await authenticatedFetch(url);
  if (!response.ok) throw new Error('Failed to fetch tasks');
  
  return response.json();
}

// Crear tarea
async function createTask(task: {
  title: string;
  description?: string;
  priority?: string;
  dueDate?: string;
}) {
  const response = await authenticatedFetch(`${API_BASE}/tasks`, {
    method: 'POST',
    body: JSON.stringify(task),
  });
  
  if (!response.ok) throw new Error('Failed to create task');
  return response.json();
}

// Obtener notificaciones
async function getNotifications() {
  const response = await authenticatedFetch(`${NOTIFICATION_BASE}/notifications`);
  if (!response.ok) throw new Error('Failed to fetch notifications');
  return response.json();
}

// Contador de no leídas
async function getUnreadCount() {
  const response = await authenticatedFetch(
    `${NOTIFICATION_BASE}/notifications/unread-count`
  );
  if (!response.ok) throw new Error('Failed to fetch count');
  const data = await response.json();
  return data.count;
}
```

---

## 📝 Notas Importantes

1. **Mismo Token:** El token JWT funciona en ambos servicios
2. **CORS Habilitado:** Puedes hacer peticiones desde cualquier origen
3. **Swagger:** Usa http://localhost:3000/api y http://localhost:3001/api para ver la documentación interactiva
4. **Notificaciones Automáticas:** Se crean automáticamente cuando se crean/actualizan/eliminan tareas
5. **Roles:** Solo usuarios con rol `ADMIN` pueden acceder a `/admin/*`
6. **Validación:** El backend valida todos los datos, pero valida también en el frontend para mejor UX

---

## 🎯 Próximos Pasos

1. **Elegir Framework:**
   - React, Vue, Angular, Svelte, etc.
   - O vanilla JavaScript/TypeScript

2. **Estructura de Proyecto:**
   - Configurar rutas
   - Configurar estado global (Redux, Zustand, Context, etc.)
   - Configurar cliente HTTP (Axios, Fetch, etc.)

3. **Implementar:**
   - Autenticación
   - Gestión de tareas
   - Notificaciones
   - Panel de admin (opcional)

4. **Mejoras Futuras:**
   - WebSockets para notificaciones en tiempo real
   - Filtros avanzados
   - Búsqueda
   - Paginación
   - Drag & drop para kanban

---

**¿Necesitas ayuda con algo específico del frontend?** ¡Pregunta y te ayudo! 🚀

