// En desarrollo, usa localhost
// En producción/Docker, los servicios están en la misma red
const isDevelopment = import.meta.env.DEV;

export const API_CONFIG = {
  TASK_SERVICE: isDevelopment 
    ? 'http://localhost:3000' 
    : 'http://task-service:3000',
  NOTIFICATION_SERVICE: isDevelopment
    ? 'http://localhost:3001'
    : 'http://notification-service:3001',
} as const;

// Para el navegador, siempre usa localhost (el navegador no puede acceder a nombres de Docker)
export const API_CONFIG_BROWSER = {
  TASK_SERVICE: 'http://localhost:3000',
  NOTIFICATION_SERVICE: 'http://localhost:3001',
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER: 'user',
} as const;

