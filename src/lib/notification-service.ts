/**
 * Notification Service for PWA
 * Handles browser notifications, permission requests, and notification display
 */

export type NotificationPermission = "default" | "granted" | "denied";

/**
 * Check if the browser supports notifications
 */
export function isNotificationSupported(): boolean {
  return "Notification" in window && "serviceWorker" in navigator;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return "denied";
  }
  return Notification.permission as NotificationPermission;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    console.warn("Notifications are not supported in this browser");
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    return "denied";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission as NotificationPermission;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return "denied";
  }
}

/**
 * Show a browser notification
 */
export async function showNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: unknown;
    requireInteraction?: boolean;
    silent?: boolean;
  }
): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.warn("Notifications are not supported");
    return false;
  }

  const permission = getNotificationPermission();
  if (permission !== "granted") {
    console.warn("Notification permission not granted");
    return false;
  }

  try {
    // Use service worker if available for better reliability
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: "/pwa-192x192.png",
        badge: "/pwa-64x64.png",
        ...options,
      });
    } else {
      // Fallback to regular notification
      new Notification(title, {
        icon: "/pwa-192x192.png",
        badge: "/pwa-64x64.png",
        ...options,
      });
    }
    return true;
  } catch (error) {
    console.error("Error showing notification:", error);
    return false;
  }
}

/**
 * Show a reminder notification with default styling
 */
export async function showReminderNotification(
  message: string,
  type: "renewal" | "due" = "renewal"
): Promise<boolean> {
  const title = type === "renewal" ? "🔄 Subscription Renewal" : "💰 Payment Due";
  
  return showNotification(title, {
    body: message,
    tag: `reminder-${type}`,
    requireInteraction: true,
    silent: false,
  });
}

/**
 * Check if notification permission needs to be requested
 * Returns true if we should prompt the user
 */
export function shouldRequestPermission(): boolean {
  if (!isNotificationSupported()) {
    return false;
  }
  return Notification.permission === "default";
}

/**
 * Initialize notification service
 * Call this when the app loads
 */
export async function initializeNotifications(): Promise<void> {
  if (!isNotificationSupported()) {
    console.log("Notifications not supported in this browser");
    return;
  }

  console.log("Notification permission:", Notification.permission);

  // Register service worker notification click handler
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "NOTIFICATION_CLICKED") {
        console.log("Notification clicked:", event.data);
        // Handle notification click - could navigate to specific page
      }
    });
  }
}
