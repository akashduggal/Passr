import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { notificationService } from '../services/NotificationService';
import { addNotificationListeners } from '../services/PushNotificationService';
import userService from '../services/UserService';
import auth from '../services/firebaseAuth';
import { useNotificationsQuery, useMarkAsReadMutation, useMarkAllAsReadMutation, useDeleteNotificationMutation, notificationKeys } from '../hooks/queries/useNotificationQueries';
import { useQueryClient } from '@tanstack/react-query';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return subscriber;
  }, []);

  // Use TanStack Query
  // Pass enabled: !!user to only fetch when authenticated
  const { 
    data: notifications = [], 
    isLoading: loading, 
    refetch: fetchNotifications 
  } = useNotificationsQuery({ enabled: !!user });

  const markAsReadMutation = useMarkAsReadMutation();
  const markAllAsReadMutation = useMarkAllAsReadMutation();
  const deleteNotificationMutation = useDeleteNotificationMutation();

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  useEffect(() => {
    let removeListeners;

    if (user) {
      // Add listeners
      removeListeners = addNotificationListeners(
        async (notification) => {
          console.log('Push Notification Received:', notification);
          
          try {
            const content = notification.request.content;
            const data = content.data || {};
            
            const newNotification = {
              id: data.id || Date.now().toString(),
              type: data.type || 'message',
              title: content.title,
              body: content.body,
              createdAt: new Date().toISOString(),
              read: false,
              ...data
            };

            // Add to service (optional if backend handles it via push)
            // But if we want immediate local update without refetch, we can setQueryData
            // For now, let's just invalidate.
            // await notificationService.addNotification(newNotification);
            
            // Refresh in-app notifications
            queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
          } catch (error) {
            console.error('Error processing push notification:', error);
          }
        },
        null // We handle responses via useLastNotificationResponse hook
      );
    }

    return () => {
      if (removeListeners) removeListeners();
    };
  }, [user, queryClient]);

  const markAsRead = (id) => {
    markAsReadMutation.mutate(id);
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const deleteNotification = (id) => {
    deleteNotificationMutation.mutate(id);
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
        deleteNotification,
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
