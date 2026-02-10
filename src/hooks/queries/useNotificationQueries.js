import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../../services/NotificationService';
import auth from '../../services/firebaseAuth';

export const notificationKeys = {
  all: ['notifications'],
  list: () => [...notificationKeys.all, 'list'],
  unreadCount: () => [...notificationKeys.all, 'unreadCount'],
};

export function useNotificationsQuery() {
  const user = auth().currentUser;
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: async () => {
      const data = await notificationService.getNotifications();
      // Sort by date descending
      return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    // Refetch periodically to keep notifications fresh
    refetchInterval: 30000, 
    enabled: !!user,
  });
}

export function useUnreadCountQuery() {
  // We can either fetch separately or derive from the list query if it's already cached.
  // For now, let's fetch separately to be robust, or just rely on the list query if we use select.
  const user = auth().currentUser;
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationService.getUnreadCount(),
    // Sync with list
    enabled: !!user,
  });
}

export function useMarkAsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificationService.markAsRead(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() });

      // Snapshot previous value
      const previousNotifications = queryClient.getQueryData(notificationKeys.list());

      // Optimistically update
      if (previousNotifications) {
        queryClient.setQueryData(notificationKeys.list(), (old) => 
          old.map(n => n.id === id ? { ...n, read: true } : n)
        );
      }
      
      return { previousNotifications };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(notificationKeys.list(), context.previousNotifications);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}

export function useMarkAllAsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() });
      const previousNotifications = queryClient.getQueryData(notificationKeys.list());
      
      if (previousNotifications) {
        queryClient.setQueryData(notificationKeys.list(), (old) => 
          old.map(n => ({ ...n, read: true }))
        );
      }
      return { previousNotifications };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificationService.deleteNotification(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() });
      const previousNotifications = queryClient.getQueryData(notificationKeys.list());
      
      if (previousNotifications) {
        queryClient.setQueryData(notificationKeys.list(), (old) => 
          old.filter(n => n.id !== id)
        );
      }
      return { previousNotifications };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(notificationKeys.list(), context.previousNotifications);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}
