/**
 * Cross-platform Web Notification Helper
 * Specially designed for iOS 16.4+ PWA (ServiceWorker registration.showNotification)
 * and Desktop/Android Web Notification API.
 */

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof Notification === 'undefined') {
    return 'denied';
  }
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch (e) {
    console.error('Failed to request notification permission:', e);
    return 'denied';
  }
}

export async function sendAppNotification(
  title: string,
  options: {
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
  }
): Promise<boolean> {
  try {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
      return false;
    }

    const iconUrl = options.icon || './icon-192.png';
    const badgeUrl = options.badge || './icon-192.png';

    // 1. Prioritize Service Worker registration.showNotification (MANDATORY on iOS 16.4+ PWA)
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        if (reg && 'showNotification' in reg) {
          await reg.showNotification(title, {
            body: options.body,
            icon: iconUrl,
            badge: badgeUrl,
            tag: options.tag || `timeblock-${Date.now()}`,
          });
          return true;
        }
      } catch (swErr) {
        console.warn('ServiceWorker showNotification failed, trying fallback:', swErr);
      }
    }

    // 2. Fallback to standard window Notification (Android / Desktop Chrome / Safari window)
    try {
      new Notification(title, {
        body: options.body,
        icon: iconUrl,
      });
      return true;
    } catch (winErr) {
      console.warn('Window Notification constructor failed:', winErr);
    }
  } catch (err) {
    console.error('sendAppNotification error:', err);
  }
  return false;
}
