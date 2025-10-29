# 📝 Task Service

> Servicio de gestión de tareas y autenticación para TaskFlow

---

## 📖 Descripción

Microservicio responsable de:
- ✅ Autenticación de usuarios (JWT)
- ✅ Gestión de tareas (CRUD completo)
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Publicación de eventos a RabbitMQ

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
PORT=3000
SERVICE_NAME="task-service"
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

El servicio estará disponible en: http://localhost:3000

---

## 📡 Endpoints API

### Autenticación

#### Registrar Usuario
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "John Doe"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}

Response:
{
  "access_token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

#### Obtener Perfil
```http
GET /auth/profile
Authorization: Bearer <access_token>
```

### Tareas

#### Crear Tarea
```http
POST /tasks
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Completar proyecto",
  "description": "Finalizar implementación",
  "priority": "HIGH",
  "dueDate": "2025-12-31T23:59:59Z"
}
```

#### Listar Tareas
```http
GET /tasks
Authorization: Bearer <access_token>

# Con filtros opcionales
GET /tasks?status=PENDING&priority=HIGH
```

#### Obtener Tarea
```http
GET /tasks/:id
Authorization: Bearer <access_token>
```

#### Actualizar Tarea
```http
PATCH /tasks/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "IN_PROGRESS",
  "description": "Nueva descripción"
}
```

#### Eliminar Tarea
```http
DELETE /tasks/:id
Authorization: Bearer <access_token>
```

---

## 🎯 Eventos Publicados

El servicio publica los siguientes eventos a RabbitMQ:

### task.created
```json
{
  "taskId": "uuid",
  "userId": "uuid",
  "title": "Título de la tarea",
  "description": "Descripción",
  "priority": "HIGH",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### task.updated
```json
{
  "taskId": "uuid",
  "userId": "uuid",
  "title": "Título actualizado",
  "status": "IN_PROGRESS",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### task.deleted
```json
{
  "taskId": "uuid",
  "userId": "uuid",
  "title": "Título de la tarea",
  "deletedAt": "2025-01-01T00:00:00Z"
}
```

---

## 📦 Arquitectura

### Estructura de Carpetas

```
src/
├── domain/              # Capa de Dominio
│   ├── entities/       # Entidades (User, Task)
│   ├── repositories/   # Interfaces de repositorios
│   └── events/         # Eventos de dominio
│
├── application/         # Capa de Aplicación
│   ├── use-cases/      # Casos de uso
│   ├── dto/           # DTOs (interfaces)
│   ├── ports/         # Puertos (interfaces externas)
│   └── tokens/        # Tokens de inyección
│
├── infrastructure/      # Capa de Infraestructura
│   ├── database/       # Prisma + Repositorios
│   ├── auth/          # JWT Strategy + Guards
│   └── messaging/     # RabbitMQ + Event Publisher
│
└── presentation/        # Capa de Presentación
    ├── controllers/    # Controllers REST
    ├── dto/           # DTOs con validación
    └── module/        # Módulos NestJS
```

### Flujo de una Petición

```
1. HTTP Request → Controller (presentation/)
2. Controller → Use Case (application/)
3. Use Case → Entity (domain/)
4. Use Case → Repository Interface (domain/)
5. Repository Implementation (infrastructure/)
6. Database (PostgreSQL via Prisma)
7. Use Case → Event Publisher (infrastructure/)
8. RabbitMQ → Notification Service
```

---

## 🔐 Roles y Permisos

### Roles Disponibles

- **USER**: Usuario estándar
  - Ver sus propias tareas
  - Crear tareas
  - Editar sus tareas
  - Eliminar sus tareas

- **ADMIN**: Administrador
  - Todas las acciones de USER
  - Ver tareas de todos los usuarios
  - Gestionar usuarios

### Protección de Rutas

```typescript
// Solo usuarios autenticados
@UseGuards(JwtAuthGuard)

// Solo administradores
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
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

### Ejemplo de Test Unitario

```typescript
describe('CreateTaskUseCase', () => {
  it('should create a task and publish event', async () => {
    const dto = {
      title: 'Test Task',
      priority: TaskPriority.HIGH,
    };
    
    const result = await useCase.execute(dto, userId);
    
    expect(result.title).toBe('Test Task');
    expect(eventPublisher.publish).toHaveBeenCalled();
  });
});
```

---

## 🗄️ Base de Datos

### Modelos Prisma

#### User
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      UserRole @default(USER)
  tasks     Task[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### Task
```prisma
model Task {
  id          String       @id @default(uuid())
  title       String
  description String?
  status      TaskStatus   @default(PENDING)
  priority    TaskPriority @default(MEDIUM)
  dueDate     DateTime?
  userId      String
  user        User         @relation(fields: [userId], references: [id])
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}
```

### Migraciones

```bash
# Crear nueva migración
npx prisma migrate dev --name nombre_de_la_migracion

# Aplicar migraciones
npx prisma migrate deploy

# Reset de base de datos (desarrollo)
npx prisma migrate reset
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
npm run test:e2e          # Tests end-to-end
npm run test:cov          # Cobertura de tests

# Linting
npm run lint              # Revisa código
npm run format            # Formatea código
```

---

## 📄 Documentación API

### Swagger/OpenAPI

Accede a la documentación interactiva en:

👉 http://localhost:3000/api

Incluye:
- Todos los endpoints documentados
- Esquemas de request/response
- Posibilidad de probar endpoints directamente
- Autenticación con JWT

---

## 🔧 Configuración Avanzada

### Variables de Entorno Completas

```env
# Base de Datos
DATABASE_URL="postgresql://postgres:password@localhost:5436/taskflow?schema=public"

# JWT
JWT_SECRET="your-secret-key-minimum-32-characters"
JWT_EXPIRATION="1d"

# RabbitMQ
RABBITMQ_URL="amqp://localhost:5672"
RABBITMQ_QUEUE="tasks_queue"

# Servicio
NODE_ENV="development"
PORT=3000
SERVICE_NAME="task-service"

# Logging
LOG_LEVEL="debug"
```

---

## 🐛 Troubleshooting

### Error: Cannot connect to database

```bash
# Verifica que PostgreSQL esté corriendo
docker ps

# Reinicia contenedor si es necesario
cd ../../
docker-compose restart postgres
```

### Error: Cannot connect to RabbitMQ

```bash
# Verifica que RabbitMQ esté corriendo
docker-compose ps

# Revisa logs
docker-compose logs rabbitmq
```

### Error: Prisma Client not generated

```bash
# Genera el cliente nuevamente
npx prisma generate
```

---

## 📚 Recursos

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clean Architecture Guide](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

## 🚀 Despliegue

### Docker

```bash
# Construir imagen
docker build -t task-service .

# Ejecutar contenedor
docker run -p 3000:3000 --env-file .env task-service
```

### Variables de Entorno en Producción

Asegúrate de configurar:
- ✅ `JWT_SECRET` con un valor seguro y aleatorio
- ✅ `DATABASE_URL` apuntando a base de datos de producción
- ✅ `NODE_ENV=production`

---

**Puerto:** 3000  
**Swagger:** http://localhost:3000/api  
**Health Check:** http://localhost:3000/health
