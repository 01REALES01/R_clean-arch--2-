import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { TaskStatus, TaskPriority, Category } from '../types';
import type { CreateTaskDto, UpdateTaskDto } from '../types';
import './TaskForm.css';

export default function TaskForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState<CreateTaskDto & UpdateTaskDto>({
    title: '',
    description: '',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    dueDate: '',
    categoryId: searchParams.get('categoryId') || '',
    subtasks: [],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // AI State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadTask();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadTask = async () => {
    try {
      const task = await apiService.getTask(id!);
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        categoryId: task.categoryId || '',
      });
      // If task has subtasks, load them (assuming backend returns them)
      if (task.subtasks) {
        setSubtasks(task.subtasks.map(s => s.title));
      }
    } catch (error) {
      console.error('Error loading task:', error);
      setError('Error al cargar la tarea');
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    try {
      const generatedTask = await apiService.generateTask(aiPrompt);

      setFormData(prev => ({
        ...prev,
        title: generatedTask.title,
        description: generatedTask.description,
        priority: generatedTask.priority || TaskPriority.MEDIUM,
        // Try to match category by name if possible, otherwise leave empty
        categoryId: categories.find(c => c.name.toLowerCase() === generatedTask.suggestedCategory?.toLowerCase())?.id || '',
      }));

      if (generatedTask.subtasks) {
        setSubtasks(generatedTask.subtasks);
      }

      setIsAiModalOpen(false);
      setAiPrompt('');
    } catch (error) {
      console.error('AI Generation error:', error);
      alert('Error generando tarea con IA');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const dataToSend: any = {
        title: formData.title,
        description: formData.description || undefined,
        status: formData.status,
        priority: formData.priority,
        categoryId: formData.categoryId || undefined,
        subtasks: subtasks.length > 0 ? subtasks : undefined,
      };

      if (formData.dueDate && formData.dueDate.trim() !== '') {
        dataToSend.dueDate = formData.dueDate;
      }

      if (isEdit) {
        await apiService.updateTask(id!, dataToSend);
      } else {
        await apiService.createTask(dataToSend);
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

  const handleSubtaskChange = (index: number, value: string) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index] = value;
    setSubtasks(newSubtasks);
  };

  const addSubtask = () => {
    setSubtasks([...subtasks, '']);
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  return (
    <div className="task-form-page">
      <div className="task-form-container">
        <div className="form-header">
          <h1>{isEdit ? 'Editar Tarea' : 'Nueva Tarea'}</h1>
          {!isEdit && (
            <button
              type="button"
              className="btn-magic"
              onClick={() => setIsAiModalOpen(true)}
            >
              ✨ Magic Task
            </button>
          )}
        </div>

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
              <label htmlFor="categoryId">Categoría</label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
              >
                <option value="">Sin categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
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
              <label htmlFor="dueDate">Fecha Límite</label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group subtasks-section">
            <label>Subtareas</label>
            {subtasks.map((subtask, index) => (
              <div key={index} className="subtask-input-group">
                <input
                  type="text"
                  value={subtask}
                  onChange={(e) => handleSubtaskChange(index, e.target.value)}
                  placeholder={`Subtarea ${index + 1}`}
                />
                <button
                  type="button"
                  className="btn-remove-subtask"
                  onClick={() => removeSubtask(index)}
                >
                  ×
                </button>
              </div>
            ))}
            <button type="button" className="btn-add-subtask" onClick={addSubtask}>
              + Añadir Subtarea
            </button>
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

        {/* AI Modal */}
        {isAiModalOpen && (
          <div className="modal-overlay" onClick={() => setIsAiModalOpen(false)}>
            <div className="modal-content ai-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>✨ Magic Task Assistant</h2>
                <button className="btn-close" onClick={() => setIsAiModalOpen(false)}>×</button>
              </div>
              <div className="ai-modal-body">
                <p>Describe tu tarea y la IA completará los detalles por ti.</p>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ej: Planear fiesta de cumpleaños para mi hermano el sábado..."
                  rows={4}
                  autoFocus
                />
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setIsAiModalOpen(false)}>
                  Cancelar
                </button>
                <button
                  className="btn-magic-submit"
                  onClick={handleAiGenerate}
                  disabled={aiLoading || !aiPrompt.trim()}
                >
                  {aiLoading ? 'Generando...' : '✨ Generar Tarea'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
