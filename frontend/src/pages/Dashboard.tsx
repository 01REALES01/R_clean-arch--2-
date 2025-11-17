import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { apiService } from '../services/api';
import { TaskStatus, TaskPriority } from '../types';
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

  // Data for charts
  const statusChartData = [
    { name: 'Pendientes', value: stats.pending, color: '#f59e0b' },
    { name: 'En Progreso', value: stats.inProgress, color: '#3b82f6' },
    { name: 'Completadas', value: stats.completed, color: '#10b981' },
  ];

  const priorityChartData = [
    { name: 'Baja', value: tasks.filter((t) => t.priority === TaskPriority.LOW).length },
    { name: 'Media', value: tasks.filter((t) => t.priority === TaskPriority.MEDIUM).length },
    { name: 'Alta', value: tasks.filter((t) => t.priority === TaskPriority.HIGH).length },
    { name: 'Urgente', value: tasks.filter((t) => t.priority === TaskPriority.URGENT).length },
  ];

  const completionRate = stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : '0';

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

      <div className="charts-section">
        <div className="chart-card">
          <h2>Tareas por Estado</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Distribución por Estado</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Tareas por Prioridad</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card progress-card">
          <h2>Progreso General</h2>
          <div className="progress-content">
            <div className="progress-circle">
              <svg className="progress-ring" width="200" height="200">
                <circle
                  className="progress-ring-background"
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="16"
                />
                <circle
                  className="progress-ring-progress"
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="16"
                  strokeDasharray={`${(parseFloat(completionRate || '0') / 100) * 502.65} 502.65`}
                  strokeDashoffset="0"
                  transform="rotate(-90 100 100)"
                  strokeLinecap="round"
                />
              </svg>
              <div className="progress-text">
                <span className="progress-percentage">{completionRate}%</span>
                <span className="progress-label">Completado</span>
              </div>
            </div>
            <div className="progress-stats">
              <div className="progress-stat-item">
                <span className="progress-stat-label">Completadas</span>
                <span className="progress-stat-value">{stats.completed}</span>
              </div>
              <div className="progress-stat-item">
                <span className="progress-stat-label">En Progreso</span>
                <span className="progress-stat-value">{stats.inProgress}</span>
              </div>
              <div className="progress-stat-item">
                <span className="progress-stat-label">Pendientes</span>
                <span className="progress-stat-value">{stats.pending}</span>
              </div>
            </div>
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

