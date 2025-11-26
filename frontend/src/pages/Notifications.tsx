import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { NotificationStatus } from '../types';
import type { Notification } from '../types';
import ConfirmModal from '../components/ConfirmModal';
import './Notifications.css';

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean, id: string | null }>({ open: false, id: null });

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const status = filter !== 'all' ? filter : undefined;
      const allNotifications = await apiService.getNotifications(status);
      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiService.markNotificationAsRead(id);
      loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm({ open: true, id });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.id) return;

    try {
      await apiService.deleteNotification(deleteConfirm.id);
      setDeleteConfirm({ open: false, id: null });
      loadNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('Error al eliminar la notificación');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TASK_CREATED':
        return '✨';
      case 'TASK_UPDATED':
        return '📝';
      case 'TASK_DELETED':
        return '🗑️';
      case 'TASK_DUE_SOON':
        return '⏰';
      case 'TASK_OVERDUE':
        return '⚠️';
      default:
        return '🔔';
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notificaciones</h1>
      </div>

      <div className="notifications-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todas
        </button>
        <button
          className={`filter-btn ${filter === NotificationStatus.PENDING ? 'active' : ''}`}
          onClick={() => setFilter(NotificationStatus.PENDING)}
        >
          Pendientes
        </button>
        <button
          className={`filter-btn ${filter === NotificationStatus.READ ? 'active' : ''}`}
          onClick={() => setFilter(NotificationStatus.READ)}
        >
          Leídas
        </button>
      </div>

      {loading ? (
        <div className="loading">Cargando notificaciones...</div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <p>No hay notificaciones {filter !== 'all' ? 'con este filtro' : ''}</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${notification.status === NotificationStatus.PENDING ? 'unread' : ''
                }`}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <div className="notification-header">
                  <h3>{notification.title}</h3>
                  <span className="notification-type">{notification.type}</span>
                </div>
                <p className="notification-message">{notification.message}</p>
                <div className="notification-footer">
                  <small>
                    {new Date(notification.createdAt).toLocaleString('es-ES')}
                  </small>
                  {notification.status === NotificationStatus.PENDING && (
                    <span className="unread-badge">No leída</span>
                  )}
                </div>
              </div>
              <div className="notification-actions">
                {notification.status === NotificationStatus.PENDING && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="btn-icon"
                    title="Marcar como leída"
                  >
                    ✓
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="btn-icon"
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirm.open}
        title="Eliminar Notificación"
        message="¿Estás seguro de que deseas eliminar esta notificación? Esta acción no se puede deshacer."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
        confirmText="Eliminar"
        danger
      />
    </div>
  );
}

