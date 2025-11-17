import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { TaskStatus, TaskPriority } from '../types';
import type { CreateTaskDto, UpdateTaskDto } from '../types';
import './TaskForm.css';

export default function TaskForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState<CreateTaskDto & UpdateTaskDto>({
    title: '',
    description: '',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    dueDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      loadTask();
    }
  }, [id]);

  const loadTask = async () => {
    try {
      const task = await apiService.getTask(id!);
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      });
    } catch (error) {
      console.error('Error loading task:', error);
      setError('Error al cargar la tarea');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        await apiService.updateTask(id!, formData);
      } else {
        await apiService.createTask(formData);
      }
      navigate('/tasks');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar la tarea');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="task-form-page">
      <div className="task-form-container">
        <h1>{isEdit ? 'Editar Tarea' : 'Nueva Tarea'}</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="title">Título *</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Ej: Completar proyecto"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Descripción detallada de la tarea..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Estado</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value={TaskStatus.PENDING}>Pendiente</option>
                <option value={TaskStatus.IN_PROGRESS}>En Progreso</option>
                <option value={TaskStatus.COMPLETED}>Completada</option>
                <option value={TaskStatus.CANCELLED}>Cancelada</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Prioridad</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value={TaskPriority.LOW}>Baja</option>
                <option value={TaskPriority.MEDIUM}>Media</option>
                <option value={TaskPriority.HIGH}>Alta</option>
                <option value={TaskPriority.URGENT}>Urgente</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Fecha Límite</label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

