# 🚀 TaskFlow - Microservices Clean Architecture

> Sistema de gestión de tareas construido con Clean Architecture y comunicación basada en eventos

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-red.svg)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-blue.svg)](https://www.postgresql.org/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.12-orange.svg)](https://www.rabbitmq.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Instalación Rápida](#-instalación-rápida)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Documentación](#-documentación)

---

## 📖 Descripción

**TaskFlow** es una aplicación de gestión de tareas que demuestra la implementación práctica de:

- ✅ **Clean Architecture** - Separación clara de capas y responsabilidades
- ✅ **Microservicios** - Dos servicios independientes que se comunican vía eventos
- ✅ **Event-Driven Architecture** - Comunicación asíncrona mediante RabbitMQ
- ✅ **Domain-Driven Design** - Lógica de negocio en el dominio
- ✅ **SOLID Principles** - Código mantenible y testeable

### Casos de Uso

- 🔐 Autenticación de usuarios (JWT)
- 📝 CRUD de tareas con estados y prioridades
- 🔔 Sistema de notificaciones automáticas
- 👥 Control de acceso basado en roles (RBAC)

---

## 🏗️ Arquitectura

### Microservicios

```
┌──────────────────────────────┐         ┌──────────────────────────────┐
│   Task Service (Port 3000)   │         │ Notification Service (3001)  │
│                              │         │                              │
│  • Autenticación (JWT)       │         │  • Gestión de Notificaciones │
│  • Gestión de Tareas         │         │  • Consumidor de Eventos     │
│  • Publicador de Eventos     │         │  • Envío de Emails (opcional)│
│                              │         │                              │
│        PostgreSQL            │         │        PostgreSQL            │
└──────────────┬───────────────┘         └───────────┬──────────────────┘
               │                                     │
               └─────────► RabbitMQ ◄───────────────┘
                     (Event Bus)
```

### Capas de Clean Architecture

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │  ← Controllers, DTOs, Swagger
├─────────────────────────────────────────┤
│         Application Layer               │  ← Use Cases, Business Logic
├─────────────────────────────────────────┤
│           Domain Layer                  │  ← Entities, Interfaces, Events
├─────────────────────────────────────────┤
│       Infrastructure Layer              │  ← Database, Auth, Messaging
└─────────────────────────────────────────┘
```

**Regla de Dependencia:** Las capas internas no conocen las externas. El dominio es independiente de frameworks.

---

## 🛠️ Tecnologías

### Backend
- **Framework:** NestJS 10 (Node.js)
- **Lenguaje:** TypeScript 5
- **Base de Datos:** PostgreSQL 14
- **ORM:** Prisma
- **Message Broker:** RabbitMQ

### Seguridad
- **Autenticación:** JWT (JSON Web Tokens)
- **Autorización:** Guards personalizados
- **Password:** bcrypt hashing

### DevOps
- **Containerización:** Docker & Docker Compose
- **Testing:** Jest
- **API Documentation:** Swagger/OpenAPI

---

## ⚡ Instalación Rápida

### Prerrequisitos

- Node.js 18+ y npm
- Docker Desktop
- Git

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd R_clean-arch--2-
```

### 2. Iniciar Infraestructura (PostgreSQL + RabbitMQ)

```bash
cd microservices
docker-compose up -d
```

Espera a que los contenedores estén listos (~30 segundos).

### 3. Configurar Variables de Entorno

Ejecuta el script para crear los archivos `.env` automáticamente:

```bash
# Windows
create-env-files.bat

# Linux/Mac
chmod +x create-env-files.sh
./create-env-files.sh
```

O crea manualmente `.env` en ambos servicios con:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5436/taskflow?schema=public"
RABBITMQ_URL="amqp://localhost:5672"
JWT_SECRET="your-secret-key-here"
JWT_EXPIRATION="1d"
NODE_ENV="development"
```

### 4. Iniciar Task Service

```bash
cd task-service
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

Espera el mensaje: `🚀 Task Service running on: http://localhost:3000`

### 5. Iniciar Notification Service

Abre otra terminal:

```bash
cd microservices/notification-service
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

Espera el mensaje: `🔔 Notification Service running on: http://localhost:3001`

### 6. Verificar

- ✅ Task Service: http://localhost:3000/api
- ✅ Notification Service: http://localhost:3001/api
- ✅ RabbitMQ Management: http://localhost:15672 (guest/guest)

---

## 🧪 Prueba Rápida

### 1. Registrar Usuario

```bash
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!",
  "name": "Test User"
}
```

### 2. Login

```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!"
}
```

Copia el `access_token` de la respuesta.

### 3. Crear Tarea

```bash
POST http://localhost:3000/tasks
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Mi primera tarea",
  "description": "Descripción de la tarea",
  "priority": "HIGH"
}
```

### 4. Ver Notificaciones (creada automáticamente)

```bash
GET http://localhost:3001/notifications
Authorization: Bearer <access_token>
```

🎉 ¡Verás una notificación automática de la tarea creada!

---

## 📁 Estructura del Proyecto

```
R_clean-arch--2-/
├── microservices/
│   ├── task-service/           # Servicio de Tareas
│   │   ├── src/
│   │   │   ├── domain/         # Entidades, interfaces, eventos
│   │   │   ├── application/    # Casos de uso, DTOs
│   │   │   ├── infrastructure/ # DB, Auth, Messaging
│   │   │   └── presentation/   # Controllers, DTOs validados
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Modelo de datos
│   │   └── test-api.http       # Ejemplos de API
│   │
│   ├── notification-service/   # Servicio de Notificaciones
│   │   ├── src/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   └── presentation/
│   │   └── prisma/
│   │
│   ├── docker-compose.yml      # PostgreSQL + RabbitMQ
│   ├── start-docker.bat        # Script de inicio
│   └── README.md               # Guía de microservicios
│
├── clean-arch/                 # Código legacy (monolito)
├── TESTING_GUIDE.md            # Guía completa de pruebas
└── README.md                   # Este archivo
```

---

## 📚 Documentación

### Guías Disponibles

- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Guía completa de pruebas con ejemplos
- **[microservices/README.md](microservices/README.md)** - Detalles de arquitectura de microservicios
- **[task-service/README.md](microservices/task-service/README.md)** - Documentación del servicio de tareas
- **[notification-service/README.md](microservices/notification-service/README.md)** - Documentación del servicio de notificaciones

### Swagger/OpenAPI

Cada servicio expone su documentación interactiva:

- Task Service: http://localhost:3000/api
- Notification Service: http://localhost:3001/api

---

## 🎯 Características Destacadas

### 1. Clean Architecture

- **Independencia de Frameworks:** La lógica de negocio no depende de NestJS
- **Testabilidad:** Cada capa puede ser testeada independientemente
- **Mantenibilidad:** Cambios en una capa no afectan otras
- **Flexibilidad:** Fácil cambiar de Prisma a TypeORM, o de REST a GraphQL

### 2. Microservicios Reales

- **Servicios Independientes:** Cada uno con su propio repositorio y lógica
- **Comunicación Asíncrona:** Eventos vía RabbitMQ
- **Escalabilidad:** Cada servicio puede escalar por separado
- **Resiliencia:** Si un servicio falla, el otro continúa funcionando

### 3. Event-Driven Architecture

```typescript
// Task Service publica evento
await eventPublisher.publish('task.created', taskData);

// Notification Service consume evento
@EventHandler('task.created')
async handleTaskCreated(event: TaskCreatedEvent) {
  await this.createNotification(event);
}
```

### 4. Repository Pattern

```typescript
// Interfaz en el dominio (independiente de la implementación)
interface TaskRepository {
  create(task: Task): Promise<Task>;
  findById(id: string): Promise<Task | null>;
}

// Implementación en infraestructura (usa Prisma)
class PrismaTaskRepository implements TaskRepository {
  // ...
}
```

### 5. Inyección de Dependencias

```typescript
// Use Case recibe interfaz, no implementación concreta
constructor(
  @Inject(TASK_REPOSITORY)
  private readonly taskRepository: TaskRepository
) {}
```

---

## 🚦 Comandos Útiles

### Gestión de Docker

```bash
# Iniciar infraestructura
cd microservices
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Limpiar todo (incluyendo volúmenes)
docker-compose down -v
```

### Desarrollo

```bash
# Modo desarrollo (hot reload)
npm run start:dev

# Compilar para producción
npm run build

# Ejecutar tests
npm test

# Linting
npm run lint
```

### Prisma

```bash
# Generar cliente de Prisma
npx prisma generate

# Aplicar migraciones
npx prisma migrate deploy

# Ver base de datos en el navegador
npx prisma studio
```

---

## 🏃 Scripts de Inicio Rápido

### Windows

```bash
# Iniciar todo
cd microservices
start-docker.bat

# Detener todo
stop-docker.bat
```

### Linux/Mac

```bash
# Hacer scripts ejecutables
chmod +x microservices/*.sh

# Iniciar todo
cd microservices
./start-docker.sh
```

---

## 🎓 Principios Aplicados

### SOLID

- **S**ingle Responsibility: Cada clase tiene una única responsabilidad
- **O**pen/Closed: Abierto a extensión, cerrado a modificación
- **L**iskov Substitution: Subtipos deben ser sustituibles por sus tipos base
- **I**nterface Segregation: Interfaces específicas mejor que generales
- **D**ependency Inversion: Depender de abstracciones, no de implementaciones

### Design Patterns

- **Repository Pattern** - Abstracción del acceso a datos
- **Dependency Injection** - Inversión de control
- **Event-Driven** - Comunicación desacoplada
- **DTO Pattern** - Transferencia de datos validada
- **Strategy Pattern** - Múltiples implementaciones de una interfaz

---

## 🔐 Seguridad

- ✅ Passwords hasheados con bcrypt
- ✅ JWT para autenticación stateless
- ✅ Guards para protección de rutas
- ✅ Validación de DTOs con class-validator
- ✅ Variables de entorno para secretos
- ✅ CORS configurado correctamente

---

## 📊 Base de Datos

### Esquema Principal

```
User
├── id: UUID
├── email: String (unique)
├── password: String (hashed)
├── name: String
├── role: Enum (USER, ADMIN)
└── tasks: Task[]

Task
├── id: UUID
├── title: String
├── description: String
├── status: Enum (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
├── priority: Enum (LOW, MEDIUM, HIGH, URGENT)
├── dueDate: DateTime
├── userId: UUID
└── user: User

Notification
├── id: UUID
├── userId: UUID
├── type: Enum (TASK_CREATED, TASK_UPDATED, etc.)
├── title: String
├── message: String
├── status: Enum (PENDING, READ, SENT, FAILED)
└── user: User
```

---

## 🤝 Contribución

Este es un proyecto académico para demostrar Clean Architecture y microservicios.

### Mejoras Futuras

- [ ] API Gateway con Nginx o Kong
- [ ] Autenticación OAuth2
- [ ] GraphQL para consultas complejas
- [ ] CQRS para separar lecturas/escrituras
- [ ] Event Sourcing para historial completo
- [ ] Circuit Breaker para resiliencia
- [ ] Distributed Tracing con Jaeger

---

## 📝 Licencia

MIT License - Proyecto Académico

---

## 👨‍💻 Autor

Proyecto desarrollado como demostración de Clean Architecture y Microservicios para presentación universitaria.

---

## 🙏 Agradecimientos

- Clean Architecture by Robert C. Martin
- Domain-Driven Design by Eric Evans
- NestJS Framework Documentation
- Prisma ORM Team

---

**¿Preguntas?** Consulta la [Guía de Testing](TESTING_GUIDE.md) para ejemplos completos de uso.

🚀 **¡Happy Coding!**
