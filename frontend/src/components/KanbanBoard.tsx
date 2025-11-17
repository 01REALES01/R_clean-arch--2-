import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { apiService } from '../services/api';
import type { Task, TaskStatus } from '../types';
import { TaskStatus as TaskStatusEnum } from '../types';
import './KanbanBoard.css';

interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdate: () => void;
}

function KanbanCard({ task }: { task: Task }) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return '#ef4444';
      case 'high':
        return '#f59e0b';
      case 'medium':
        return '#3b82f6';
      case 'low':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const handleDoubleClick = () => {
    if (!isDragging) {
      navigate(`/tasks/${task.id}/edit`);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="kanban-card"
      onDoubleClick={handleDoubleClick}
      title="Doble clic para editar"
    >
      <div className="kanban-card-header">
        <h4>{task.title}</h4>
      </div>
      {task.description && (
        <p className="kanban-card-description">{task.description}</p>
      )}
      <div className="kanban-card-footer">
        <div className="kanban-card-meta">
          <span
            className="priority-dot"
            style={{ backgroundColor: getPriorityColor(task.priority) }}
            title={task.priority}
          />
          {task.dueDate && (
            <span className="due-date">
              📅 {new Date(task.dueDate).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ column, tasks }: { column: KanbanColumn; tasks: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const columnTasks = tasks.filter((task) => task.status === column.id);

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column ${isOver ? 'drag-over' : ''}`}
    >
      <div className="kanban-column-header">
        <h3>{column.title}</h3>
        <span className="task-count">{columnTasks.length}</span>
      </div>
      <SortableContext items={columnTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="kanban-column-content">
          {columnTasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default function KanbanBoard({ tasks, onTaskUpdate }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const columns: KanbanColumn[] = [
    { id: TaskStatusEnum.PENDING, title: 'Pendientes', tasks: [] },
    { id: TaskStatusEnum.IN_PROGRESS, title: 'En Progreso', tasks: [] },
    { id: TaskStatusEnum.COMPLETED, title: 'Completadas', tasks: [] },
    { id: TaskStatusEnum.CANCELLED, title: 'Canceladas', tasks: [] },
  ];

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const task = tasks.find((t) => t.id === active.id);
    if (!task) return;

    // Check if dropped on a column (status) or another task
    const newStatus = Object.values(TaskStatusEnum).includes(over.id as TaskStatus)
      ? (over.id as TaskStatus)
      : tasks.find((t) => t.id === over.id)?.status;

    if (!newStatus || task.status === newStatus) return;

    setIsUpdating(true);
    try {
      await apiService.updateTask(task.id, { status: newStatus });
      onTaskUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error al actualizar la tarea');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        {columns.map((column) => (
          <KanbanColumn key={column.id} column={column} tasks={tasks} />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="kanban-card dragging">
            <div className="kanban-card-header">
              <h4>{activeTask.title}</h4>
            </div>
            {activeTask.description && (
              <p className="kanban-card-description">{activeTask.description}</p>
            )}
          </div>
        ) : null}
      </DragOverlay>
      {isUpdating && (
        <div className="kanban-updating">
          <div className="spinner"></div>
          <span>Actualizando...</span>
        </div>
      )}
    </DndContext>
  );
}

