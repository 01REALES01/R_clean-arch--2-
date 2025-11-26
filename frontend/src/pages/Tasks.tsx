import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { TaskStatus } from '../types';
import type { Task, Category } from '../types';
import { LayoutList, Kanban, Edit2, Trash2, Calendar, ListChecks } from 'lucide-react';
import KanbanBoard from '../components/KanbanBoard';
import TaskDetailModal from '../components/TaskDetailModal';
import { renderCategoryIcon } from './Categories';
import ConfirmModal from '../components/ConfirmModal';
import './Tasks.css';

export default function Tasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean, id: string | null }>({ open: false, id: null });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadTasks();
  }, [filter, categoryFilter]);

  const loadCategories = async () => {
    try {
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const status = filter !== 'all' ? filter : undefined;
      const categoryId = categoryFilter !== 'all' ? categoryFilter : undefined;
      const allTasks = await apiService.getTasks(status, categoryId);
      setTasks(allTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ open: true, id });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.id) return;

    try {
      await apiService.deleteTask(deleteConfirm.id);

      // If the deleted task was selected/open in modal, close it
      if (selectedTask && selectedTask.id === deleteConfirm.id) {
        setSelectedTask(null);
      }

      setDeleteConfirm({ open: false, id: null });
      loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Error al eliminar la tarea');
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

  const handleDeleteTask = (taskId: string) => {
    setDeleteConfirm({ open: true, id: taskId });
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
    // Optimistic update
    const updateTaskState = (taskList: Task[]) => {
      return taskList.map(t => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks?.map(s => {
            if (s.id === subtaskId) {
              return { ...s, completed: !s.completed };
            }
            return s;
          });
          return { ...t, subtasks: updatedSubtasks };
        }
        return t;
      });
    };

    // Update local state immediately
    setTasks(prevTasks => updateTaskState(prevTasks));

    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(prev => {
        if (!prev) return null;
        const updatedSubtasks = prev.subtasks?.map(s => {
          if (s.id === subtaskId) {
            return { ...s, completed: !s.completed };
          }
          return s;
        });
        return { ...prev, subtasks: updatedSubtasks };
      });
    }

    try {
      await apiService.toggleSubtask(taskId, subtaskId);
      // No need to reload tasks if optimistic update was successful
      // But we can fetch the specific task silently to ensure consistency
      const updatedTask = await apiService.getTask(taskId);

      // Update state with confirmed data from server
      setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? updatedTask : t));
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(updatedTask);
      }
    } catch (error) {
      console.error('Error toggling subtask:', error);
      // Revert on error (reload all tasks)
      loadTasks();
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
        <h1><ListChecks size={32} className="inline mr-2" />Mis Tareas</h1>
        <Link to="/tasks/new" className="btn-primary">
          + Nueva Tarea
        </Link>
      </div>

      <div className="tasks-controls">
        <div className="tasks-filters">
          <div className="filter-group">
            <span className="filter-label">Estado:</span>
            <div className="filter-buttons">
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
          </div>

          <div className="filter-group">
            <span className="filter-label">Categoría:</span>
            <select
              className="category-filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="Vista Lista"
          >
            <LayoutList size={20} />
          </button>
          <button
            className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
            onClick={() => setViewMode('kanban')}
            title="Vista Kanban"
          >
            <Kanban size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Cargando tareas...</div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <p>No hay tareas {filter !== 'all' || categoryFilter !== 'all' ? 'con estos filtros' : ''}</p>
          <Link to="/tasks/new" className="btn-primary">
            Crear Primera Tarea
          </Link>
        </div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard tasks={tasks} onTaskUpdate={loadTasks} />
      ) : (
        <div className="tasks-grid">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="task-card"
              onClick={() => handleTaskClick(task)}
              style={{ cursor: 'pointer' }}
            >
              <div className="task-card-header">
                <h3>{task.title}</h3>
                <div className="task-actions">
                  <Link
                    to={`/tasks/${task.id}/edit`}
                    className="btn-icon"
                    title="Editar"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Edit2 size={16} />
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(task.id);
                    }}
                    className="btn-icon"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {task.description && (
                <p className="task-description">{task.description}</p>
              )}

              <div className="task-meta">
                <span className={`status-badge ${getStatusColor(task.status)}`}>
                  {getStatusLabel(task.status)}
                </span>
                <span className={`priority-badge ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                {task.category && (
                  <span
                    className="category-badge"
                    style={{
                      backgroundColor: `${task.category.color}20`,
                      color: task.category.color,
                      borderColor: `${task.category.color}40`
                    }}
                  >
                    {renderCategoryIcon(task.category.icon, 14)} {task.category.name}
                  </span>
                )}
              </div>

              <div className="task-status-section">
                {task.subtasks && task.subtasks.length > 0 ? (
                  <div className="subtask-container">
                    <div className="subtask-header">
                      <span className="subtask-label">
                        Subtareas {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                      </span>
                      {task.dueDate && (
                        <span className="task-date">
                          <Calendar size={14} className="inline mr-1" /> {new Date(task.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  task.dueDate && (
                    <div className="task-date-only">
                      <Calendar size={14} className="inline mr-1" /> {new Date(task.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )
                )}
              </div>

              <div className="task-footer">
                <small>
                  Creada: {new Date(task.createdAt).toLocaleDateString('es-ES')}
                </small>
              </div>
            </div>
          ))
          }
        </div >
      )}

      {
        selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            onClose={handleCloseModal}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onToggleComplete={handleToggleComplete}
            onToggleSubtask={handleToggleSubtask}
          />
        )
      }

      <ConfirmModal
        isOpen={deleteConfirm.open}
        title="Eliminar Tarea"
        message="¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
        confirmText="Eliminar"
        danger
      />
    </div >
  );
}

