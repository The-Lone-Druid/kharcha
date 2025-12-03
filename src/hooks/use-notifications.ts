import { useEffect, useState, useCallback } from "react";
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  showReminderNotification,
  initializeNotifications,
  shouldRequestPermission,
} from "@/lib/notification-service";
import type { NotificationPermission } from "@/lib/notification-service";

/**
 * Hook to manage browser notification permissions and display
 */
export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    getNotificationPermission()
  );
  const [isSupported] = useState(isNotificationSupported());

  // Initialize notifications on mount
  useEffect(() => {
    if (isSupported) {
      initializeNotifications();
    }
  }, [isSupported]);

  // Request permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      return "denied";
    }
    const newPermission = await requestNotificationPermission();
    setPermission(newPermission);
    return newPermission;
  }, [isSupported]);

  // Show a notification
  const showNotification = useCallback(
    async (message: string, type: "renewal" | "due" = "renewal") => {
      if (permission !== "granted") {
        console.warn("Cannot show notification: permission not granted");
        return false;
      }
      return showReminderNotification(message, type);
    },
    [permission]
  );

  // Check if we should prompt for permission
  const shouldPrompt = shouldRequestPermission();

  return {
    permission,
    isSupported,
    shouldPrompt,
    requestPermission,
    showNotification,
  };
}
