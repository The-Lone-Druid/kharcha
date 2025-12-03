import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    getNotificationPermission,
    initializeNotifications,
    isNotificationSupported,
    requestNotificationPermission,
    shouldRequestPermission,
    showNotification,
    showReminderNotification,
} from "./notification-service";

describe("notification-service", () => {
  // Store original globals
  const originalNotification = globalThis.Notification;
  const originalNavigator = globalThis.navigator;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original globals
    Object.defineProperty(globalThis, "Notification", {
      value: originalNotification,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  describe("isNotificationSupported", () => {
    it("should return true when Notification and serviceWorker are available", () => {
      Object.defineProperty(globalThis, "Notification", {
        value: { permission: "default" },
        writable: true,
        configurable: true,
      });
      Object.defineProperty(globalThis, "navigator", {
        value: { serviceWorker: {} },
        writable: true,
        configurable: true,
      });

      expect(isNotificationSupported()).toBe(true);
    });

    it("should return false when Notification is not available", () => {
      Object.defineProperty(globalThis, "Notification", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      expect(isNotificationSupported()).toBe(false);
    });

    it("should return false when serviceWorker is not available", () => {
      Object.defineProperty(globalThis, "Notification", {
        value: { permission: "default" },
        writable: true,
        configurable: true,
      });
      Object.defineProperty(globalThis, "navigator", {
        value: {},
        writable: true,
        configurable: true,
      });

      expect(isNotificationSupported()).toBe(false);
    });
  });

  describe("getNotificationPermission", () => {
    it("should return 'denied' when notifications are not supported", () => {
      Object.defineProperty(globalThis, "Notification", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      expect(getNotificationPermission()).toBe("denied");
    });

    it("should return current permission when supported", () => {
      Object.defineProperty(globalThis, "Notification", {
        value: { permission: "granted" },
        writable: true,
        configurable: true,
      });
      Object.defineProperty(globalThis, "navigator", {
        value: { serviceWorker: {} },
        writable: true,
        configurable: true,
      });

      expect(getNotificationPermission()).toBe("granted");
    });

    it("should return default permission", () => {
      Object.defineProperty(globalThis, "Notification", {
        value: { permission: "default" },
        writable: true,
        configurable: true,
      });
      Object.defineProperty(globalThis, "navigator", {
        value: { serviceWorker: {} },
        writable: true,
        configurable: true,
      });

      expect(getNotificationPermission()).toBe("default");
    });
  });

  describe("requestNotificationPermission", () => {
    it("should return 'denied' when not supported", async () => {
      Object.defineProperty(globalThis, "Notification", {
        value: undefined,
        writable: true,
        configurable: true,
      });
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = await requestNotificationPermission();

      expect(result).toBe("denied");
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should return 'granted' when already granted", async () => {
      Object.defineProperty(globalThis, "Notification", {
        value: { permission: "granted" },
        writable: true,
        configurable: true,
      });
      Object.defineProperty(globalThis, "navigator", {
        value: { serviceWorker: {} },
        writable: true,
        configurable: true,
      });

      const result = await requestNotificationPermission();

      expect(result).toBe("granted");
    });

    it("should return 'denied' when already denied", async () => {
      Object.defineProperty(globalThis, "Notification", {
        value: { permission: "denied" },
        writable: true,
        configurable: true,
      });
      Object.defineProperty(globalThis, "navigator", {
        value: { serviceWorker: {} },
        writable: true,
        configurable: true,
      });

      const result = await requestNotificationPermission();

      expect(result).toBe("denied");
    });

    it("should request permission and return result", async () => {
      const mockRequestPermission = vi.fn().mockResolvedValue("granted");
      Object.defineProperty(globalThis, "Notification", {
        value: {
          permission: "default",
          requestPermission: mockRequestPermission,
        },
        writable: true,
        configurable: true,
      });
      Object.defineProperty(globalThis, "navigator", {
        value: { serviceWorker: {} },
        writable: true,
        configurable: true,
      });

      const result = await requestNotificationPermission();

      expect(mockRequestPermission).toHaveBeenCalled();
      expect(result).toBe("granted");
    });

    it("should handle permission request error", async () => {
      const mockRequestPermission = vi.fn().mockRejectedValue(new Error("Failed"));
      Object.defineProperty(globalThis, "Notification", {
        value: {
          permission: "default",
          requestPermission: mockRequestPermission,
        },
        writable: true,
        configurable: true,
      });
      Object.defineProperty(globalThis, "navigator", {
        value: { serviceWorker: {} },
        writable: true,
        configurable: true,
      });
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = await requestNotificationPermission();

      expect(result).toBe("denied");

      consoleSpy.mockRestore();
    });
  });

  describe("showNotification", () => {
    it("should return false when not supported", async () => {
      Object.defineProperty(globalThis, "Notification", {
        value: undefined,
        writable: true,
        configurable: true,
      });
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = await showNotification("Test");

      expect(result).toBe(false);

      consoleSpy.mockRestore();
    });

    it("should return false when permission not granted", async () => {
      Object.defineProperty(globalThis, "Notification", {
        value: { permission: "default" },
        writable: true,
        configurable: true,
      });
      Object.defineProperty(globalThis, "navigator", {
        value: { serviceWorker: {} },
        writable: true,
        configurable: true,
      });
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = await showNotification("Test");

      expect(result).toBe(false);

      consoleSpy.mockRestore();
    });

    it("should show notification via service worker when available", async () => {
      const mockShowNotification = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(globalThis, "Notification", {
        value: { permission: "granted" },
        writable: true,
        configurable: true,
      });
      Object.defineProperty(globalThis, "navigator", {
        value: {
          serviceWorker: {
            controller: {},
            ready: Promise.resolve({
              showNotification: mockShowNotification,
            }),
          },
        },
        writable: true,
        configurable: true,
      });

      const result = await showNotification("Test Title", { body: "Test body" });

      expect(result).toBe(true);
      expect(mockShowNotification).toHaveBeenCalledWith("Test Title", expect.objectContaining({
        body: "Test body",
        icon: "/pwa-192x192.png",
        badge: "/pwa-64x64.png",
      }));
    });

    it("should fall back to regular notification when no service worker controller", async () => {
      const MockNotification = vi.fn();
      Object.defineProperty(globalThis, "Notification", {
        value: Object.assign(MockNotification, { permission: "granted" }),
        writable: true,
        configurable: true,
      });
      Object.defineProperty(globalThis, "navigator", {
        value: {
          serviceWorker: {
            // no controller
          },
        },
        writable: true,
        configurable: true,
      });

      const result = await showNotification("Test Title");

      expect(result).toBe(true);
      expect(MockNotification).toHaveBeenCalledWith("Test Title", expect.objectContaining({
        icon: "/pwa-192x192.png",
        badge: "/pwa-64x64.png",
      }));
    });

    it("should handle notification error", async () => {
      Object.defineProperty(globalThis, "Notification", {
        value: { permission: "granted" },
        writable: true,
        configurable: true,
      });
      Object.defineProperty(globalThis, "navigator", {
        value: {
          serviceWorker: {
            controller: {},
            ready: Promise.reject(new Error("SW Error")),
          },
        },
        writable: true,
        configurable: true,
      });
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = await showNotification("Test");

      expect(result).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe("showReminderNotification", () => {
    it("should show renewal notification", async () => {
      const mockShowNotification = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(globalThis, "Notification", {
        value: { permission: "granted" },
        writable: true,
        configurable: true,
      });
      Object.defineProperty(globalThis, "navigator", {
        value: {
          serviceWorker: {
            controller: {},
            ready: Promise.resolve({
              showNotification: mockShowNotification,
            }),
          },
        },
        writable: true,
        configurable: true,
      });

      await showReminderNotification("Netflix renewal", "renewal");

      expect(mockShowNotification).toHaveBeenCalledWith(
        "🔄 Subscription Renewal",
        expect.objectContaining({
          body: "Netflix renewal",
          tag: "reminder-renewal",
          requireInteraction: true,
          silent: false,
        })
      );
    });

    it("should show due notification", async () => {
      const mockShowNotification = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(globalThis, "Notification", {
        value: { permission: "granted" },
        writable: true,
        configurable: true,
      });
      Object.defineProperty(globalThis, "navigator", {
        value: {
          serviceWorker: {
            controller: {},
            ready: Promise.resolve({
              showNotification: mockShowNotification,
            }),
          },
        },
        writable: true,
        configurable: true,
      });

      await showReminderNotification("Payment due tomorrow", "due");

      expect(mockShowNotification).toHaveBeenCalledWith(
        "💰 Payment Due",
        expect.objectContaining({
          body: "Payment due tomorrow",
          tag: "reminder-due",
        })
      );
    });
  });

  describe("shouldRequestPermission", () => {
    it("should return false when not supported", () => {
      Object.defineProperty(globalThis, "Notification", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      expect(shouldRequestPermission()).toBe(false);
    });

    it("should return true when permission is default", () => {
      Object.defineProperty(globalThis, "Notification", {
        value: { permission: "default" },
        writable: true,
        configurable: true,
      });
      Object.defineProperty(globalThis, "navigator", {
        value: { serviceWorker: {} },
        writable: true,
        configurable: true,
      });

      expect(shouldRequestPermission()).toBe(true);
    });

    it("should return false when permission is granted", () => {
      Object.defineProperty(globalThis, "Notification", {
        value: { permission: "granted" },
        writable: true,
        configurable: true,
      });
      Object.defineProperty(globalThis, "navigator", {
        value: { serviceWorker: {} },
        writable: true,
        configurable: true,
      });

      expect(shouldRequestPermission()).toBe(false);
    });

    it("should return false when permission is denied", () => {
      Object.defineProperty(globalThis, "Notification", {
        value: { permission: "denied" },
        writable: true,
        configurable: true,
      });
      Object.defineProperty(globalThis, "navigator", {
        value: { serviceWorker: {} },
        writable: true,
        configurable: true,
      });

      expect(shouldRequestPermission()).toBe(false);
    });
  });

  describe("initializeNotifications", () => {
    it("should log when not supported", async () => {
      Object.defineProperty(globalThis, "Notification", {
        value: undefined,
        writable: true,
        configurable: true,
      });
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await initializeNotifications();

      expect(consoleSpy).toHaveBeenCalledWith("Notifications not supported in this browser");

      consoleSpy.mockRestore();
    });

    it("should log permission and register listener when supported", async () => {
      const mockAddEventListener = vi.fn();
      Object.defineProperty(globalThis, "Notification", {
        value: { permission: "granted" },
        writable: true,
        configurable: true,
      });
      Object.defineProperty(globalThis, "navigator", {
        value: {
          serviceWorker: {
            addEventListener: mockAddEventListener,
          },
        },
        writable: true,
        configurable: true,
      });
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await initializeNotifications();

      expect(consoleSpy).toHaveBeenCalledWith("Notification permission:", "granted");
      expect(mockAddEventListener).toHaveBeenCalledWith("message", expect.any(Function));

      consoleSpy.mockRestore();
    });

    it("should handle notification click messages", async () => {
      type MessageHandler = (event: { data: unknown }) => void;
      let messageHandler: MessageHandler | null = null;
      const mockAddEventListener = vi.fn((event: string, handler: MessageHandler) => {
        if (event === "message") {
          messageHandler = handler;
        }
      });
      Object.defineProperty(globalThis, "Notification", {
        value: { permission: "granted" },
        writable: true,
        configurable: true,
      });
      Object.defineProperty(globalThis, "navigator", {
        value: {
          serviceWorker: {
            addEventListener: mockAddEventListener,
          },
        },
        writable: true,
        configurable: true,
      });
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await initializeNotifications();

      // Simulate notification click message
      expect(messageHandler).not.toBeNull();
      const handler = messageHandler as unknown as MessageHandler;
      handler({ data: { type: "NOTIFICATION_CLICKED", id: "123" } });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Notification clicked:",
        expect.objectContaining({ type: "NOTIFICATION_CLICKED" })
      );

      consoleSpy.mockRestore();
    });
  });
});
