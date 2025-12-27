import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { notificationsAPI } from '../services/api';
import { useEffect } from 'react';
import IvyIntelligence from './IvyIntelligence';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    // Fetch unread notifications count
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationsAPI.getUnreadCount();
        setUnreadCount(response.data.count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h1>IvyCRM</h1>
          <p className="user-info">{user?.firstName} {user?.lastName}</p>
          <p className="user-role">{user?.role}</p>
        </div>
        
        <ul className="nav-menu">
          <li>
            <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/crm" className={isActive('/crm') ? 'active' : ''}>
              CRM
            </Link>
          </li>
          <li>
            <Link to="/tms" className={isActive('/tms') ? 'active' : ''}>
              TMS
            </Link>
          </li>
          <li>
            <Link to="/meetings" className={isActive('/meetings') ? 'active' : ''}>
              Meeting Schedule
            </Link>
          </li>
          {isAdmin && (
            <li>
              <Link to="/users" className={isActive('/users') ? 'active' : ''}>
                Users
              </Link>
            </li>
          )}
          <li>
            <Link to="/notifications" className={isActive('/notifications') ? 'active' : ''}>
              Notifications
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </Link>
          </li>
        </ul>

        <button onClick={handleLogout} className="logout-button">
          Sign Out
        </button>
      </nav>

      <main className="main-content">
        {children}
      </main>

      {/* Ivy Intelligence AI Assistant */}
      {showAI && (
        <div className="ai-overlay" onClick={() => setShowAI(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <IvyIntelligence onClose={() => setShowAI(false)} />
          </div>
        </div>
      )}
      <button 
        onClick={() => setShowAI(true)} 
        className="ai-float-btn"
        title="Ivy Intelligence - Ask me anything!"
      >
        🧠
      </button>
    </div>
  );
};

export default Layout;

