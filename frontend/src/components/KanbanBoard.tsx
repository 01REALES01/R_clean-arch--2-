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
  defaultDropAnimationSideEffects,
  DropAnimation,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MoreHorizontal } from 'lucide-react';
import { apiService } from '../services/api';
import { Task, TaskStatus } from '../types';
import './KanbanBoard.css';

interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  color: string;
}

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdate: () => void;
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

function KanbanCard({ task, isOverlay = false }: { task: Task; isOverlay?: boolean }) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'var(--danger)';
      case 'high': return 'var(--warning)';
      case 'medium': return 'var(--info)';
      case 'low': return 'var(--success)';
      default: return 'var(--text-tertiary)';
    }
  };

  const handleDoubleClick = () => {
    if (!isDragging) {
      navigate(`/tasks/${task.id}/edit`);
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`kanban-card ${isOverlay ? 'overlay' : ''}`}
      onDoubleClick={handleDoubleClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02, boxShadow: 'var(--shadow-glow)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="kanban-card-header">
        <div className="priority-badge" style={{ backgroundColor: getPriorityColor(task.priority) }}>
          {task.priority}
        </div>
        <button className="card-menu-btn">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <h4 className="task-title">{task.title}</h4>

      {task.description && (
        <p className="kanban-card-description">{task.description}</p>
      )}

      <div className="kanban-card-footer">
        <div className="card-meta">
          {task.dueDate && (
            <div className={`meta-item ${new Date(task.dueDate) < new Date() ? 'overdue' : ''}`}>
              <Calendar size={14} />
              <span>
                {new Date(task.dueDate).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>
          )}
        </div>
        <div className="user-avatar">
          {/* Placeholder for user avatar - using first letter of title as fallback */}
          {task.title.charAt(0).toUpperCase()}
        </div>
      </div>
    </motion.div>
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
      <div className="kanban-column-header" style={{ borderTopColor: column.color }}>
        <h3>{column.title}</h3>
        <span className="task-count" style={{ backgroundColor: `${column.color}20`, color: column.color }}>
          {columnTasks.length}
        </span>
      </div>
      <SortableContext items={columnTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="kanban-column-content">
          <AnimatePresence>
            {columnTasks.map((task) => (
              <KanbanCard key={task.id} task={task} />
            ))}
          </AnimatePresence>
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
    { id: TaskStatus.PENDING, title: 'Pendientes', tasks: [], color: '#cbd5e1' },
    { id: TaskStatus.IN_PROGRESS, title: 'En Progreso', tasks: [], color: '#6366f1' },
    { id: TaskStatus.COMPLETED, title: 'Completadas', tasks: [], color: '#10b981' },
    { id: TaskStatus.CANCELLED, title: 'Canceladas', tasks: [], color: '#ef4444' },
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
    const newStatus = Object.values(TaskStatus).includes(over.id as TaskStatus)
      ? (over.id as TaskStatus)
      : tasks.find((t) => t.id === over.id)?.status;

    if (!newStatus || task.status === newStatus) return;

    setIsUpdating(true);
    try {
      await apiService.updateTask(task.id, { status: newStatus });
      onTaskUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
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
      <DragOverlay dropAnimation={dropAnimation}>
        {activeTask ? (
          <KanbanCard task={activeTask} isOverlay />
        ) : null}
      </DragOverlay>
      {isUpdating && (
        <div className="kanban-updating">
          <div className="spinner"></div>
          <span>Sincronizando...</span>
        </div>
      )}
    </DndContext>
  );
}

