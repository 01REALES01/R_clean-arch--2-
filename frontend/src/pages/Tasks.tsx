import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { TaskStatus } from '../types';
import type { Task } from '../types';
import KanbanBoard from '../components/KanbanBoard';
import './Tasks.css';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  useEffect(() => {
    loadTasks();
  }, [filter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const status = filter !== 'all' ? filter : undefined;
      const allTasks = await apiService.getTasks(status);
      setTasks(allTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;

    try {
      await apiService.deleteTask(id);
      loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Error al eliminar la tarea');
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.PENDING:
        return 'pending';
      case TaskStatus.IN_PROGRESS:
        return 'in_progress';
      case TaskStatus.COMPLETED:
        return 'completed';
      case TaskStatus.CANCELLED:
        return 'cancelled';
      default:
        return '';
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority.toLowerCase();
  };

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <h1>Mis Tareas</h1>
        <Link to="/tasks/new" className="btn-primary">
          + Nueva Tarea
        </Link>
      </div>

      <div className="tasks-controls">
        <div className="tasks-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          <button
            className={`filter-btn ${filter === TaskStatus.PENDING ? 'active' : ''}`}
            onClick={() => setFilter(TaskStatus.PENDING)}
          >
            Pendientes
          </button>
          <button
            className={`filter-btn ${filter === TaskStatus.IN_PROGRESS ? 'active' : ''}`}
            onClick={() => setFilter(TaskStatus.IN_PROGRESS)}
          >
            En Progreso
          </button>
          <button
            className={`filter-btn ${filter === TaskStatus.COMPLETED ? 'active' : ''}`}
            onClick={() => setFilter(TaskStatus.COMPLETED)}
          >
            Completadas
          </button>
        </div>
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="Vista Lista"
          >
            📋
          </button>
          <button
            className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
            onClick={() => setViewMode('kanban')}
            title="Vista Kanban"
          >
            📊
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Cargando tareas...</div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <p>No hay tareas {filter !== 'all' ? 'con este filtro' : ''}</p>
          <Link to="/tasks/new" className="btn-primary">
            Crear Primera Tarea
          </Link>
        </div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard tasks={tasks} onTaskUpdate={loadTasks} />
      ) : (
        <div className="tasks-grid">
          {tasks.map((task) => (
            <div key={task.id} className="task-card">
              <div className="task-card-header">
                <h3>{task.title}</h3>
                <div className="task-actions">
                  <Link
                    to={`/tasks/${task.id}/edit`}
                    className="btn-icon"
                    title="Editar"
                  >
                    ✏️
                  </Link>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="btn-icon"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {task.description && (
                <p className="task-description">{task.description}</p>
              )}

              <div className="task-meta">
                <span className={`status-badge ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
                <span className={`priority-badge ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>

              {task.dueDate && (
                <div className="task-due-date">
                  📅 {new Date(task.dueDate).toLocaleDateString('es-ES')}
                </div>
              )}

              <div className="task-footer">
                <small>
                  Creada: {new Date(task.createdAt).toLocaleDateString('es-ES')}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

