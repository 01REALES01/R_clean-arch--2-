import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Bell, LogOut, LayoutDashboard, ListTodo, Tags, Shield } from 'lucide-react';
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
            <img src="/logo.png" alt="TaskFlow" className="nav-logo" />
            <span>TaskFlow</span>
          </Link>
          <div className="nav-links">
            <Link
              to="/dashboard"
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link
              to="/tasks"
              className={`nav-link ${isActive('/tasks') ? 'active' : ''}`}
            >
              <ListTodo size={18} /> Tareas
            </Link>
            <Link
              to="/categories"
              className={`nav-link ${isActive('/categories') ? 'active' : ''}`}
            >
              <Tags size={18} /> Categorías
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
              >
                <Shield size={18} /> Admin
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
                <Bell size={20} />
                <NotificationBadge />
              </button>
              <NotificationDropdown
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
              />
            </div>
            <button onClick={logout} className="btn-logout" title="Cerrar Sesión">
              <LogOut size={18} />
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

