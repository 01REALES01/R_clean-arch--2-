# 🚀 Guía de Inicio Completo - TaskFlow

Esta guía te ayudará a iniciar tanto el backend como el frontend del proyecto TaskFlow.

## 📋 Prerrequisitos

- Node.js 18+ y npm
- Docker Desktop (para PostgreSQL y RabbitMQ)
- Git

## 🔧 Paso 1: Iniciar la Infraestructura (Docker)

Abre una terminal y ejecuta:

```bash
cd microservices
docker-compose up -d
```

Esto iniciará:
- ✅ PostgreSQL en el puerto 5436
- ✅ RabbitMQ en el puerto 5672 (UI en http://localhost:15672)

Espera unos 30 segundos a que los contenedores estén listos.

**Verificar:**
- RabbitMQ Management: http://localhost:15672 (usuario: `guest`, password: `guest`)

## 🔧 Paso 2: Configurar Variables de Entorno

### Opción A: Script Automático (Windows)

```bash
cd microservices
create-env-files.bat
```

### Opción B: Manual

Crea archivos `.env` en ambos servicios:

**`microservices/task-service/.env`:**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5436/taskflow?schema=public"
RABBITMQ_URL="amqp://localhost:5672"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRATION="1d"
NODE_ENV="development"
PORT=3000
```

**`microservices/notification-service/.env`:**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5436/taskflow?schema=public"
RABBITMQ_URL="amqp://localhost:5672"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRATION="1d"
NODE_ENV="development"
PORT=3001
```

⚠️ **IMPORTANTE:** El `JWT_SECRET` debe ser el mismo en ambos servicios.

## 🔧 Paso 3: Iniciar Task Service

Abre una **nueva terminal**:

```bash
cd microservices/task-service
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

Espera el mensaje: `🚀 Task Service running on: http://localhost:3000`

**Swagger:** http://localhost:3000/api

## 🔧 Paso 4: Iniciar Notification Service

Abre **otra terminal**:

```bash
cd microservices/notification-service
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

Espera el mensaje: `🔔 Notification Service running on: http://localhost:3001`

**Swagger:** http://localhost:3001/api

## 🔧 Paso 5: Iniciar Frontend

Abre **otra terminal**:

```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en: **http://localhost:5173**

## ✅ Verificación

### Backend
- ✅ Task Service: http://localhost:3000/api
- ✅ Notification Service: http://localhost:3001/api
- ✅ RabbitMQ: http://localhost:15672

### Frontend
- ✅ Aplicación: http://localhost:5173

## 🧪 Prueba Rápida

1. Abre http://localhost:5173 en tu navegador
2. Regístrate con un nuevo usuario
3. Crea una tarea
4. Verifica que aparezca una notificación automática

## 📝 Notas Importantes

### Si los puertos están en uso:

**Windows (PowerShell):**
```powershell
# Detener proceso en puerto 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Detener proceso en puerto 3001
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force

# Detener proceso en puerto 5173
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
```

### Detener Docker:

```bash
cd microservices
docker-compose down
```

### Limpiar todo (incluyendo base de datos):

```bash
cd microservices
docker-compose down -v
```

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
- Verifica que Docker esté corriendo
- Verifica que PostgreSQL esté iniciado: `docker-compose ps`
- Revisa las variables de entorno en `.env`

### Error: "Port already in use"
- Usa los comandos de PowerShell arriba para detener procesos
- O cambia los puertos en los archivos `.env` y `vite.config.ts`

### Error: "JWT verification failed"
- Asegúrate de que `JWT_SECRET` sea el mismo en ambos servicios
- Reinicia ambos servicios después de cambiar el secret

### Frontend no se conecta al backend
- Verifica que ambos servicios backend estén corriendo
- Verifica las URLs en `frontend/src/config/api.ts`
- Revisa la consola del navegador para errores CORS

## 🎯 Orden de Inicio Recomendado

1. Docker (PostgreSQL + RabbitMQ)
2. Task Service
3. Notification Service
4. Frontend

## 📚 Documentación

- **Backend:** Ver `README.md` y `microservices/README.md`
- **Frontend:** Ver `frontend/README.md`
- **API:** Swagger en http://localhost:3000/api y http://localhost:3001/api

---

**¡Listo!** Ahora deberías tener todo funcionando. 🚀

