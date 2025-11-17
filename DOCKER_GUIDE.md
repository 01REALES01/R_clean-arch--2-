# 🐳 Guía de Dockerización Completa - TaskFlow

Todo el proyecto está completamente dockerizado y puede ejecutarse con un solo comando.

## 🚀 Inicio Rápido con Docker

### Opción 1: Todo en Docker (Recomendado para Producción)

```bash
cd microservices
docker-compose up -d
```

Esto iniciará:
- ✅ PostgreSQL (puerto 5436)
- ✅ RabbitMQ (puerto 5672, UI: 15672)
- ✅ Task Service (puerto 3000)
- ✅ Notification Service (puerto 3001)
- ✅ Frontend (puerto 80)

**Acceso:**
- Frontend: http://localhost
- Task Service API: http://localhost:3000/api
- Notification Service API: http://localhost:3001/api
- RabbitMQ Management: http://localhost:15672

### Opción 2: Solo Infraestructura en Docker (Desarrollo)

Si prefieres ejecutar los servicios Node.js localmente para desarrollo:

```bash
cd microservices
docker-compose up -d db rabbitmq
```

Luego ejecuta los servicios manualmente:
- Task Service: `cd task-service && npm run start:dev`
- Notification Service: `cd notification-service && npm run start:dev`
- Frontend: `cd frontend && npm run dev`

## 📋 Comandos Útiles

### Ver logs
```bash
docker-compose logs -f
```

### Ver logs de un servicio específico
```bash
docker-compose logs -f task-service
docker-compose logs -f notification-service
docker-compose logs -f frontend
```

### Detener todo
```bash
docker-compose down
```

### Detener y eliminar volúmenes (limpia la BD)
```bash
docker-compose down -v
```

### Reconstruir imágenes
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Reiniciar un servicio específico
```bash
docker-compose restart task-service
```

## 🔧 Configuración

### Variables de Entorno

Las variables de entorno están configuradas en el `docker-compose.yml`. Para producción, crea un archivo `.env` en la carpeta `microservices/`:

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
POSTGRES_PASSWORD=your-secure-password
RABBITMQ_USER=admin
RABBITMQ_PASS=your-secure-password
```

Luego actualiza el `docker-compose.yml` para usar estas variables:

```yaml
environment:
  JWT_SECRET: ${JWT_SECRET}
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
```

## 🏗️ Estructura de Servicios

```
┌─────────────────────────────────────────┐
│         Frontend (Nginx)                │
│         Port: 80                        │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────────────┐
│ Task Service│  │ Notification       │
│ Port: 3000  │  │ Service            │
│             │  │ Port: 3001         │
└──────┬──────┘  └─────┬──────────────┘
       │               │
       └───────┬───────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────┐         ┌──────▼──────┐
│PostgreSQL│       │  RabbitMQ   │
│Port: 5436│       │Port: 5672   │
└──────────┘       └─────────────┘
```

## 🐛 Troubleshooting

### Los servicios no inician

1. Verifica que los puertos no estén en uso:
```bash
netstat -ano | findstr "3000 3001 80 5436 5672"
```

2. Revisa los logs:
```bash
docker-compose logs
```

3. Reconstruye las imágenes:
```bash
docker-compose build --no-cache
```

### Frontend no se conecta al backend

El frontend está configurado para conectarse a:
- Task Service: `http://localhost:3000`
- Notification Service: `http://localhost:3001`

Si los servicios están en Docker, estos puertos deben estar expuestos (ya lo están en el docker-compose.yml).

### Error de migraciones de Prisma

Si hay errores de migraciones, ejecuta manualmente:

```bash
docker-compose exec task-service npx prisma migrate deploy
docker-compose exec notification-service npx prisma migrate deploy
```

## 📝 Notas

- **Desarrollo**: Usa `npm run start:dev` localmente para hot-reload
- **Producción**: Usa Docker para todo
- **Volúmenes**: La base de datos persiste en el volumen `db_data`
- **Redes**: Todos los servicios están en la red `taskflow-network`

## 🎯 Próximos Pasos

- [ ] Agregar docker-compose.override.yml para desarrollo
- [ ] Configurar variables de entorno desde archivo .env
- [ ] Agregar healthchecks más robustos
- [ ] Configurar SSL/TLS para producción
- [ ] Agregar reverse proxy (Nginx/Traefik)

---

**¡Todo está dockerizado y listo para usar!** 🐳🚀

