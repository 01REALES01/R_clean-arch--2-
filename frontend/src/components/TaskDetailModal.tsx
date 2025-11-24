import React from 'react';
import { X, Calendar, Flag, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '../types';
import { renderCategoryIcon } from '../pages/Categories';
import './TaskDetailModal.css';

interface TaskDetailModalProps {
    task: Task;
    onClose: () => void;
    onEdit: (taskId: string) => void;
    onDelete: (taskId: string) => void;
    onToggleComplete: (taskId: string, currentStatus: TaskStatus) => void;
    onToggleSubtask?: (taskId: string, subtaskId: string) => void;
}

export default function TaskDetailModal({
    task,
    onClose,
    onEdit,
    onDelete,
    onToggleComplete,
    onToggleSubtask,
}: TaskDetailModalProps) {
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const getStatusBadgeClass = (status: TaskStatus) => {
        return `status-badge ${status.toLowerCase().replace('_', '-')}`;
    };

    const getPriorityBadgeClass = (priority: TaskPriority) => {
        return `priority-badge ${priority.toLowerCase()}`;
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

    const isCompleted = task.status === TaskStatus.COMPLETED;

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="task-detail-modal">
                <button className="modal-close-btn" onClick={onClose} aria-label="Close">
                    <X size={24} />
                </button>

                <div className="modal-header">
                    <h2>{task.title}</h2>
                    <div className="modal-badges">
                        <span className={getStatusBadgeClass(task.status)}>{getStatusLabel(task.status)}</span>
                        <span className={getPriorityBadgeClass(task.priority)}>{task.priority}</span>
                    </div>
                </div>

                <div className="modal-body">
                    {task.description && (
                        <div className="modal-section">
                            <h3>Description</h3>
                            <p>{task.description}</p>
                        </div>
                    )}

                    <div className="modal-meta">
                        {task.category && (
                            <div className="modal-meta-item">
                                <span
                                    className="category-badge"
                                    style={{
                                        backgroundColor: `${task.category.color}20`,
                                        color: task.category.color,
                                        borderColor: `${task.category.color}40`,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.875rem',
                                        border: '1px solid'
                                    }}
                                >
                                    {renderCategoryIcon(task.category.icon, 16)} {task.category.name}
                                </span>
                            </div>
                        )}
                        {task.dueDate && (
                            <div className="modal-meta-item">
                                <Calendar size={18} />
                                <span>
                                    Due: {new Date(task.dueDate).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </span>
                            </div>
                        )}
                        <div className="modal-meta-item">
                            <Flag size={18} />
                            <span>Priority: {task.priority}</span>
                        </div>
                    </div>

                    {task.subtasks && task.subtasks.length > 0 && (
                        <div className="modal-section">
                            <h3>Subtasks</h3>
                            <div className="subtasks-list">
                                {task.subtasks.map((subtask) => (
                                    <div
                                        key={subtask.id}
                                        className={`subtask-item ${subtask.completed ? 'completed' : ''}`}
                                        onClick={() => onToggleSubtask && onToggleSubtask(task.id, subtask.id)}
                                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '0.375rem', transition: 'background-color 0.2s' }}
                                    >
                                        <div className={`checkbox ${subtask.completed ? 'checked' : ''}`} style={{
                                            width: '1.25rem',
                                            height: '1.25rem',
                                            borderRadius: '0.25rem',
                                            border: '2px solid var(--text-secondary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: subtask.completed ? 'var(--primary)' : 'transparent',
                                            borderColor: subtask.completed ? 'var(--primary)' : 'var(--text-secondary)'
                                        }}>
                                            {subtask.completed && <CheckCircle size={14} color="white" />}
                                        </div>
                                        <span style={{
                                            textDecoration: subtask.completed ? 'line-through' : 'none',
                                            color: subtask.completed ? 'var(--text-secondary)' : 'var(--text-primary)'
                                        }}>
                                            {subtask.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {task.createdAt && (
                        <div className="modal-footer-info">
                            Created: {new Date(task.createdAt).toLocaleDateString('es-ES')}
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    {!isCompleted && (
                        <button
                            className="btn-action btn-complete"
                            onClick={() => onToggleComplete(task.id, task.status)}
                        >
                            <CheckCircle size={20} />
                            Mark Complete
                        </button>
                    )}
                    <button className="btn-action btn-edit" onClick={() => onEdit(task.id)}>
                        <Edit size={20} />
                        Edit
                    </button>
                    <button className="btn-action btn-delete" onClick={() => onDelete(task.id)}>
                        <Trash2 size={20} />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
