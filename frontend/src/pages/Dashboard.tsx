import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, ListTodo, ClipboardList, Clock, Activity, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/api';
import { TaskStatus, TaskPriority } from '../types';
import type { Task } from '../types';
import TaskDetailModal from '../components/TaskDetailModal';
import './Dashboard.css';

type TabType = 'overview' | 'analytics' | 'tasks';

export default function Dashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
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

  const handleTaskClick = async (task: Task) => {
    try {
      // Fetch full task details to ensure category and subtasks are populated
      const fullTask = await apiService.getTask(task.id);
      setSelectedTask(fullTask);
    } catch (error) {
      console.error('Error loading task details:', error);
      // Fallback to the task from the list if fetch fails
      setSelectedTask(task);
    }
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
  };

  const handleEditTask = (taskId: string) => {
    navigate(`/tasks/${taskId}/edit`);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;
    try {
      await apiService.deleteTask(taskId);
      setSelectedTask(null);
      loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Error al eliminar la tarea');
    }
  };

  const handleToggleComplete = async (taskId: string, currentStatus: TaskStatus) => {
    try {
      const newStatus = currentStatus === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED;
      await apiService.updateTask(taskId, { status: newStatus });
      setSelectedTask(null);
      loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error al actualizar la tarea');
    }
  };

  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    try {
      await apiService.toggleSubtask(taskId, subtaskId);
      // Refresh task data to show updated subtask status
      const updatedTask = await apiService.getTask(taskId);
      setSelectedTask(updatedTask);
      loadTasks();
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  };

  const getStatusLabel = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.PENDING:
        return 'Pendiente';
      case TaskStatus.IN_PROGRESS:
        return 'En Progreso';
      case TaskStatus.COMPLETED:
        return 'Completada';
      case TaskStatus.CANCELLED:
        return 'Cancelada';
      default:
        return status;
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
          <div className="stat-icon"><ClipboardList size={24} /></div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Tareas</div>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon"><Clock size={24} /></div>
          <div className="stat-content">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pendientes</div>
          </div>
        </div>

        <div className="stat-card in-progress">
          <div className="stat-icon"><Activity size={24} /></div>
          <div className="stat-content">
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-label">En Progreso</div>
          </div>
        </div>

        <div className="stat-card completed">
          <div className="stat-icon"><CheckCircle2 size={24} /></div>
          <div className="stat-content">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completadas</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`dashboard-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={18} />
          Vista General
        </button>
        <button
          className={`dashboard-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <PieChartIcon size={18} />
          Análisis
        </button>
        <button
          className={`dashboard-tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <ListTodo size={18} />
          Tareas Recientes
        </button>
      </div>

      {/* Tab Content */}
      <div className="dashboard-tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-progress">
              <h2>Progreso General</h2>
              <div className="progress-circle">
                <svg className="progress-ring" width="200" height="200">
                  <circle
                    className="progress-ring-background"
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
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
            </div>

            <div className="overview-tasks">
              <div className="section-header">
                <h2>Tareas Recientes</h2>
                <button onClick={() => setActiveTab('tasks')} className="link-more">
                  Ver todas →
                </button>
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
                    <div
                      key={task.id}
                      onClick={() => handleTaskClick(task)}
                      className="task-item"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="task-title">{task.title}</div>
                      <div className="task-meta">
                        {task.category && (
                          <span
                            className="category-badge"
                            style={{
                              backgroundColor: `${task.category.color}20`,
                              color: task.category.color,
                              borderColor: `${task.category.color}40`,
                              marginRight: '0.5rem',
                              padding: '0.1rem 0.5rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              border: '1px solid'
                            }}
                          >
                            {task.category.icon} {task.category.name}
                          </span>
                        )}
                        <span className={`status-badge ${task.status.toLowerCase()}`}>
                          {getStatusLabel(task.status)}
                        </span>
                        <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            <div className="charts-section">
              <div className="chart-card">
                <h2>Tareas por Estado</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(30, 41, 59, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
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
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(30, 41, 59, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0.5rem'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h2>Tareas por Prioridad</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priorityChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(30, 41, 59, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="#a78bfa" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h2>Tareas por Categoría</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={Object.values(tasks.reduce((acc: any, task) => {
                      const catName = task.category?.name || 'Sin Categoría';
                      if (!acc[catName]) acc[catName] = { name: catName, value: 0, color: task.category?.color || '#94a3b8' };
                      acc[catName].value++;
                      return acc;
                    }, {}))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(30, 41, 59, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="#ec4899" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="tasks-tab">
            <div className="section-header">
              <h2>Todas las Tareas</h2>
              <Link to="/tasks" className="link-more">
                Ver Kanban →
              </Link>
            </div>
            {tasks.length === 0 ? (
              <div className="empty-state">
                <p>No hay tareas aún</p>
                <Link to="/tasks/new" className="btn-primary">
                  Crear Primera Tarea
                </Link>
              </div>
            ) : (
              <div className="task-list">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className="task-item"
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="task-title">{task.title}</div>
                    <div className="task-meta">
                      {task.category && (
                        <span
                          className="category-badge"
                          style={{
                            backgroundColor: `${task.category.color}20`,
                            color: task.category.color,
                            borderColor: `${task.category.color}40`,
                            marginRight: '0.5rem',
                            padding: '0.1rem 0.5rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            border: '1px solid'
                          }}
                        >
                          {task.category.icon} {task.category.name}
                        </span>
                      )}
                      <span className={`status-badge ${task.status.toLowerCase()}`}>
                        {getStatusLabel(task.status)}
                      </span>
                      <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={handleCloseModal}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onToggleComplete={handleToggleComplete}
          onToggleSubtask={handleToggleSubtask}
        />
      )}
    </div>
  );
}
