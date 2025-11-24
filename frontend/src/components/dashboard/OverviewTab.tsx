import { Link } from 'react-router-dom';
import { Task, TaskStatus } from '../../types';

interface OverviewTabProps {
    stats: {
        pending: number;
        inProgress: number;
        completed: number;
        total: number;
    };
    recentTasks: Task[];
    onTaskClick: (task: Task) => void;
    onViewAllTasks: () => void;
}

export default function OverviewTab({ stats, recentTasks, onTaskClick, onViewAllTasks }: OverviewTabProps) {
    const completionRate = stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : '0';

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

    return (
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
                    <button onClick={onViewAllTasks} className="link-more">
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
                                onClick={() => onTaskClick(task)}
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
    );
}
