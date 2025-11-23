import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import './NotificationBadge.css';

export default function NotificationBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const unreadCount = await apiService.getUnreadCount();
        setCount(unreadCount);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  if (count === 0) return null;

  return <span className="notification-badge">{count}</span>;
}

