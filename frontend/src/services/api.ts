import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';
import { API_CONFIG_BROWSER, STORAGE_KEYS } from '../config/api';
import type {
  LoginDto,
  RegisterDto,
  LoginResponse,
  RegisterResponse,
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  Notification,
  UnreadCountResponse,
  AdminStatistics,
  User,
  Category,
  CreateCategoryDto,
} from '../types';

class ApiService {
  private taskApi: AxiosInstance;
  private notificationApi: AxiosInstance;

  constructor() {
    this.taskApi = axios.create({
      baseURL: API_CONFIG_BROWSER.TASK_SERVICE,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.notificationApi = axios.create({
      baseURL: API_CONFIG_BROWSER.NOTIFICATION_SERVICE,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptores para agregar token
    this.taskApi.interceptors.request.use((config) => {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.notificationApi.interceptors.request.use((config) => {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor para manejar errores 401
    this.taskApi.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    this.notificationApi.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async login(credentials: LoginDto): Promise<LoginResponse> {
    const response = await this.taskApi.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  }

  async register(data: RegisterDto): Promise<RegisterResponse> {
    const response = await this.taskApi.post<RegisterResponse>('/auth/register', data);
    return response.data;
  }

  async registerAdmin(data: RegisterDto): Promise<RegisterResponse> {
    const response = await this.taskApi.post<RegisterResponse>('/auth/register-admin', data);
    return response.data;
  }

  // Tasks
  async getTasks(status?: string, categoryId?: string): Promise<Task[]> {
    const params: any = {};
    if (status) {
      params.status = status;
    }
    if (categoryId) {
      params.categoryId = categoryId;
    }
    const response = await this.taskApi.get<Task[]>('/tasks', { params });
    return response.data;
  }

  async getTask(id: string): Promise<Task> {
    const response = await this.taskApi.get<Task>(`/tasks/${id}`);
    return response.data;
  }

  async createTask(data: CreateTaskDto): Promise<Task> {
    const response = await this.taskApi.post<Task>('/tasks', data);
    return response.data;
  }

  async updateTask(id: string, data: UpdateTaskDto): Promise<Task> {
    const response = await this.taskApi.patch<Task>(`/tasks/${id}`, data);
    return response.data;
  }

  async deleteTask(id: string): Promise<void> {
    await this.taskApi.delete(`/tasks/${id}`);
  }

  async toggleSubtask(taskId: string, subtaskId: string): Promise<void> {
    await this.taskApi.patch(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const response = await this.taskApi.get<Category[]>('/categories');
    return response.data;
  }

  async createCategory(data: CreateCategoryDto): Promise<Category> {
    const response = await this.taskApi.post<Category>('/categories', data);
    return response.data;
  }

  async deleteCategory(id: string): Promise<void> {
    await this.taskApi.delete(`/categories/${id}`);
  }

  // AI
  async generateTask(prompt: string): Promise<any> {
    const response = await this.taskApi.post('/ai/generate', { prompt });
    return response.data;
  }

  async chat(message: string): Promise<{ message: string; timestamp: string }> {
    const response = await this.taskApi.post('/ai/chat', { message });
    return response.data;
  }

  // Notifications
  async getNotifications(status?: string): Promise<Notification[]> {
    const url = status ? `/notifications?status=${status}` : '/notifications';
    const response = await this.notificationApi.get<Notification[]>(url);
    return response.data;
  }

  async getUnreadCount(): Promise<number> {
    const response = await this.notificationApi.get<UnreadCountResponse>('/notifications/unread-count');
    return response.data.count;
  }

  async markNotificationAsRead(id: string): Promise<Notification> {
    const response = await this.notificationApi.patch<Notification>(`/notifications/${id}/read`);
    return response.data;
  }

  async deleteNotification(id: string): Promise<void> {
    await this.notificationApi.delete(`/notifications/${id}`);
  }

  // Admin
  async getAllUsers(): Promise<{ total: number; users: User[] }> {
    const response = await this.taskApi.get<{ total: number; users: User[] }>('/admin/users');
    return response.data;
  }

  async getUserTasks(userId: string, status?: string): Promise<{ user: User; tasks: Task[] }> {
    const url = status ? `/admin/users/${userId}/tasks?status=${status}` : `/admin/users/${userId}/tasks`;
    const response = await this.taskApi.get<{ user: User; tasks: Task[] }>(url);
    return response.data;
  }

  async getAllTasks(status?: string, priority?: string): Promise<{ total: number; tasks: Task[] }> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    const queryString = params.toString();
    const url = queryString ? `/admin/tasks/all?${queryString}` : '/admin/tasks/all';
    const response = await this.taskApi.get<{ total: number; tasks: Task[] }>(url);
    return response.data;
  }

  async getStatistics(): Promise<AdminStatistics> {
    const response = await this.taskApi.get<AdminStatistics>('/admin/statistics');
    return response.data;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.taskApi.delete(`/admin/users/${userId}`);
  }

  async deleteTaskAsAdmin(taskId: string): Promise<void> {
    await this.taskApi.delete(`/admin/tasks/${taskId}`);
  }
}

export const apiService = new ApiService();
