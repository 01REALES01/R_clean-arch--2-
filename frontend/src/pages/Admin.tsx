import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import type { AdminStatistics, User, Task, TaskStatus, TaskPriority } from '../types';
import { TaskStatus as TaskStatusEnum, TaskPriority as TaskPriorityEnum } from '../types';
import './Admin.css';

export default function Admin() {
  const [statistics, setStatistics] = useState<AdminStatistics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'tasks'>('stats');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData] = await Promise.all([
        apiService.getStatistics(),
        apiService.getAllUsers(),
      ]);
      setStatistics(statsData);
      setUsers(usersData.users);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllTasks = async (status?: TaskStatus | '', priority?: TaskPriority | '') => {
    try {
      const tasksData = await apiService.getAllTasks(
        status !== undefined ? (status || undefined) : (statusFilter || undefined),
        priority !== undefined ? (priority || undefined) : (priorityFilter || undefined),
      );
      setAllTasks(tasksData.tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  // Note: We don't auto-reload on filter change to avoid too many API calls
  // User must click "Aplicar Filtros" button

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario y todas sus tareas?')) return;

    try {
      await apiService.deleteUser(userId);
      loadData();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error al eliminar el usuario');
    }
  };

  if (loading) {
    return <div className="loading">Cargando datos de administración...</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Panel de Administración</h1>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Estadísticas
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Usuarios
        </button>
        <button
          className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('tasks');
            if (allTasks.length === 0) {
              // Reset filters and load all tasks
              setStatusFilter('');
              setPriorityFilter('');
              loadAllTasks();
            }
          }}
        >
          Todas las Tareas
        </button>
      </div>

      {activeTab === 'stats' && statistics && (
        <div className="admin-stats">
          <div className="stats-section">
            <h2>Usuarios</h2>
            <div className="stat-box">
              <div className="stat-value-large">{statistics.users.total}</div>
              <div className="stat-label">Total de Usuarios</div>
            </div>
            <div className="stats-breakdown">
              {statistics.users.byRole.map((role) => (
                <div key={role.role} className="breakdown-item">
                  <span>{role.role}:</span>
                  <strong>{role.count}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="stats-section">
            <h2>Tareas</h2>
            <div className="stat-box">
              <div className="stat-value-large">{statistics.tasks.total}</div>
              <div className="stat-label">Total de Tareas</div>
            </div>
            <div className="stats-breakdown">
              <div className="breakdown-item">
                <span>Pendientes:</span>
                <strong>{statistics.tasks.byStatus.pending}</strong>
              </div>
              <div className="breakdown-item">
                <span>En Progreso:</span>
                <strong>{statistics.tasks.byStatus.inProgress}</strong>
              </div>
              <div className="breakdown-item">
                <span>Completadas:</span>
                <strong>{statistics.tasks.byStatus.completed}</strong>
              </div>
            </div>
            <div className="priority-breakdown">
              <h3>Por Prioridad</h3>
              {statistics.tasks.byPriority.map((priority) => (
                <div key={priority.priority} className="breakdown-item">
                  <span>{priority.priority}:</span>
                  <strong>{priority.count}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="stats-section">
            <h2>Notificaciones</h2>
            <div className="stat-box">
              <div className="stat-value-large">{statistics.notifications.total}</div>
              <div className="stat-label">Total de Notificaciones</div>
            </div>
            {statistics.notifications.byUser && statistics.notifications.byUser.length > 0 && (
              <div className="priority-breakdown">
                <h3>Por Usuario</h3>
                {statistics.notifications.byUser.map((item) => (
                  <div key={item.userId} className="breakdown-item">
                    <span>{item.userEmail}:</span>
                    <strong>{item.count}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="admin-users">
          <div className="users-list">
            {users.map((user) => (
              <div key={user.id} className="user-card">
                <div className="user-info">
                  <div className="user-email">{user.email}</div>
                  <div className="user-role">{user.role}</div>
                  <div className="user-date">
                    Creado: {new Date(user.createdAt || '').toLocaleDateString('es-ES')}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="btn-danger"
                  disabled={user.role === 'ADMIN'}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="admin-tasks">
          <div className="tasks-filters">
            <div className="filter-group">
              <label htmlFor="status-filter">Filtrar por Estado:</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
                className="filter-select"
              >
                <option value="">Todos</option>
                <option value={TaskStatusEnum.PENDING}>Pendiente</option>
                <option value={TaskStatusEnum.IN_PROGRESS}>En Progreso</option>
                <option value={TaskStatusEnum.COMPLETED}>Completada</option>
                <option value={TaskStatusEnum.CANCELLED}>Cancelada</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="priority-filter">Filtrar por Prioridad:</label>
              <select
                id="priority-filter"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | '')}
                className="filter-select"
              >
                <option value="">Todas</option>
                <option value={TaskPriorityEnum.LOW}>Baja</option>
                <option value={TaskPriorityEnum.MEDIUM}>Media</option>
                <option value={TaskPriorityEnum.HIGH}>Alta</option>
                <option value={TaskPriorityEnum.URGENT}>Urgente</option>
              </select>
            </div>
            <button onClick={() => loadAllTasks()} className="btn-primary">
              Aplicar Filtros
            </button>
          </div>
          <div className="tasks-list">
            {allTasks.length === 0 ? (
              <div className="no-tasks">No hay tareas que coincidan con los filtros seleccionados.</div>
            ) : (
              allTasks.map((task) => (
                <div key={task.id} className="task-card-admin">
                  <div className="task-info">
                    <div className="task-title">{task.title}</div>
                    <div className="task-meta-admin">
                      <span className={`status-badge ${task.status.toLowerCase()}`}>
                        {task.status}
                      </span>
                      <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="task-user">Usuario: {task.userId}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

