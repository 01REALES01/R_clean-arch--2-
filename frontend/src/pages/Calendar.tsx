import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import {
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    format,
    isSameMonth,
    isToday,
    isSameDay,
    addMonths,
    subMonths,
    parseISO,
    startOfWeek,
    endOfWeek,
    addWeeks,
    subWeeks,
    addDays,
    subDays
} from 'date-fns';
import { es } from 'date-fns/locale';
import { apiService } from '../services/api';
import { Task, TaskStatus } from '../types';
import TaskDetailModal from '../components/TaskDetailModal';
import { renderCategoryIcon } from './Categories';
import ConfirmModal from '../components/ConfirmModal';
import './Calendar.css';
import './CalendarViews.css';

type CalendarView = 'day' | 'week' | 'month';

export default function Calendar() {
    const navigate = useNavigate();
    const [view, setView] = useState<CalendarView>('week'); // Default to week view
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean, id: string | null }>({ open: false, id: null });

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

    const handlePreviousMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const handleDayClick = (day: Date) => {
        setSelectedDate(day);
    };

    const handleTaskClick = async (task: Task) => {
        try {
            const fullTask = await apiService.getTask(task.id);
            setSelectedTask(fullTask);
        } catch (error) {
            console.error('Error loading task details:', error);
            setSelectedTask(task);
        }
    };

    const handleCloseModal = () => {
        setSelectedTask(null);
    };

    const handleEditTask = (taskId: string) => {
        navigate(`/tasks/${taskId}/edit`);
    };

    const handleDeleteTask = (taskId: string) => {
        setDeleteConfirm({ open: true, id: taskId });
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirm.id) return;

        try {
            await apiService.deleteTask(deleteConfirm.id);
            setSelectedTask(null);
            setDeleteConfirm({ open: false, id: null });
            loadTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Error al eliminar la tarea');
        }
    };

    const handleToggleComplete = async (taskId: string, currentStatus: TaskStatus) => {
        try {
            const newStatus = currentStatus === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED;
            await apiService.updateTask(taskId, { status: newStatus });
            setSelectedTask(null);
            loadTasks();
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Error al actualizar la tarea');
        }
    };

    const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
        // Optimistic update
        const updateTaskState = (taskList: Task[]) => {
            return taskList.map(t => {
                if (t.id === taskId) {
                    const updatedSubtasks = t.subtasks?.map(s => {
                        if (s.id === subtaskId) {
                            return { ...s, completed: !s.completed };
                        }
                        return s;
                    });
                    return { ...t, subtasks: updatedSubtasks };
                }
                return t;
            });
        };

        // Update local state immediately
        setTasks(prevTasks => updateTaskState(prevTasks));

        if (selectedTask && selectedTask.id === taskId) {
            setSelectedTask(prev => {
                if (!prev) return null;
                const updatedSubtasks = prev.subtasks?.map(s => {
                    if (s.id === subtaskId) {
                        return { ...s, completed: !s.completed };
                    }
                    return s;
                });
                return { ...prev, subtasks: updatedSubtasks };
            });
        }

        try {
            await apiService.toggleSubtask(taskId, subtaskId);
            const updatedTask = await apiService.getTask(taskId);

            setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? updatedTask : t));
            if (selectedTask && selectedTask.id === taskId) {
                setSelectedTask(updatedTask);
            }
        } catch (error) {
            console.error('Error toggling subtask:', error);
            loadTasks();
        }
    };

    // Get tasks for a specific day
    const getTasksForDay = (day: Date) => {
        return tasks.filter(task => {
            if (!task.dueDate) return false;
            const taskDate = typeof task.dueDate === 'string' ? parseISO(task.dueDate) : task.dueDate;
            return isSameDay(taskDate, day);
        });
    };

    // Get tasks for selected date
    const selectedDateTasks = selectedDate ? getTasksForDay(selectedDate) : [];

    // Generate calendar days
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Add padding days for calendar grid alignment
    const startDayOfWeek = monthStart.getDay();
    const paddingDays = Array.from({ length: startDayOfWeek }, (_, i) => {
        const date = new Date(monthStart);
        date.setDate(date.getDate() - (startDayOfWeek - i));
        return date;
    });

    const allDays = [...paddingDays, ...daysInMonth];

    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    if (loading) {
        return <div className="loading">Cargando calendario...</div>;
    }

    return (
        <div className="calendar-page">
            <div className="calendar-header">
                <h1><CalendarDays size={32} className="inline mr-2" />Calendario</h1>
                <div className="calendar-view-selector">
                    <button
                        className={`calendar-view-btn ${view === 'day' ? 'active' : ''}`}
                        onClick={() => setView('day')}
                    >
                        Día
                    </button>
                    <button
                        className={`calendar-view-btn ${view === 'week' ? 'active' : ''}`}
                        onClick={() => setView('week')}
                    >
                        Semana
                    </button>
                    <button
                        className={`calendar-view-btn ${view === 'month' ? 'active' : ''}`}
                        onClick={() => setView('month')}
                    >
                        Mes
                    </button>
                </div>
            </div>

            <div className="calendar-container">
                {/* Day View - Show one day with all tasks */}
                {view === 'day' && (
                    <>
                        <div className="calendar-nav">
                            <h2 className="calendar-month">
                                {format(selectedDate || new Date(), "d 'de' MMMM 'de' yyyy", { locale: es })}
                            </h2>
                            <div className="calendar-nav-buttons">
                                <button onClick={() => setSelectedDate(subDays(selectedDate || new Date(), 1))} className="calendar-nav-btn">
                                    <ChevronLeft size={20} />
                                    Anterior
                                </button>
                                <button onClick={() => setSelectedDate(addDays(selectedDate || new Date(), 1))} className="calendar-nav-btn">
                                    Siguiente
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="calendar-day-view">
                            {selectedDateTasks.length === 0 ? (
                                <div className="calendar-empty-state">
                                    <p>No hay tareas para este día</p>
                                </div>
                            ) : (
                                <div className="calendar-task-list">
                                    {selectedDateTasks.map(task => (
                                        <div
                                            key={task.id}
                                            className="calendar-task-item"
                                            onClick={() => handleTaskClick(task)}
                                        >
                                            <div className="calendar-task-title">{task.title}</div>
                                            <div className="calendar-task-meta">
                                                {task.category && (
                                                    <span
                                                        className="category-badge"
                                                        style={{
                                                            backgroundColor: `${task.category.color}20`,
                                                            color: task.category.color,
                                                            borderColor: `${task.category.color}40`,
                                                            padding: '0.1rem 0.5rem',
                                                            borderRadius: '9999px',
                                                            fontSize: '0.7rem',
                                                            border: '1px solid',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem'
                                                        }}
                                                    >
                                                        {renderCategoryIcon(task.category.icon, 12)} {task.category.name}
                                                    </span>
                                                )}
                                                <span className={`status-badge ${task.status.toLowerCase()}`}>
                                                    {task.status}
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
                    </>
                )}

                {/* Week View - Show 7 days horizontally */}
                {view === 'week' && (
                    <>
                        <div className="calendar-nav">
                            <h2 className="calendar-month">
                                {format(startOfWeek(currentMonth, { weekStartsOn: 0 }), "d 'de' MMMM", { locale: es })} - {format(endOfWeek(currentMonth, { weekStartsOn: 0 }), "d 'de' MMMM", { locale: es })}
                            </h2>
                            <div className="calendar-nav-buttons">
                                <button onClick={() => setCurrentMonth(subWeeks(currentMonth, 1))} className="calendar-nav-btn">
                                    <ChevronLeft size={20} />
                                    Anterior
                                </button>
                                <button onClick={() => setCurrentMonth(addWeeks(currentMonth, 1))} className="calendar-nav-btn">
                                    Siguiente
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="calendar-week-view">
                            {Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(currentMonth, { weekStartsOn: 0 }), i)).map((day, index) => {
                                const dayTasks = getTasksForDay(day);
                                const isDayToday = isToday(day);

                                return (
                                    <div key={index} className={`calendar-week-day ${isDayToday ? 'today' : ''}`}>
                                        <div className="calendar-week-day-header">
                                            <div className="calendar-week-day-name">{format(day, 'EEE', { locale: es })}</div>
                                            <div className="calendar-week-day-number">{format(day, 'd')}</div>
                                        </div>
                                        <div className="calendar-week-task-list">
                                            {dayTasks.length === 0 ? (
                                                <div className="calendar-week-empty">Sin tareas</div>
                                            ) : (
                                                dayTasks.map(task => (
                                                    <div
                                                        key={task.id}
                                                        className="calendar-week-task"
                                                        style={{ borderLeftColor: task.category?.color || '#8b5cf6' }}
                                                        onClick={() => handleTaskClick(task)}
                                                    >
                                                        {task.title}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Month View - Show full calendar grid */}
                {view === 'month' && (
                    <>
                        <div className="calendar-nav">
                            <h2 className="calendar-month">
                                {format(currentMonth, 'MMMM yyyy', { locale: es })}
                            </h2>
                            <div className="calendar-nav-buttons">
                                <button onClick={handlePreviousMonth} className="calendar-nav-btn">
                                    <ChevronLeft size={20} />
                                    Anterior
                                </button>
                                <button onClick={handleNextMonth} className="calendar-nav-btn">
                                    Siguiente
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="calendar-grid">
                            {weekDays.map(day => (
                                <div key={day} className="calendar-weekday">
                                    {day}
                                </div>
                            ))}
                            {allDays.map((day, index) => {
                                const dayTasks = getTasksForDay(day);
                                const isCurrentMonth = isSameMonth(day, currentMonth);
                                const isDayToday = isToday(day);
                                const isSelected = selectedDate && isSameDay(day, selectedDate);

                                return (
                                    <div
                                        key={index}
                                        className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isDayToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleDayClick(day)}
                                    >
                                        <div className="calendar-day-number">{format(day, 'd')}</div>
                                        {dayTasks.length > 0 && (
                                            <>
                                                <div className="calendar-task-indicators">
                                                    {dayTasks.slice(0, 3).map((task, i) => (
                                                        <div
                                                            key={i}
                                                            className="calendar-task-dot"
                                                            style={{ backgroundColor: task.category?.color || '#94a3b8' }}
                                                            title={task.title}
                                                        />
                                                    ))}
                                                </div>
                                                {dayTasks.length > 3 && (
                                                    <div className="calendar-task-count">+{dayTasks.length - 3}</div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Sidebar for month view */}
            {view === 'month' && selectedDate && (
                <div className="calendar-sidebar">
                    <h2>
                        {format(selectedDate, "d 'de' MMMM", { locale: es })}
                    </h2>
                    {selectedDateTasks.length === 0 ? (
                        <div className="calendar-empty-state">
                            <p>No hay tareas para este día</p>
                        </div>
                    ) : (
                        <div className="calendar-task-list">
                            {selectedDateTasks.map(task => (
                                <div
                                    key={task.id}
                                    className="calendar-task-item"
                                    onClick={() => handleTaskClick(task)}
                                >
                                    <div className="calendar-task-title">{task.title}</div>
                                    <div className="calendar-task-meta">
                                        {task.category && (
                                            <span
                                                className="category-badge"
                                                style={{
                                                    backgroundColor: `${task.category.color}20`,
                                                    color: task.category.color,
                                                    borderColor: `${task.category.color}40`,
                                                    padding: '0.1rem 0.5rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.7rem',
                                                    border: '1px solid',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem'
                                                }}
                                            >
                                                {renderCategoryIcon(task.category.icon, 12)} {task.category.name}
                                            </span>
                                        )}
                                        <span className={`status-badge ${task.status.toLowerCase()}`}>
                                            {task.status}
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
            )}

            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    onClose={handleCloseModal}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onToggleComplete={handleToggleComplete}
                    onToggleSubtask={handleToggleSubtask}
                />
            )}

            <ConfirmModal
                isOpen={deleteConfirm.open}
                title="Eliminar Tarea"
                message="¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer."
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteConfirm({ open: false, id: null })}
                confirmText="Eliminar"
                danger
            />
        </div>
    );
}
