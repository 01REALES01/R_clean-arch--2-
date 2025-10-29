# 📦 Clean Architecture - Monolith (Legacy)

> Versión monolítica original del proyecto TaskFlow

---

## ⚠️ Nota Importante

**Este es código legacy.** La implementación activa está en el directorio `microservices/`.

Esta carpeta se mantiene como:
- ✅ Referencia histórica
- ✅ Comparación monolito vs microservicios
- ✅ Backup del código original

---

## 📖 ¿Qué contiene?

Implementación monolítica de TaskFlow con:
- Autenticación de usuarios
- Gestión de tareas
- Sistema de notificaciones
- Todo en una sola aplicación NestJS

---

## 🔄 Migración

Este código fue dividido en dos microservicios:

```
clean-arch/               →    microservices/
├── Task logic           →    ├── task-service/
└── Notification logic   →    └── notification-service/
```

---

## 🚀 Para usar el proyecto actual

Ve al directorio principal y sigue las instrucciones del README:

```bash
cd ..
# Lee README.md para instrucciones
```

O ve directamente a microservicios:

```bash
cd ../microservices
# Lee README.md para instrucciones
```

---

## 📚 Documentación Actual

- **[README principal →](../README.md)**
- **[Microservices →](../microservices/README.md)**
- **[Testing Guide →](../TESTING_GUIDE.md)**

---

**Nota:** Si necesitas usar este código legacy, asegúrate de:
1. Tener PostgreSQL y RabbitMQ corriendo
2. Configurar las variables de entorno
3. Ejecutar las migraciones de Prisma

Sin embargo, **se recomienda usar la versión de microservicios** en `microservices/`.

