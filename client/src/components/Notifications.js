import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../services/api';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsAPI.getAll();
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationsAPI.delete(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      info: '#3498db',
      success: '#27ae60',
      warning: '#f39c12',
      error: '#e74c3c'
    };
    return colors[type] || '#3498db';
  };

  if (loading) {
    return <div className="notifications-loading">Loading notifications...</div>;
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="notifications">
      <div className="notifications-header">
        <h1>Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead} className="btn-secondary">
            Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">No notifications</div>
      ) : (
        <div className="notifications-list">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
            >
              <div 
                className="notification-type-indicator"
                style={{ backgroundColor: getTypeColor(notification.type) }}
              />
              <div className="notification-content">
                <div className="notification-header">
                  <h3>{notification.title}</h3>
                  <span className="notification-type">{notification.type}</span>
                </div>
                <p className="notification-message">{notification.message}</p>
                <div className="notification-footer">
                  <span className="notification-date">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                  <div className="notification-actions">
                    {!notification.isRead && (
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="btn-small"
                      >
                        Mark as Read
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(notification.id)}
                      className="btn-small btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;

