import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from '@/components/ui/notification';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification,
    };
    
    setNotifications(prev => [...prev, newNotification]);
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Métodos de conveniência
  const notify = {
    success: (title, message, duration) => 
      addNotification({ type: 'success', title, message, duration }),
    error: (title, message, duration) => 
      addNotification({ type: 'error', title, message, duration }),
    warning: (title, message, duration) => 
      addNotification({ type: 'warning', title, message, duration }),
    info: (title, message, duration) => 
      addNotification({ type: 'info', title, message, duration }),
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    notify,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Container de notificações */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {notifications.map(notification => (
          <div key={notification.id} className="pointer-events-auto">
            <Notification
              {...notification}
              onClose={removeNotification}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
