import { Task, TaskStatus } from '../../types';
import { parseISO, differenceInHours, compareAsc, format } from 'date-fns';
import './TasksAtRisk.css';

interface TasksAtRiskWidgetProps {
    tasks: Task[];
    limit?: number;
    compact?: boolean;
}

export default function TasksAtRiskWidget({ tasks, limit = 5, compact = false }: TasksAtRiskWidgetProps) {
    const tasksAtRisk = tasks
        .filter(t => (t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS) && t.dueDate)
        .sort((a, b) => compareAsc(parseISO(a.dueDate!), parseISO(b.dueDate!)))
        .slice(0, limit);

    const getRiskLevel = (dueDate: string) => {
        const hoursLeft = differenceInHours(parseISO(dueDate), new Date());
        if (hoursLeft < 0) return 'overdue';
        if (hoursLeft < 24) return 'critical';
        if (hoursLeft < 72) return 'warning';
        return 'safe';
    };

    if (tasksAtRisk.length === 0) {
        if (compact) return null; // Don't show in dashboard if empty
        return (
            <div className="chart-card">
                <h2>⚠️ Tareas en Riesgo</h2>
                <div className="no-risk-tasks">
                    <p>¡Todo bajo control! No hay tareas próximas a vencer.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`chart-card ${compact ? 'compact-risk-widget' : ''}`}>
            <h2>⚠️ Tareas en Riesgo</h2>
            <div className={`tasks-at-risk-list ${compact ? 'compact-list' : ''}`}>
                {tasksAtRisk.map(task => {
                    const riskLevel = task.dueDate ? getRiskLevel(task.dueDate) : 'safe';
                    const riskColor = riskLevel === 'overdue' ? '#ef4444' :
                        riskLevel === 'critical' ? '#f97316' :
                            riskLevel === 'warning' ? '#eab308' : '#22c55e';

                    return (
                        <div key={task.id} className="risk-task-item" style={{ borderLeft: `4px solid ${riskColor}` }}>
                            <div className="risk-task-info">
                                <span className="risk-task-title">{task.title}</span>
                                <span className="risk-task-time">
                                    {task.dueDate && format(parseISO(task.dueDate), 'd MMM, HH:mm')}
                                </span>
                            </div>
                            <div className="risk-task-status">
                                <span className={`risk-badge ${riskLevel}`}>
                                    {riskLevel === 'overdue' ? 'Vencida' :
                                        riskLevel === 'critical' ? '< 24h' :
                                            riskLevel === 'warning' ? '< 3 días' : 'A tiempo'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
