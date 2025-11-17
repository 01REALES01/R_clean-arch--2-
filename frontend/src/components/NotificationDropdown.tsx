import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { NotificationStatus } from '../types';
import type { Notification } from '../types';
import './NotificationDropdown.css';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const allNotifications = await apiService.getNotifications();
      // Mostrar solo las últimas 10
      setNotifications(allNotifications.slice(0, 10));
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

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteNotification(id);
      loadNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleViewAll = () => {
    onClose();
    navigate('/notifications');
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

  if (!isOpen) return null;

  return (
    <>
      <div className="notification-overlay" onClick={onClose} />
      <div className="notification-dropdown">
        <div className="notification-dropdown-header">
          <h3>Notificaciones</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="notification-dropdown-content">
          {loading ? (
            <div className="notification-loading">Cargando...</div>
          ) : notifications.length === 0 ? (
            <div className="notification-empty">
              <p>No hay notificaciones</p>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${
                    notification.status === NotificationStatus.PENDING ? 'unread' : ''
                  }`}
                >
                  <div className="notification-icon-small">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content-small">
                    <div className="notification-title-small">{notification.title}</div>
                    <div className="notification-message-small">{notification.message}</div>
                    <div className="notification-time">
                      {new Date(notification.createdAt).toLocaleString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div className="notification-actions-small">
                    {notification.status === NotificationStatus.PENDING && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="btn-mark-read"
                        title="Marcar como leída"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="btn-delete-notification"
                      title="Eliminar"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="notification-dropdown-footer">
            <button onClick={handleViewAll} className="btn-view-all">
              Ver todas las notificaciones
            </button>
          </div>
        )}
      </div>
    </>
  );
}

