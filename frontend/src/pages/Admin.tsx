import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import type { AdminStatistics, User, Task } from '../types';
import './Admin.css';

export default function Admin() {
  const [statistics, setStatistics] = useState<AdminStatistics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'tasks'>('stats');

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

  const loadAllTasks = async () => {
    try {
      const tasksData = await apiService.getAllTasks();
      setAllTasks(tasksData.tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

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
            if (allTasks.length === 0) loadAllTasks();
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
          <div className="tasks-list">
            {allTasks.map((task) => (
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

