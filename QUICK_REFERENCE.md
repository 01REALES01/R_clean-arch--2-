# ⚡ Guía Rápida - TaskFlow con Docker

> Comandos esenciales para tu presentación

---

## 🚀 **INICIAR EL PROYECTO**

```bash
cd microservices
docker-compose up -d
```

**Espera 30 segundos** para que todo esté listo.

---

## 🌐 **URLs Importantes**

```
Task Service Swagger:         http://localhost:3000/api
Notification Service Swagger: http://localhost:3001/api
RabbitMQ Management:          http://localhost:15672
  Usuario: guest
  Password: guest
```

---

## 🛑 **DETENER EL PROYECTO**

```bash
cd microservices
docker-compose down
```

---

## 🔍 **VERIFICAR QUE TODO ESTÁ CORRIENDO**

```bash
docker ps
```

Debes ver 4 contenedores:
- ✅ taskflow_task_service (puerto 3000)
- ✅ taskflow_notification_service (puerto 3001)
- ✅ taskflow_db (PostgreSQL)
- ✅ taskflow_rabbitmq (puerto 5672 y 15672)

---

## 📊 **VER LOGS**

```bash
# Todos los servicios
docker-compose logs -f

# Solo un servicio
docker-compose logs -f task-service
docker-compose logs -f notification-service
```

Para salir de los logs: `Ctrl + C`

---

## 🔄 **REINICIAR SERVICIOS**

```bash
# Reiniciar todo
docker-compose restart

# Reiniciar un servicio específico
docker-compose restart task-service
docker-compose restart notification-service
```

---

## 🧪 **DATOS DE PRUEBA PARA LA DEMO**

### **1. Registro**
```json
POST http://localhost:3000/auth/register

{
  "email": "demo@taskflow.com",
  "password": "Demo123!",
  "name": "Demo User"
}
```

### **2. Login**
```json
POST http://localhost:3000/auth/login

{
  "email": "demo@taskflow.com",
  "password": "Demo123!"
}
```

**➜ Copiar el `access_token`**

### **3. Autorizar en Swagger**
En ambos Swagger (3000 y 3001):
- Click en **"Authorize"** 🔒
- Escribir: `Bearer <tu_access_token>`
- Click **"Authorize"**
- Click **"Close"**

### **4. Crear Tarea**
```json
POST http://localhost:3000/tasks

{
  "title": "Completar presentación",
  "description": "Demostrar Clean Architecture con microservicios",
  "priority": "HIGH",
  "dueDate": "2025-11-01T23:59:59Z"
}
```

### **5. Ver Notificaciones Automáticas**
```
GET http://localhost:3001/notifications
```

🎉 **¡Verás una notificación creada automáticamente!**

### **6. Actualizar Tarea**
```json
PATCH http://localhost:3000/tasks/{id}

{
  "status": "IN_PROGRESS"
}
```

### **7. Ver Segunda Notificación**
```
GET http://localhost:3001/notifications
```

---

## 🎬 **CHECKLIST PRE-PRESENTACIÓN**

**30 minutos antes:**

- [ ] Docker Desktop iniciado
- [ ] Ejecutar: `cd microservices && docker-compose up -d`
- [ ] Esperar 30 segundos
- [ ] Verificar: `docker ps` (4 contenedores corriendo)
- [ ] Abrir pestañas del navegador:
  - [ ] http://localhost:3000/api
  - [ ] http://localhost:3001/api
  - [ ] http://localhost:15672
- [ ] Probar registro + login + crear tarea
- [ ] Tener QUICK_REFERENCE.md abierto

**Archivos para mostrar en VS Code:**
- README.md
- task-service/src/application/use-cases/task/create-task.use-case.ts
- task-service/src/domain/entities/task.entity.ts
- notification-service/src/infrastructure/messaging/handlers/task-event.handler.ts

---

## 🆘 **SOLUCIÓN DE PROBLEMAS**

### **Error: Docker no inicia**

```bash
# Reiniciar Docker Desktop (desde el GUI)
# O reiniciar servicios:
docker-compose down
docker-compose up -d
```

### **Error: Puerto ocupado**

```bash
# Ver qué está usando el puerto
netstat -ano | findstr :3000

# Si es un contenedor viejo:
docker stop <container_id>
docker rm <container_id>

# Reiniciar todo limpio:
docker-compose down
docker-compose up -d
```

### **Error: Base de datos vacía**

```bash
# Reiniciar con datos limpios
docker-compose down -v
docker-compose up -d
```

### **Servicios no responden**

```bash
# Ver logs para diagnosticar
docker-compose logs task-service
docker-compose logs notification-service

# Reiniciar servicios
docker-compose restart
```

---

## 📝 **COMANDOS DE REFERENCIA**

| Acción | Comando |
|--------|---------|
| **Iniciar todo** | `docker-compose up -d` |
| **Detener todo** | `docker-compose down` |
| **Ver estado** | `docker ps` |
| **Ver logs** | `docker-compose logs -f` |
| **Reiniciar** | `docker-compose restart` |
| **Limpiar todo** | `docker-compose down -v` |

---

## 🎯 **TU FLUJO PARA LA PRESENTACIÓN**

```bash
# 1. Antes de llegar
cd microservices
docker-compose down
docker-compose up -d

# 2. Espera 30 segundos mientras te preparas

# 3. Abre navegador con las 3 URLs

# 4. Haz la demo en Swagger (sigue los pasos de arriba)

# 5. Muestra el código en VS Code

# 6. ¡Éxito! 🎉
```

---

## 💡 **RESPUESTAS A PREGUNTAS FRECUENTES**

**P: ¿Por qué usar Docker?**
> R: "Docker asegura que la aplicación funcione igual en cualquier ambiente. Es el estándar de la industria para deployment."

**P: ¿Qué pasa si un servicio falla?**
> R: "Los contenedores tienen health checks. Docker puede reiniciarlos automáticamente. Además, los servicios están desacoplados, uno puede fallar sin afectar al otro."

**P: ¿Cómo escalas esto?**
> R: "Con Docker Compose en desarrollo, con Kubernetes en producción. Cada servicio puede tener múltiples réplicas."

**P: ¿Por qué microservicios?**
> R: "Independencia: cada equipo puede trabajar en su servicio. Escalabilidad: escalo solo lo que necesito. Resiliencia: si uno falla, los demás continúan."

---

🎯 **¡Todo listo para tu presentación! Suerte!** 🚀
