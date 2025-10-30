# 🏗️ TaskFlow Microservices

> Arquitectura de microservicios con comunicación basada en eventos

---

## 📖 Descripción

Dos microservicios independientes que se comunican asíncronamente vía RabbitMQ:

### 📝 Task Service (Port 3000)
- Autenticación de usuarios (JWT)
- Gestión completa de tareas (CRUD)
- Publicación de eventos a RabbitMQ
- Control de acceso basado en roles

**[📚 Ver documentación completa →](task-service/README.md)**

### 🔔 Notification Service (Port 3001)
- Gestión de notificaciones
- Consumo de eventos desde RabbitMQ
- Creación automática de notificaciones
- Envío de emails (opcional)

**[📚 Ver documentación completa →](notification-service/README.md)**

---

## 🏗️ Arquitectura

```
┌───────────────────────────┐          ┌──────────────────────────┐
│   Task Service (3000)     │          │ Notification Service     │
│                           │          │       (3001)             │
│  • REST API               │          │  • REST API              │
│  • JWT Auth               │          │  • Event Consumer        │
│  • Task CRUD              │          │  • Notifications CRUD    │
│  • Event Publisher        │          │  • Email Sender          │
│                           │          │                          │
│  ┌─────────────────────┐ │          │  ┌────────────────────┐ │
│  │   PostgreSQL        │ │          │  │   PostgreSQL       │ │
│  │   (Port 5436)       │ │          │  │   (Port 5436)      │ │
│  └─────────────────────┘ │          │  └────────────────────┘ │
└───────────┬───────────────┘          └──────────┬───────────────┘
            │                                     │
            │         ┌───────────────┐          │
            └────────►│   RabbitMQ    │◄─────────┘
                      │  (Port 5672)  │
                      │  UI: 15672    │
                      └───────────────┘
```

### Flujo de Comunicación

1. Usuario crea una tarea en **Task Service**
2. **Task Service** guarda la tarea en la base de datos
3. **Task Service** publica evento `task.created` a RabbitMQ
4. **Notification Service** consume el evento
5. **Notification Service** crea automáticamente una notificación
6. Usuario consulta notificaciones en **Notification Service**

---

## ⚡ Inicio Rápido

### Prerrequisitos

- Node.js 18+
- Docker Desktop (para PostgreSQL y RabbitMQ)
- npm o yarn

### 1. Iniciar Infraestructura

```bash
# En el directorio microservices/
docker-compose up -d
```

Esto inicia:
- ✅ PostgreSQL (puerto 5436)
- ✅ RabbitMQ (puerto 5672, UI en 15672)

### 2. Configurar Variables de Entorno

**Opción A: Script automático (Windows)**
```bash
create-env-files.bat
```

**Opción B: Manual**

Crea `.env` en ambos servicios (`task-service/` y `notification-service/`):

```env
DATABASE_URL="postgresql://postgres:password@localhost:5436/taskflow?schema=public"
RABBITMQ_URL="amqp://localhost:5672"
JWT_SECRET="your-secret-key-here-change-in-production"
JWT_EXPIRATION="1d"
NODE_ENV="development"
```

### 3. Iniciar Task Service

**Terminal 1:**
```bash
cd task-service
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

Espera: `🚀 Task Service running on: http://localhost:3000`

### 4. Iniciar Notification Service

**Terminal 2:**
```bash
cd notification-service
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

Espera: `🔔 Notification Service running on: http://localhost:3001`

### 5. Verificar

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

Copia el `access_token`.

### 3. Crear Tarea
```bash
POST http://localhost:3000/tasks
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Mi primera tarea",
  "priority": "HIGH"
}
```

### 4. Ver Notificación Automática
```bash
GET http://localhost:3001/notifications
Authorization: Bearer <access_token>
```

🎉 **¡Deberías ver una notificación automática de la tarea creada!**

---

## 📁 Estructura del Proyecto

```
microservices/
├── task-service/              # Servicio de Tareas
│   ├── src/
│   │   ├── domain/           # Entidades, interfaces
│   │   ├── application/      # Casos de uso
│   │   ├── infrastructure/   # DB, Auth, RabbitMQ
│   │   └── presentation/     # Controllers, DTOs
│   ├── prisma/
│   │   └── schema.prisma     # Modelo de datos
│   ├── test-api.http         # Ejemplos de API
│   └── README.md             # Documentación detallada
│
├── notification-service/      # Servicio de Notificaciones
│   ├── src/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── prisma/
│   └── README.md             # Documentación detallada
│
├── docker-compose.yml         # PostgreSQL + RabbitMQ
├── create-env-files.bat      # Script de configuración
└── README.md                 # Este archivo
```

---

## 🎯 Características Destacadas

### 🔹 Clean Architecture
Cada servicio sigue Clean Architecture con 4 capas:
- **Domain**: Lógica de negocio pura
- **Application**: Casos de uso
- **Infrastructure**: Implementaciones técnicas
- **Presentation**: API REST

### 🔹 Event-Driven
Comunicación desacoplada mediante eventos:
- Servicios independientes
- Asincronía
- Escalabilidad

### 🔹 Shared Database (Simple)
Ambos servicios comparten PostgreSQL para simplicidad:
- Fácil de configurar
- Ideal para desarrollo
- En producción: cada servicio tendría su propia BD

### 🔹 JWT Compartido
Token de autenticación funciona en ambos servicios:
- Login en Task Service
- Token válido en Notification Service
- Misma clave secreta (`JWT_SECRET`)

---

## 🛠️ Scripts Útiles

### Windows

```bash
# Crear archivos .env
create-env-files.bat

# Iniciar infraestructura
start-docker.bat

# Detener infraestructura
stop-docker.bat
```

### Linux/Mac

```bash
# Dar permisos
chmod +x *.sh

# Crear archivos .env
./create-env-files.sh

# Iniciar infraestructura
./start-docker.sh

# Detener infraestructura
./stop-docker.sh
```

---

## 🔧 Gestión de Docker

### Comandos Básicos

```bash
# Iniciar servicios
docker-compose up -d

# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f postgres
docker-compose logs -f rabbitmq

# Reiniciar servicios
docker-compose restart

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (limpia la BD)
docker-compose down -v
```

### Verificar RabbitMQ

Accede a: http://localhost:15672
- Usuario: `guest`
- Password: `guest`

Verifica:
- ✅ Queue `tasks_queue` existe
- ✅ Hay 1 consumer activo (Notification Service)
- ✅ Mensajes siendo procesados

---

## 📊 Monitoreo

### Health Checks

```bash
# Task Service
curl http://localhost:3000/health

# Notification Service
curl http://localhost:3001/health
```

### Logs

```bash
# Ver todos los logs
docker-compose logs -f

# Solo PostgreSQL
docker-compose logs -f postgres

# Solo RabbitMQ
docker-compose logs -f rabbitmq
```

---

## 🐛 Troubleshooting

### Error: Puerto 3000 o 3001 en uso

**Síntoma:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solución Rápida:**
```bash
# Windows - Usa el script
cd microservices
stop-services.bat

# O con PowerShell
.\stop-services.ps1

# O manualmente
netstat -ano | findstr :3000
taskkill /F /PID <PID>
```

**Solución PowerShell (Una línea):**
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force
```

### PostgreSQL no inicia

```bash
# Ver logs
docker-compose logs postgres

# Reiniciar
docker-compose restart postgres

# Si persiste, eliminar y recrear
docker-compose down -v
docker-compose up -d
```

### RabbitMQ no recibe mensajes

1. Verifica que ambos servicios estén corriendo
2. Revisa que `RABBITMQ_URL` sea igual en ambos `.env`
3. Accede a http://localhost:15672 y verifica la queue

### Servicios no se conectan

1. Verifica que Docker esté corriendo
2. Revisa que los puertos no estén en uso:
   ```bash
   netstat -an | findstr "5436 5672 15672"
   ```
3. Revisa las variables de entorno en `.env`

---

## 📚 Documentación Adicional

### Por Servicio
- **[Task Service →](task-service/README.md)** - Documentación completa del servicio de tareas
- **[Notification Service →](notification-service/README.md)** - Documentación completa del servicio de notificaciones

### General
- **[TESTING_GUIDE.md](../TESTING_GUIDE.md)** - Guía completa de testing con ejemplos

### API Interactive
- Task Service: http://localhost:3000/api
- Notification Service: http://localhost:3001/api

---

## 🎓 Conceptos Demostrados

✅ **Microservicios** - Servicios independientes y desplegables por separado  
✅ **Clean Architecture** - Separación de capas y responsabilidades  
✅ **Event-Driven** - Comunicación asíncrona vía eventos  
✅ **Domain-Driven Design** - Lógica de negocio en el dominio  
✅ **Repository Pattern** - Abstracción del acceso a datos  
✅ **Dependency Injection** - Inversión de control  
✅ **SOLID Principles** - Código mantenible y testeable  

---

## 🚀 Siguiente Nivel

### Mejoras Posibles

- [ ] **API Gateway** - Punto de entrada unificado (Nginx/Kong)
- [ ] **Service Discovery** - Registro dinámico de servicios (Consul)
- [ ] **Circuit Breaker** - Resiliencia ante fallos (Resilience4j)
- [ ] **Distributed Tracing** - Seguimiento de peticiones (Jaeger)
- [ ] **Centralized Logging** - Logs centralizados (ELK Stack)
- [ ] **Database per Service** - BD independiente por servicio
- [ ] **CQRS** - Separación de lectura/escritura
- [ ] **Event Sourcing** - Historial completo de eventos

---

## 📄 Licencia

MIT License - Proyecto Académico

---

**¿Necesitas ayuda?** Consulta la documentación específica de cada servicio o la [Guía de Testing](../TESTING_GUIDE.md).

🚀 **¡Happy Coding!**
