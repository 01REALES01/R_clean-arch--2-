import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { TaskStatus } from '../types';
import type { Task } from '../types';
import './Dashboard.css';

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    total: 0,
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const allTasks = await apiService.getTasks();
      setTasks(allTasks);
      setStats({
        pending: allTasks.filter((t) => t.status === TaskStatus.PENDING).length,
        inProgress: allTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
        completed: allTasks.filter((t) => t.status === TaskStatus.COMPLETED).length,
        total: allTasks.length,
      });
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  const recentTasks = tasks.slice(0, 5);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <Link to="/tasks/new" className="btn-primary">
          + Nueva Tarea
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Tareas</div>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pendientes</div>
          </div>
        </div>

        <div className="stat-card in-progress">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-label">En Progreso</div>
          </div>
        </div>

        <div className="stat-card completed">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completadas</div>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="section">
          <div className="section-header">
            <h2>Tareas Recientes</h2>
            <Link to="/tasks" className="link-more">
              Ver todas →
            </Link>
          </div>
          {recentTasks.length === 0 ? (
            <div className="empty-state">
              <p>No hay tareas aún</p>
              <Link to="/tasks/new" className="btn-primary">
                Crear Primera Tarea
              </Link>
            </div>
          ) : (
            <div className="task-list">
              {recentTasks.map((task) => (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}/edit`}
                  className="task-item"
                >
                  <div className="task-title">{task.title}</div>
                  <div className="task-meta">
                    <span className={`status-badge ${task.status.toLowerCase()}`}>
                      {task.status}
                    </span>
                    <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

