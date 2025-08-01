import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { NotificationMessage } from '@/types';

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<(NotificationMessage & { id: string })[]>([]);

  const addNotification = (notification: NotificationMessage) => {
    const id = Date.now().toString();
    const newNotification = {
      ...notification,
      id,
      duration: notification.duration || 5000
    };
    
    notifications.value.push(newNotification);
    
    // Auto remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, newNotification.duration);
    
    return id;
  };

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  };

  const clearAll = () => {
    notifications.value = [];
  };

  // Convenience methods for different notification types
  const success = (message: string, duration?: number) => {
    return addNotification({ type: 'success', message, duration });
  };

  const error = (message: string, duration?: number) => {
    return addNotification({ type: 'error', message, duration });
  };

  const warning = (message: string, duration?: number) => {
    return addNotification({ type: 'warning', message, duration });
  };

  const info = (message: string, duration?: number) => {
    return addNotification({ type: 'info', message, duration });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  };
});