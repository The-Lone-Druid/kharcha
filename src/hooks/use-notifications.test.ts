import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNotifications } from "./use-notifications";

// Mock the notification service
vi.mock("@/lib/notification-service", () => ({
  isNotificationSupported: vi.fn(() => true),
  getNotificationPermission: vi.fn(() => "default"),
  requestNotificationPermission: vi.fn(),
  showReminderNotification: vi.fn(),
  initializeNotifications: vi.fn(),
  shouldRequestPermission: vi.fn(() => true),
}));

import {
    getNotificationPermission,
    initializeNotifications,
    isNotificationSupported,
    requestNotificationPermission,
    shouldRequestPermission,
    showReminderNotification,
} from "@/lib/notification-service";

const mockIsSupported = isNotificationSupported as ReturnType<typeof vi.fn>;
const mockGetPermission = getNotificationPermission as ReturnType<typeof vi.fn>;
const mockRequestPermission = requestNotificationPermission as ReturnType<typeof vi.fn>;
const mockShowReminder = showReminderNotification as ReturnType<typeof vi.fn>;
const mockInitialize = initializeNotifications as ReturnType<typeof vi.fn>;
const mockShouldRequest = shouldRequestPermission as ReturnType<typeof vi.fn>;

describe("useNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsSupported.mockReturnValue(true);
    mockGetPermission.mockReturnValue("default");
    mockShouldRequest.mockReturnValue(true);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("initialization", () => {
    it("should return initial state", () => {
      const { result } = renderHook(() => useNotifications());

      expect(result.current.permission).toBe("default");
      expect(result.current.isSupported).toBe(true);
      expect(result.current.shouldPrompt).toBe(true);
      expect(typeof result.current.requestPermission).toBe("function");
      expect(typeof result.current.showNotification).toBe("function");
    });

    it("should initialize notifications when supported", () => {
      renderHook(() => useNotifications());

      expect(mockInitialize).toHaveBeenCalled();
    });

    it("should not initialize notifications when not supported", () => {
      mockIsSupported.mockReturnValue(false);

      renderHook(() => useNotifications());

      expect(mockInitialize).not.toHaveBeenCalled();
    });
  });

  describe("permission states", () => {
    it("should reflect granted permission", () => {
      mockGetPermission.mockReturnValue("granted");

      const { result } = renderHook(() => useNotifications());

      expect(result.current.permission).toBe("granted");
    });

    it("should reflect denied permission", () => {
      mockGetPermission.mockReturnValue("denied");

      const { result } = renderHook(() => useNotifications());

      expect(result.current.permission).toBe("denied");
    });
  });

  describe("requestPermission", () => {
    it("should request permission and update state", async () => {
      mockRequestPermission.mockResolvedValue("granted");

      const { result } = renderHook(() => useNotifications());

      let permission: string = "";
      await act(async () => {
        permission = await result.current.requestPermission();
      });

      expect(mockRequestPermission).toHaveBeenCalled();
      expect(permission).toBe("granted");
    });

    it("should return denied when not supported", async () => {
      mockIsSupported.mockReturnValue(false);

      const { result } = renderHook(() => useNotifications());

      let permission: string = "";
      await act(async () => {
        permission = await result.current.requestPermission();
      });

      expect(permission).toBe("denied");
      expect(mockRequestPermission).not.toHaveBeenCalled();
    });

    it("should handle permission denial", async () => {
      mockRequestPermission.mockResolvedValue("denied");

      const { result } = renderHook(() => useNotifications());

      let permission: string = "";
      await act(async () => {
        permission = await result.current.requestPermission();
      });

      expect(permission).toBe("denied");
    });
  });

  describe("showNotification", () => {
    it("should show notification when permission is granted", async () => {
      mockGetPermission.mockReturnValue("granted");
      mockShowReminder.mockResolvedValue(true);

      const { result } = renderHook(() => useNotifications());

      let success = false;
      await act(async () => {
        success = (await result.current.showNotification("Test message")) as boolean;
      });

      expect(mockShowReminder).toHaveBeenCalledWith("Test message", "renewal");
      expect(success).toBe(true);
    });

    it("should show notification with due type", async () => {
      mockGetPermission.mockReturnValue("granted");
      mockShowReminder.mockResolvedValue(true);

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.showNotification("Payment due", "due");
      });

      expect(mockShowReminder).toHaveBeenCalledWith("Payment due", "due");
    });

    it("should not show notification when permission is not granted", async () => {
      mockGetPermission.mockReturnValue("default");
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const { result } = renderHook(() => useNotifications());

      let success: boolean | undefined;
      await act(async () => {
        success = (await result.current.showNotification("Test message")) as boolean;
      });

      expect(mockShowReminder).not.toHaveBeenCalled();
      expect(success).toBe(false);

      consoleSpy.mockRestore();
    });

    it("should not show notification when permission is denied", async () => {
      mockGetPermission.mockReturnValue("denied");
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const { result } = renderHook(() => useNotifications());

      let success: boolean | undefined;
      await act(async () => {
        success = (await result.current.showNotification("Test message")) as boolean;
      });

      expect(success).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe("shouldPrompt", () => {
    it("should return true when permission can be requested", () => {
      mockShouldRequest.mockReturnValue(true);

      const { result } = renderHook(() => useNotifications());

      expect(result.current.shouldPrompt).toBe(true);
    });

    it("should return false when permission cannot be requested", () => {
      mockShouldRequest.mockReturnValue(false);

      const { result } = renderHook(() => useNotifications());

      expect(result.current.shouldPrompt).toBe(false);
    });
  });
});
