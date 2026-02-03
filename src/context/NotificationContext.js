import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { notificationService } from '../services/NotificationService';
import { registerForPushNotificationsAsync, addNotificationListeners } from '../services/PushNotificationService';
import userService from '../services/UserService';
import auth from '../services/firebaseAuth';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return subscriber;
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      // Sort by date descending
      const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(sorted);
      
      const count = sorted.filter(n => !n.read).length;
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    let removeListeners;

    if (user) {
      // Register for push notifications
      registerForPushNotificationsAsync().then(token => {
        if (token) {
          console.log('Push Token obtained:', token);
          // Save token to user profile
          userService.updateUser({ expoPushToken: token }).catch(err => {
            // Ignore error if backend is not ready or mock
            console.log('Failed to sync push token (backend might be mock):', err);
          });
        }
      });

      // Add listeners
      removeListeners = addNotificationListeners(
        (notification) => {
          console.log('Push Notification Received:', notification);
          // Refresh in-app notifications if needed
          fetchNotifications();
        },
        (response) => {
          console.log('Push Notification Response:', response);
          // Handle navigation if needed
        }
      );
    }

    return () => {
      if (removeListeners) removeListeners();
    };
  }, [user, fetchNotifications]);

  const markAsRead = async (id) => {
    // Optimistic update
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await notificationService.markAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Revert if needed, but for read status it's usually fine
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
