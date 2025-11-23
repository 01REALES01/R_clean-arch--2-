import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationBadge from './NotificationBadge';
import NotificationDropdown from './NotificationDropdown';
import './Layout.css';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/dashboard" className="nav-brand">
            📋 TaskFlow
          </Link>
          <div className="nav-links">
            <Link
              to="/dashboard"
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link
              to="/tasks"
              className={`nav-link ${isActive('/tasks') ? 'active' : ''}`}
            >
              Tareas
            </Link>
            <Link
              to="/categories"
              className={`nav-link ${isActive('/categories') ? 'active' : ''}`}
            >
              Categorías
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
              >
                Admin
              </Link>
            )}
          </div>
          <div className="nav-user">
            <div className="user-info">
              <span className="user-email">{user?.email}</span>
              <span className="user-role">{user?.role}</span>
            </div>
            <div className="notification-icon-wrapper">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="btn-notification-icon"
                title="Notificaciones"
              >
                🔔
                <NotificationBadge />
              </button>
              <NotificationDropdown
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
              />
            </div>
            <button onClick={logout} className="btn-logout" title="Cerrar Sesión">
              <span style={{ fontSize: '1.2rem' }}>🚪</span>
            </button>
          </div>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

