import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Task, TaskStatus } from '../../types';
import { eachDayOfInterval, format, subDays, isWithinInterval, parseISO, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import '../../pages/DashboardCharts.css';
import './TasksAtRisk.css';
import './CalendarHeatmap.css';
import TasksAtRiskWidget from './TasksAtRiskWidget';

interface AnalyticsTabProps {
    tasks: Task[];
}

export default function AnalyticsTab({ tasks }: AnalyticsTabProps) {
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

        // Capitalize first letter of day
        const dayName = format(day, 'EEE', { locale: es });
        const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);

        return {
            day: capitalizedDay,
            completed: completedCount
        };
    });

    // Month-to-Month Comparison (This month vs Last month)
    const thisMonthStart = startOfMonth(new Date());
    const thisMonthEnd = endOfMonth(new Date());
    const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
    const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));

    const thisMonthCompleted = tasks.filter(task => {
        if (task.status !== TaskStatus.COMPLETED || !task.updatedAt) return false;
        const updatedDate = typeof task.updatedAt === 'string' ? parseISO(task.updatedAt) : task.updatedAt;
        return isWithinInterval(updatedDate, { start: thisMonthStart, end: thisMonthEnd });
    }).length;

    const lastMonthCompleted = tasks.filter(task => {
        if (task.status !== TaskStatus.COMPLETED || !task.updatedAt) return false;
        const updatedDate = typeof task.updatedAt === 'string' ? parseISO(task.updatedAt) : task.updatedAt;
        return isWithinInterval(updatedDate, { start: lastMonthStart, end: lastMonthEnd });
    }).length;

    const monthComparisonData = [
        { month: format(lastMonthStart, 'MMMM', { locale: es }), completed: lastMonthCompleted },
        { month: format(thisMonthStart, 'MMMM', { locale: es }), completed: thisMonthCompleted }
    ];

    // Calendar Heatmap Data (Last 3 months)
    const today = new Date();
    const threeMonthsAgo = subMonths(today, 3);
    const heatmapStartDate = startOfWeek(threeMonthsAgo, { weekStartsOn: 0 }); // Start on Sunday
    const heatmapEndDate = endOfWeek(today, { weekStartsOn: 0 });

    const heatmapDays = eachDayOfInterval({ start: heatmapStartDate, end: heatmapEndDate });

    const getIntensity = (count: number) => {
        if (count === 0) return 'level-0';
        if (count <= 2) return 'level-1';
        if (count <= 4) return 'level-2';
        if (count <= 6) return 'level-3';
        return 'level-4';
    };

    const getCompletedCountForDay = (day: Date) => {
        const dayStart = new Date(day.setHours(0, 0, 0, 0));
        const dayEnd = new Date(day.setHours(23, 59, 59, 999));
        return tasks.filter(task => {
            if (task.status !== TaskStatus.COMPLETED || !task.updatedAt) return false;
            const updatedDate = typeof task.updatedAt === 'string' ? parseISO(task.updatedAt) : task.updatedAt;
            return isWithinInterval(updatedDate, { start: dayStart, end: dayEnd });
        }).length;
    };

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
                {/* Tasks at Risk Widget (Full Width, Top) */}
                <div className="chart-card chart-card-wide">
                    <TasksAtRiskWidget tasks={tasks} limit={10} />
                </div>

                {/* Weekly Productivity Trend */}
                <div className="chart-card chart-card-wide">
                    <h2>📈 Productividad Semanal</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={weeklyTrendData}>
                            <defs>
                                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" />
                            <YAxis stroke="rgba(255,255,255,0.5)" />
                            <Tooltip contentStyle={customTooltipStyle} />
                            <Area
                                type="monotone"
                                dataKey="completed"
                                stroke="#10b981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorCompleted)"
                                name="Tareas Completadas"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Calendar Heatmap */}
                <div className="chart-card chart-card-wide">
                    <h2>📅 Actividad de Completado (Últimos 3 meses)</h2>
                    <div className="calendar-heatmap-container">
                        <div className="heatmap-grid">
                            {heatmapDays.map((day, index) => {
                                const count = getCompletedCountForDay(day);
                                const intensity = getIntensity(count);
                                return (
                                    <div
                                        key={index}
                                        className={`heatmap-day ${intensity}`}
                                        title={`${format(day, 'd MMM', { locale: es })}: ${count} tareas completadas`}
                                    />
                                );
                            })}
                        </div>
                        <div className="heatmap-legend">
                            <span>Menos</span>
                            <div className="legend-scale">
                                <div className="heatmap-day level-0"></div>
                                <div className="heatmap-day level-1"></div>
                                <div className="heatmap-day level-2"></div>
                                <div className="heatmap-day level-3"></div>
                                <div className="heatmap-day level-4"></div>
                            </div>
                            <span>Más</span>
                        </div>
                    </div>
                </div>

                {/* Month-to-Month Comparison */}
                <div className="chart-card">
                    <h2>📊 Comparación Mes a Mes</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthComparisonData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                            <YAxis stroke="rgba(255,255,255,0.5)" />
                            <Tooltip contentStyle={customTooltipStyle} />
                            <Bar dataKey="completed" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Tareas Completadas" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Tasks by Category */}
                <div className="chart-card chart-card-wide">
                    <h2>Tareas por Categoría</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={categoryChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                            <YAxis stroke="rgba(255,255,255,0.5)" />
                            <Tooltip contentStyle={customTooltipStyle} />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                {(categoryChartData as any[]).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
