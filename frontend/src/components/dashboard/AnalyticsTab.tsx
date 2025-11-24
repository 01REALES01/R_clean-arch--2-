import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { eachDayOfInterval, format, subDays, isWithinInterval, parseISO } from 'date-fns';

interface AnalyticsTabProps {
    tasks: Task[];
    stats: {
        pending: number;
        inProgress: number;
        completed: number;
        total: number;
    };
}

export default function AnalyticsTab({ tasks, stats }: AnalyticsTabProps) {
    // Status chart data
    const statusChartData = [
        { name: 'Pendientes', value: stats.pending, color: '#f59e0b' },
        { name: 'En Progreso', value: stats.inProgress, color: '#3b82f6' },
        { name: 'Completadas', value: stats.completed, color: '#10b981' },
    ];

    // Priority chart data
    const priorityChartData = [
        { name: 'Baja', value: tasks.filter((t) => t.priority === TaskPriority.LOW).length },
        { name: 'Media', value: tasks.filter((t) => t.priority === TaskPriority.MEDIUM).length },
        { name: 'Alta', value: tasks.filter((t) => t.priority === TaskPriority.HIGH).length },
        { name: 'Urgente', value: tasks.filter((t) => t.priority === TaskPriority.URGENT).length },
    ];

    // Category chart data
    const categoryChartData = Object.values(tasks.reduce((acc: any, task) => {
        const catName = task.category?.name || 'Sin Categoría';
        if (!acc[catName]) acc[catName] = { name: catName, value: 0, color: task.category?.color || '#94a3b8' };
        acc[catName].value++;
        return acc;
    }, {}));

    // Weekly productivity trend (last 7 days)
    const last7Days = eachDayOfInterval({
        start: subDays(new Date(), 6),
        end: new Date()
    });

    const weeklyTrendData = last7Days.map(day => {
        const dayStart = new Date(day.setHours(0, 0, 0, 0));
        const dayEnd = new Date(day.setHours(23, 59, 59, 999));

        const completedCount = tasks.filter(task => {
            if (task.status !== TaskStatus.COMPLETED || !task.updatedAt) return false;
            const updatedDate = typeof task.updatedAt === 'string' ? parseISO(task.updatedAt) : task.updatedAt;
            return isWithinInterval(updatedDate, { start: dayStart, end: dayEnd });
        }).length;

        return {
            day: format(day, 'EEE'),
            completed: completedCount
        };
    });

    // Custom tooltip styling
    const customTooltipStyle = {
        background: 'rgba(30, 41, 59, 0.95)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '0.75rem',
        padding: '0.75rem',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    };

    return (
        <div className="analytics-tab">
            <div className="charts-section">
                {/* Weekly Productivity Trend */}
                <div className="chart-card chart-card-wide">
                    <h2>📈 Productividad Semanal</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={weeklyTrendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" />
                            <YAxis stroke="rgba(255,255,255,0.5)" />
                            <Tooltip contentStyle={customTooltipStyle} />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="completed"
                                stroke="#10b981"
                                strokeWidth={3}
                                dot={{ fill: '#10b981', r: 5 }}
                                activeDot={{ r: 8 }}
                                name="Tareas Completadas"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Tasks by Status (Bar) */}
                <div className="chart-card">
                    <h2>Tareas por Estado</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={statusChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                            <YAxis stroke="rgba(255,255,255,0.5)" />
                            <Tooltip contentStyle={customTooltipStyle} />
                            <Legend />
                            <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Status Distribution (Pie) */}
                <div className="chart-card">
                    <h2>Distribución por Estado</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusChartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {statusChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={customTooltipStyle} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Tasks by Priority */}
                <div className="chart-card">
                    <h2>Tareas por Prioridad</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={priorityChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                            <YAxis stroke="rgba(255,255,255,0.5)" />
                            <Tooltip contentStyle={customTooltipStyle} />
                            <Legend />
                            <Bar dataKey="value" fill="#a78bfa" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Tasks by Category */}
                <div className="chart-card">
                    <h2>Tareas por Categoría</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={categoryChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                            <YAxis stroke="rgba(255,255,255,0.5)" />
                            <Tooltip contentStyle={customTooltipStyle} />
                            <Legend />
                            <Bar dataKey="value" fill="#ec4899" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
