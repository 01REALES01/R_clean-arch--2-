import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, PieChart as PieChartIcon, ListTodo, ClipboardList, Clock, Activity, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/api';
import { TaskStatus } from '../types';
import type { Task } from '../types';
import TaskDetailModal from '../components/TaskDetailModal';
import OverviewTab from '../components/dashboard/OverviewTab';
import AnalyticsTab from '../components/dashboard/AnalyticsTab';
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
      const fullTask = await apiService.getTask(task.id);
      setSelectedTask(fullTask);
    } catch (error) {
      console.error('Error loading task details:', error);
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
          <OverviewTab
            stats={stats}
            recentTasks={recentTasks}
            onTaskClick={handleTaskClick}
            onViewAllTasks={() => setActiveTab('tasks')}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab tasks={tasks} stats={stats} />
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
