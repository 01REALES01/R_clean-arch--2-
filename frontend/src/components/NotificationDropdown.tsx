import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Check, X, Trash2, Sparkles, FileEdit, Clock, AlertTriangle, BellOff } from 'lucide-react';
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

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(
        n => n.status === NotificationStatus.PENDING
      );
      await Promise.all(
        unreadNotifications.map(n => apiService.markNotificationAsRead(n.id))
      );
      loadNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleViewAll = () => {
    onClose();
    navigate('/notifications');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TASK_CREATED':
        return <Sparkles size={20} className="text-yellow-400" />;
      case 'TASK_UPDATED':
        return <FileEdit size={20} className="text-blue-400" />;
      case 'TASK_DELETED':
        return <Trash2 size={20} className="text-red-400" />;
      case 'TASK_DUE_SOON':
        return <Clock size={20} className="text-orange-400" />;
      case 'TASK_OVERDUE':
        return <AlertTriangle size={20} className="text-red-500" />;
      default:
        return <Bell size={20} />;
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="notification-overlay" onClick={onClose} />
      <div className="notification-dropdown">
        <div className="notification-dropdown-header">
          <h3>Notificaciones</h3>
          <div className="notification-header-actions">
            {notifications.some(n => n.status === NotificationStatus.PENDING) && (
              <button
                onClick={handleMarkAllAsRead}
                className="btn-mark-all-read"
                title="Marcar todas como leídas"
              >
                <Check size={16} /> Marcar todas
              </button>
            )}
            <button onClick={onClose} className="close-btn"><X size={20} /></button>
          </div>
        </div>

        <div className="notification-dropdown-content">
          {loading ? (
            <div className="notification-loading">Cargando...</div>
          ) : notifications.length === 0 ? (
            <div className="notification-empty">
              <BellOff size={48} style={{ opacity: 0.5 }} />
              <p>No hay notificaciones</p>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.status === NotificationStatus.PENDING ? 'unread' : ''
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
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="btn-delete-notification"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
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
    </>,
    document.body
  );
}

