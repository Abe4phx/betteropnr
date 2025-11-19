/**
 * Notification utilities for PWA push notifications
 */

export interface NotificationPermissionStatus {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

/**
 * Request notification permission from the user
 */
export const requestNotificationPermission = async (): Promise<NotificationPermissionStatus> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return { granted: false, denied: true, default: false };
  }

  const permission = await Notification.requestPermission();
  
  return {
    granted: permission === 'granted',
    denied: permission === 'denied',
    default: permission === 'default',
  };
};

/**
 * Get current notification permission status
 */
export const getNotificationPermissionStatus = (): NotificationPermissionStatus => {
  if (!('Notification' in window)) {
    return { granted: false, denied: true, default: false };
  }

  const permission = Notification.permission;
  
  return {
    granted: permission === 'granted',
    denied: permission === 'denied',
    default: permission === 'default',
  };
};

/**
 * Schedule a notification for a specific time
 */
export const scheduleNotification = (
  title: string,
  options: NotificationOptions & { scheduledTime: number },
  notificationId: string
): void => {
  const { scheduledTime, ...notificationOptions } = options;
  const now = Date.now();
  const delay = scheduledTime - now;

  if (delay <= 0) {
    // Time has passed, show immediately
    showNotification(title, notificationOptions);
    return;
  }

  // Store notification in localStorage
  const storedNotifications = getStoredNotifications();
  storedNotifications[notificationId] = {
    title,
    options: notificationOptions,
    scheduledTime,
  };
  localStorage.setItem('betterOpnr-notifications', JSON.stringify(storedNotifications));

  // Schedule the notification
  setTimeout(() => {
    showNotification(title, notificationOptions);
    removeStoredNotification(notificationId);
  }, delay);
};

/**
 * Show a notification immediately
 */
export const showNotification = (title: string, options?: NotificationOptions): void => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return;
  }

  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      ...options,
    });

    // Handle notification click
    notification.onclick = () => {
      window.focus();
      notification.close();
      
      // Navigate to the app if it's not focused
      if (options?.data?.url) {
        window.location.href = options.data.url;
      } else {
        window.location.href = '/';
      }
    };
  }
};

/**
 * Cancel a scheduled notification
 */
export const cancelNotification = (notificationId: string): void => {
  removeStoredNotification(notificationId);
};

/**
 * Get stored notifications from localStorage
 */
const getStoredNotifications = (): Record<string, any> => {
  const stored = localStorage.getItem('betterOpnr-notifications');
  return stored ? JSON.parse(stored) : {};
};

/**
 * Remove a stored notification
 */
const removeStoredNotification = (notificationId: string): void => {
  const storedNotifications = getStoredNotifications();
  delete storedNotifications[notificationId];
  localStorage.setItem('betterOpnr-notifications', JSON.stringify(storedNotifications));
};

/**
 * Initialize notifications system - reschedule any pending notifications
 */
export const initializeNotifications = (): void => {
  const storedNotifications = getStoredNotifications();
  const now = Date.now();

  Object.entries(storedNotifications).forEach(([id, notification]: [string, any]) => {
    const delay = notification.scheduledTime - now;
    
    if (delay <= 0) {
      // Show immediately if time has passed
      showNotification(notification.title, notification.options);
      removeStoredNotification(id);
    } else {
      // Reschedule
      setTimeout(() => {
        showNotification(notification.title, notification.options);
        removeStoredNotification(id);
      }, delay);
    }
  });
};
