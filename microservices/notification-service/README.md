# 🔔 Notification Service

> Servicio de gestión de notificaciones para TaskFlow

---

## 📖 Descripción

Microservicio responsable de:
- ✅ Gestión de notificaciones de usuarios
- ✅ Consumo de eventos desde RabbitMQ
- ✅ Creación automática de notificaciones
- ✅ Envío de emails (opcional)
- ✅ Marcado de notificaciones como leídas

---

## 🚀 Inicio Rápido

### 1. Variables de Entorno

Crea un archivo `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5436/taskflow?schema=public"
RABBITMQ_URL="amqp://localhost:5672"
JWT_SECRET="your-secret-key-here"
JWT_EXPIRATION="1d"
NODE_ENV="development"
PORT=3001
SERVICE_NAME="notification-service"

# Email (Opcional - dejar vacío si no se usa)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Base de Datos

```bash
npx prisma generate
npx prisma migrate deploy
```

### 4. Iniciar Servicio

```bash
# Modo desarrollo
npm run start:dev

# Modo producción
npm run build
npm run start:prod
```

El servicio estará disponible en: http://localhost:3001

---

## 📡 Endpoints API

### Notificaciones

#### Listar Notificaciones
```http
GET /notifications
Authorization: Bearer <access_token>

# Con filtros opcionales
GET /notifications?status=PENDING&type=TASK_CREATED
```

**Response:**
```json
[
  {
    "id": "uuid",
    "type": "TASK_CREATED",
    "title": "Nueva Tarea Creada",
    "message": "Tu tarea 'Completar proyecto' ha sido creada.",
    "status": "PENDING",
    "createdAt": "2025-01-01T00:00:00Z",
    "read": false
  }
]
```

#### Marcar como Leída
```http
PATCH /notifications/:id/read
Authorization: Bearer <access_token>
```

#### Obtener Contador de No Leídas
```http
GET /notifications/unread/count
Authorization: Bearer <access_token>

Response:
{
  "count": 5
}
```

#### Eliminar Notificación
```http
DELETE /notifications/:id
Authorization: Bearer <access_token>
```

---

## 🎯 Eventos Consumidos

El servicio escucha los siguientes eventos desde RabbitMQ:

### task.created
Crea una notificación cuando se crea una tarea.

```json
{
  "type": "TASK_CREATED",
  "title": "Nueva Tarea Creada",
  "message": "Tu tarea 'Título' ha sido creada."
}
```

### task.updated
Crea una notificación cuando se actualiza una tarea.

```json
{
  "type": "TASK_UPDATED",
  "title": "Tarea Actualizada",
  "message": "Tu tarea 'Título' ha sido actualizada."
}
```

### task.deleted
Crea una notificación cuando se elimina una tarea.

```json
{
  "type": "TASK_DELETED",
  "title": "Tarea Eliminada",
  "message": "Tu tarea 'Título' ha sido eliminada."
}
```

---

## 📦 Arquitectura

### Estructura de Carpetas

```
src/
├── domain/              # Capa de Dominio
│   ├── entities/       # Entidad Notification
│   ├── repositories/   # Interface NotificationRepository
│   └── events/         # Eventos de dominio
│
├── application/         # Capa de Aplicación
│   ├── use-cases/      # Casos de uso de notificaciones
│   ├── dto/           # DTOs (interfaces)
│   └── tokens/        # Tokens de inyección
│
├── infrastructure/      # Capa de Infraestructura
│   ├── database/       # Prisma + Repositorios
│   ├── auth/          # JWT Strategy + Guards
│   ├── messaging/     # RabbitMQ Consumer + Handlers
│   └── email/         # Servicio de emails (opcional)
│
└── presentation/        # Capa de Presentación
    ├── controllers/    # Controllers REST
    ├── dto/           # DTOs con validación
    └── module/        # Módulos NestJS
```

### Flujo de Eventos

```
1. Task Service → Publica evento → RabbitMQ
2. RabbitMQ → Queue: tasks_queue
3. Notification Service → Consume evento
4. TaskEventHandler → Procesa evento
5. CreateNotificationUseCase → Crea notificación
6. NotificationRepository → Guarda en PostgreSQL
7. (Opcional) EmailService → Envía email
```

---

## 📧 Configuración de Emails (Opcional)

### Gmail

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-app-password"
SMTP_FROM="TaskFlow <tu-email@gmail.com>"
```

**Nota:** Para Gmail, necesitas generar una "App Password":
1. Ve a https://myaccount.google.com/apppasswords
2. Genera una contraseña de aplicación
3. Usa esa contraseña en `SMTP_PASS`

### Otros Proveedores

#### Outlook/Hotmail
```env
SMTP_HOST="smtp.office365.com"
SMTP_PORT=587
```

#### SendGrid
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASS="tu-sendgrid-api-key"
```

---

## 🗄️ Base de Datos

### Modelo Prisma

```prisma
model Notification {
  id        String             @id @default(uuid())
  userId    String
  user      User               @relation(fields: [userId], references: [id])
  type      NotificationType
  title     String
  message   String
  status    NotificationStatus @default(PENDING)
  metadata  Json?
  read      Boolean            @default(false)
  createdAt DateTime           @default(now())
  sentAt    DateTime?
}

enum NotificationType {
  TASK_CREATED
  TASK_UPDATED
  TASK_DELETED
  TASK_DUE_SOON
  TASK_OVERDUE
  DAILY_SUMMARY
}

enum NotificationStatus {
  PENDING
  READ
  SENT
  FAILED
}
```

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Tests unitarios
npm test

# Tests con cobertura
npm run test:cov

# Tests en modo watch
npm run test:watch
```

### Ejemplo de Test

```typescript
describe('GetNotificationsUseCase', () => {
  it('should return user notifications', async () => {
    const notifications = await useCase.execute(userId);
    
    expect(notifications).toHaveLength(2);
    expect(notifications[0].userId).toBe(userId);
  });
});
```

---

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run start:dev          # Inicia en modo desarrollo (hot reload)
npm run build              # Compila a JavaScript
npm run start:prod         # Inicia en modo producción

# Base de Datos
npx prisma studio          # Abre interfaz visual de BD
npx prisma generate        # Genera cliente Prisma
npx prisma migrate dev     # Crea y aplica migración

# Testing
npm test                   # Tests unitarios
npm run test:cov          # Cobertura de tests

# Linting
npm run lint              # Revisa código
npm run format            # Formatea código
```

---

## 📄 Documentación API

### Swagger/OpenAPI

Accede a la documentación interactiva en:

👉 http://localhost:3001/api

---

## 🔧 Configuración Avanzada

### Variables de Entorno Completas

```env
# Base de Datos
DATABASE_URL="postgresql://postgres:password@localhost:5436/taskflow?schema=public"

# JWT (debe coincidir con Task Service)
JWT_SECRET="your-secret-key-minimum-32-characters"
JWT_EXPIRATION="1d"

# RabbitMQ
RABBITMQ_URL="amqp://localhost:5672"
RABBITMQ_QUEUE="tasks_queue"

# Servicio
NODE_ENV="development"
PORT=3001
SERVICE_NAME="notification-service"

# Email (Opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-app-password"
SMTP_FROM="TaskFlow <tu-email@gmail.com>"
ENABLE_EMAIL=true

# Logging
LOG_LEVEL="debug"
```

---

## 🔔 Tipos de Notificaciones

### TASK_CREATED
Se envía cuando se crea una nueva tarea.

**Plantilla:**
```
Título: Nueva Tarea Creada
Mensaje: Tu tarea '{taskTitle}' ha sido creada con prioridad {priority}.
```

### TASK_UPDATED
Se envía cuando se actualiza una tarea existente.

**Plantilla:**
```
Título: Tarea Actualizada
Mensaje: Tu tarea '{taskTitle}' ha sido actualizada. Estado: {status}.
```

### TASK_DELETED
Se envía cuando se elimina una tarea.

**Plantilla:**
```
Título: Tarea Eliminada
Mensaje: Tu tarea '{taskTitle}' ha sido eliminada.
```

### TASK_DUE_SOON (Futuro)
Se enviaría cuando una tarea está próxima a vencer.

### DAILY_SUMMARY (Futuro)
Resumen diario de tareas pendientes.

---

## 🐛 Troubleshooting

### No se reciben eventos

1. Verifica que RabbitMQ esté corriendo:
```bash
docker-compose ps
```

2. Revisa logs de RabbitMQ:
```bash
docker-compose logs rabbitmq
```

3. Verifica la conexión en RabbitMQ Management:
   - http://localhost:15672 (guest/guest)
   - Busca la queue `tasks_queue`
   - Verifica que haya consumers activos

### Emails no se envían

1. Verifica la configuración SMTP en `.env`
2. Para Gmail, asegúrate de usar App Password
3. Revisa logs del servicio:
```bash
npm run start:dev
```

### Error: Prisma Client not generated

```bash
npx prisma generate
```

---

## 📊 Monitoreo

### Health Check

```http
GET /health

Response:
{
  "status": "ok",
  "database": "connected",
  "rabbitmq": "connected"
}
```

### Métricas de RabbitMQ

Accede al dashboard:
- URL: http://localhost:15672
- Usuario: guest
- Password: guest

Verifica:
- ✅ Queue `tasks_queue` existe
- ✅ Consumer activo
- ✅ Mensajes siendo procesados

---

## 🚀 Despliegue

### Docker

```bash
# Construir imagen
docker build -t notification-service .

# Ejecutar contenedor
docker run -p 3001:3001 --env-file .env notification-service
```

### Consideraciones de Producción

- ✅ Usar contraseñas seguras para SMTP
- ✅ Configurar rate limiting para emails
- ✅ Implementar retry logic para eventos fallidos
- ✅ Monitorear el tamaño de la queue
- ✅ Configurar dead letter queue en RabbitMQ

---

## 🎯 Roadmap

- [ ] Notificaciones push (Firebase)
- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Plantillas de email personalizables
- [ ] Scheduled notifications (cron jobs)
- [ ] Agregación de notificaciones
- [ ] Preferencias de notificación por usuario

---

**Puerto:** 3001  
**Swagger:** http://localhost:3001/api  
**Health Check:** http://localhost:3001/health
