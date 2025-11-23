# TaskFlow Frontend

Frontend de la aplicación TaskFlow construido con React + TypeScript + Vite.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ y npm
- Backend corriendo (Task Service en puerto 3000 y Notification Service en puerto 3001)

### Instalación

```bash
cd frontend
npm install
```

### Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: http://localhost:5173

### Build para Producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`.

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/      # Componentes reutilizables
│   │   ├── Layout.tsx
│   │   └── NotificationBadge.tsx
│   ├── contexts/       # Contextos de React
│   │   └── AuthContext.tsx
│   ├── pages/          # Páginas de la aplicación
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Tasks.tsx
│   │   ├── TaskForm.tsx
│   │   ├── Notifications.tsx
│   │   └── Admin.tsx
│   ├── services/       # Servicios API
│   │   └── api.ts
│   ├── config/         # Configuración
│   │   └── api.ts
│   ├── types/          # Tipos TypeScript
│   │   └── index.ts
│   ├── App.tsx         # Componente principal
│   ├── main.tsx        # Punto de entrada
│   └── index.css       # Estilos globales
├── public/             # Archivos estáticos
├── index.html
├── vite.config.ts
└── package.json
```

## 🎨 Características

- ✅ Autenticación con JWT
- ✅ Gestión completa de tareas (CRUD)
- ✅ Sistema de notificaciones en tiempo real
- ✅ Panel de administración
- ✅ Diseño moderno y responsive
- ✅ TypeScript para type safety
- ✅ React Router para navegación
- ✅ Axios para peticiones HTTP

## 🔧 Configuración

### URLs de los Servicios

Las URLs están configuradas en `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  TASK_SERVICE: 'http://localhost:3000',
  NOTIFICATION_SERVICE: 'http://localhost:3001',
};
```

Para producción, actualiza estas URLs según corresponda.

## 📱 Páginas

- **Login** (`/login`): Inicio de sesión
- **Register** (`/register`): Registro de usuarios
- **Dashboard** (`/dashboard`): Vista general con estadísticas
- **Tasks** (`/tasks`): Lista de tareas con filtros
- **Task Form** (`/tasks/new`, `/tasks/:id/edit`): Crear/editar tareas
- **Notifications** (`/notifications`): Lista de notificaciones
- **Admin** (`/admin`): Panel de administración (solo ADMIN)

## 🛠️ Tecnologías

- **React 19**: Framework UI
- **TypeScript**: Type safety
- **Vite**: Build tool
- **React Router**: Navegación
- **Axios**: Cliente HTTP
- **CSS**: Estilos personalizados

## 📝 Notas

- El token JWT se guarda en `localStorage`
- Las notificaciones se actualizan cada 30 segundos
- El frontend se comunica con ambos microservicios
- CORS está habilitado en el backend

## 🚀 Próximos Pasos

- [ ] WebSockets para notificaciones en tiempo real
- [ ] Tests unitarios
- [ ] Mejoras de accesibilidad
- [ ] Optimización de rendimiento
- [ ] PWA support

