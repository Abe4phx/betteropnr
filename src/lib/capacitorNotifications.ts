import { LocalNotifications } from '@capacitor/local-notifications';

export interface NotificationPermissionStatus {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

/**
 * Request notification permission (Capacitor)
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  try {
    const result = await LocalNotifications.requestPermissions();
    
    return {
      granted: result.display === 'granted',
      denied: result.display === 'denied',
      default: result.display === 'prompt'
    };
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return { granted: false, denied: true, default: false };
  }
}

/**
 * Get current notification permission status (Capacitor)
 */
export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  try {
    const result = await LocalNotifications.checkPermissions();
    
    return {
      granted: result.display === 'granted',
      denied: result.display === 'denied',
      default: result.display === 'prompt'
    };
  } catch (error) {
    console.error('Error checking notification permission:', error);
    return { granted: false, denied: false, default: true };
  }
}

/**
 * Schedule a notification (Capacitor)
 */
export async function scheduleNotification(
  title: string,
  options: { body?: string; scheduledTime: number },
  notificationId: string
): Promise<void> {
  try {
    const permission = await getNotificationPermissionStatus();
    if (!permission.granted) {
      console.warn('Notification permission not granted');
      return;
    }

    // Store notification metadata
    const scheduledNotifications = JSON.parse(
      localStorage.getItem('scheduled-notifications') || '{}'
    );
    scheduledNotifications[notificationId] = {
      title,
      body: options.body,
      scheduledTime: options.scheduledTime,
      id: parseInt(notificationId.replace(/\D/g, '').slice(0, 9)) || Date.now()
    };
    localStorage.setItem('scheduled-notifications', JSON.stringify(scheduledNotifications));

    // Schedule with Capacitor
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body: options.body || '',
          id: scheduledNotifications[notificationId].id,
          schedule: { at: new Date(options.scheduledTime) },
          sound: 'default',
          smallIcon: 'ic_stat_icon_config_sample'
        }
      ]
    });

    console.log(`Notification scheduled for ${new Date(options.scheduledTime)}`);
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}

/**
 * Show immediate notification (Capacitor)
 */
export async function showNotification(
  title: string,
  options?: { body?: string }
): Promise<void> {
  try {
    const permission = await getNotificationPermissionStatus();
    if (!permission.granted) return;

    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body: options?.body || '',
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 100) }
        }
      ]
    });
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

/**
 * Cancel a scheduled notification (Capacitor)
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    const scheduledNotifications = JSON.parse(
      localStorage.getItem('scheduled-notifications') || '{}'
    );
    
    const notification = scheduledNotifications[notificationId];
    if (notification) {
      await LocalNotifications.cancel({ notifications: [{ id: notification.id }] });
      delete scheduledNotifications[notificationId];
      localStorage.setItem('scheduled-notifications', JSON.stringify(scheduledNotifications));
      console.log(`Notification ${notificationId} cancelled`);
    }
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
}

/**
 * Initialize notification system (Capacitor)
 */
export async function initializeNotifications(): Promise<void> {
  try {
    // Check and reschedule pending notifications
    const scheduledNotifications = JSON.parse(
      localStorage.getItem('scheduled-notifications') || '{}'
    );
    
    const now = Date.now();
    
    for (const [notificationId, notification] of Object.entries(scheduledNotifications as Record<string, any>)) {
      if (notification.scheduledTime <= now) {
        // Remove expired notifications
        delete scheduledNotifications[notificationId];
      }
    }
    
    localStorage.setItem('scheduled-notifications', JSON.stringify(scheduledNotifications));
    console.log('Capacitor notifications initialized');
  } catch (error) {
    console.error('Error initializing Capacitor notifications:', error);
  }
}
