import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, parseISO, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { apiService } from '../../services/api';
import { Task } from '../../types';
import './WeekCalendar.css';

interface WeekCalendarProps {
    onTaskClick?: (task: Task) => void;
}

export default function WeekCalendar({ onTaskClick }: WeekCalendarProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const allTasks = await apiService.getTasks();
            setTasks(allTasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTasksForDay = (day: Date) => {
        return tasks.filter(task => {
            if (!task.dueDate) return false;
            const taskDate = typeof task.dueDate === 'string' ? parseISO(task.dueDate) : task.dueDate;
            return isSameDay(taskDate, day);
        });
    };

    const handlePreviousWeek = () => {
        setCurrentWeekStart(addDays(currentWeekStart, -7));
    };

    const handleNextWeek = () => {
        setCurrentWeekStart(addDays(currentWeekStart, 7));
    };

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

    if (loading) {
        return <div className="week-calendar-loading">Cargando...</div>;
    }

    return (
        <div className="week-calendar-widget">
            <div className="week-calendar-header">
                <div className="week-calendar-title">
                    <CalendarIcon size={20} />
                    <h3>Esta Semana</h3>
                </div>
                <div className="week-calendar-nav">
                    <button onClick={handlePreviousWeek} className="week-nav-btn">
                        <ChevronLeft size={16} />
                    </button>
                    <span className="week-range">
                        {format(weekDays[0], 'd MMM', { locale: es })} - {format(weekDays[6], 'd MMM', { locale: es })}
                    </span>
                    <button onClick={handleNextWeek} className="week-nav-btn">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="week-calendar-grid">
                {weekDays.map((day, index) => {
                    const dayTasks = getTasksForDay(day);
                    const isDayToday = isToday(day);

                    return (
                        <div
                            key={index}
                            className={`week-day ${isDayToday ? 'today' : ''}`}
                        >
                            <div className="week-day-header">
                                <div className="week-day-name">{format(day, 'EEE', { locale: es })}</div>
                                <div className="week-day-number">{format(day, 'd')}</div>
                            </div>
                            <div className="week-day-tasks">
                                {dayTasks.length > 0 ? (
                                    <>
                                        {dayTasks.slice(0, 2).map((task, i) => (
                                            <div
                                                key={i}
                                                className="week-task-indicator"
                                                style={{ backgroundColor: task.category?.color || '#8b5cf6' }}
                                                title={task.title}
                                                onClick={() => onTaskClick?.(task)}
                                            />
                                        ))}
                                        {dayTasks.length > 2 && (
                                            <div className="week-task-more">+{dayTasks.length - 2}</div>
                                        )}
                                    </>
                                ) : (
                                    <div className="week-no-tasks">-</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <Link to="/calendar" className="week-calendar-link">
                Ver calendario completo →
            </Link>
        </div>
    );
}
